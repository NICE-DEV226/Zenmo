import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { LoginAttempt, LoginAttemptDocument } from './schemas/login-attempt.schema';
import { SecurityLogger } from '../common/security-logger.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

// Account lockout configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private securityLogger: SecurityLogger,
        @InjectModel(LoginAttempt.name) private loginAttemptModel: Model<LoginAttemptDocument>,
    ) { }

    async register(registerDto: RegisterDto) {
        // 1. Hash du mot de passe (Argon2)
        const hashedPassword = await argon2.hash(registerDto.password);

        // 2. Créer l'utilisateur
        const user = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
        });

        // 3. Générer les tokens
        const tokens = await this.generateTokens(user._id.toString(), user.username);

        // 4. Log security event
        this.securityLogger.logEvent({
            type: 'LOGIN_SUCCESS',
            userId: user._id.toString(),
            phoneNumber: registerDto.phoneNumber,
            details: { action: 'register' },
        });

        return {
            user: {
                id: user._id.toString(),
                username: user.username,
                totemId: user.totemId,
            },
            ...tokens,
        };
    }

    async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
        // 1. Hash du numéro pour recherche
        const phoneNumberHash = crypto
            .createHash('sha256')
            .update(loginDto.phoneNumber)
            .digest('hex');

        // 2. Check if account is locked
        await this.checkAccountLockout(phoneNumberHash, loginDto.phoneNumber);

        // 3. Trouver l'utilisateur (avec le password pour vérification)
        const user = await this.usersService.findByPhoneHashWithPassword(phoneNumberHash);
        if (!user) {
            await this.recordFailedAttempt(phoneNumberHash, ipAddress, userAgent);
            this.securityLogger.logEvent({
                type: 'LOGIN_FAILED',
                phoneNumber: loginDto.phoneNumber,
                ipAddress,
                details: { reason: 'user_not_found' },
            });
            throw new UnauthorizedException('Invalid credentials');
        }

        // 4. Vérifier le mot de passe (Argon2)
        const isPasswordValid = await argon2.verify(user.password, loginDto.password);
        if (!isPasswordValid) {
            await this.recordFailedAttempt(phoneNumberHash, ipAddress, userAgent);
            this.securityLogger.logEvent({
                type: 'LOGIN_FAILED',
                userId: user._id.toString(),
                phoneNumber: loginDto.phoneNumber,
                ipAddress,
                details: { reason: 'invalid_password' },
            });
            throw new UnauthorizedException('Invalid credentials');
        }

        // 5. Clear failed attempts on successful login
        await this.clearFailedAttempts(phoneNumberHash);

        // 6. Générer les tokens
        const tokens = await this.generateTokens(user._id.toString(), user.username);

        // 7. Log successful login
        this.securityLogger.logEvent({
            type: 'LOGIN_SUCCESS',
            userId: user._id.toString(),
            phoneNumber: loginDto.phoneNumber,
            ipAddress,
        });

        return {
            user: {
                id: user._id.toString(),
                username: user.username,
                totemId: user.totemId,
            },
            ...tokens,
        };
    }

    /**
     * Check if account is locked due to too many failed attempts
     */
    private async checkAccountLockout(phoneNumberHash: string, phoneNumber: string): Promise<void> {
        const cutoffTime = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000);

        const recentFailedAttempts = await this.loginAttemptModel.countDocuments({
            phoneNumberHash,
            successful: false,
            attemptedAt: { $gte: cutoffTime },
        });

        if (recentFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
            this.securityLogger.logEvent({
                type: 'ACCOUNT_LOCKED',
                phoneNumber,
                details: {
                    failedAttempts: recentFailedAttempts,
                    lockoutDuration: `${LOCKOUT_DURATION_MINUTES} minutes`,
                },
            });

            throw new ForbiddenException(
                `Account temporarily locked due to too many failed login attempts. Please try again in ${LOCKOUT_DURATION_MINUTES} minutes.`
            );
        }
    }

    /**
     * Record a failed login attempt
     */
    private async recordFailedAttempt(phoneNumberHash: string, ipAddress?: string, userAgent?: string): Promise<void> {
        await this.loginAttemptModel.create({
            phoneNumberHash,
            successful: false,
            ipAddress,
            userAgent,
            attemptedAt: new Date(),
        });
    }

    /**
     * Clear failed attempts after successful login
     */
    private async clearFailedAttempts(phoneNumberHash: string): Promise<void> {
        await this.loginAttemptModel.deleteMany({ phoneNumberHash });
    }

    private async generateTokens(userId: string, username: string) {
        const payload = { sub: userId, username };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '1h' }),
            this.jwtService.signAsync(payload, { expiresIn: '7d' }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string) {
        try {
            // Verify the refresh token
            const payload = await this.jwtService.verifyAsync(refreshToken);
            
            // Check if user still exists
            const user = await this.usersService.findOne(payload.sub);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Generate new tokens
            const tokens = await this.generateTokens(user._id.toString(), user.username);

            this.securityLogger.logEvent({
                type: 'LOGIN_SUCCESS',
                userId: user._id.toString(),
                details: { action: 'token_refreshed' },
            });

            return tokens;
        } catch (error) {
            this.securityLogger.logEvent({
                type: 'LOGIN_FAILED',
                details: { action: 'token_refresh_failed', error: error.message },
            });
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    /**
     * Send password reset email
     */
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const { email } = forgotPasswordDto;

        // Find user by email (note: email is not in schema, using phoneNumber as fallback)
        // For now, we'll just generate a token and log it
        // In production, you'd store this token in DB with expiry

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // TODO: Store resetTokenHash in user document with expiry (1 hour)
        // For now, we'll just log it
        console.log('Password reset token:', resetToken);
        console.log('Reset link:', `http://localhost:3000/reset-password?token=${resetToken}`);

        // Send email (simulated for now)
        await this.sendPasswordResetEmail(email, resetToken);

        this.securityLogger.logEvent({
            type: 'PASSWORD_RESET_REQUESTED',
            details: { email },
        });

        return {
            message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
        };
    }

    /**
     * Reset password with token
     */
    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;

        // Hash the token to compare with stored hash
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // TODO: Find user by resetTokenHash and check expiry
        // For now, this is a placeholder
        throw new BadRequestException('Token invalide ou expiré');

        // If valid:
        // const hashedPassword = await argon2.hash(newPassword);
        // Update user password
        // Clear reset token
        // return { message: 'Mot de passe réinitialisé avec succès' };
    }

    /**
     * Send password reset email using Nodemailer
     */
    private async sendPasswordResetEmail(email: string, token: string) {
        // Configure email transporter (using Gmail as example)
        // In production, use environment variables for credentials
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASSWORD || 'your-app-password',
            },
        });

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@zenmo.app',
            to: email,
            subject: 'Réinitialisation de ton mot de passe Zenmo',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #7C5EF6;">Réinitialisation de mot de passe</h2>
                    <p>Salut,</p>
                    <p>Tu as demandé à réinitialiser ton mot de passe Zenmo.</p>
                    <p>Clique sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #E4C66D; color: #0D0C1D; text-decoration: none; border-radius: 8px; margin: 20px 0;">Réinitialiser mon mot de passe</a>
                    <p>Ce lien expire dans 1 heure.</p>
                    <p>Si tu n'as pas demandé cette réinitialisation, ignore cet email.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 40px;">Zenmo - Ton réseau social afro</p>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Password reset email sent to:', email);
        } catch (error) {
            console.error('Error sending email:', error);
            // Don't throw error to avoid revealing if email exists
        }
    }

    // ==================== OTP METHODS ====================

    /**
     * Send OTP code via email
     */
    async sendOtp(sendOtpDto: SendOtpDto) {
        const { email } = sendOtpDto;

        // Find user by email
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            // Don't reveal if email exists or not (security)
            return { message: 'Si cet email est enregistré, un code OTP a été envoyé.' };
        }

        // Generate 6-digit OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user with OTP
        await this.usersService.updateOtp(user._id.toString(), otpCode, otpExpires);

        // Send email
        await this.sendOtpEmail(email, otpCode, user.username);

        this.securityLogger.logEvent({
            type: 'LOGIN_SUCCESS',
            userId: user._id.toString(),
            details: { action: 'otp_sent', email },
        });

        return { message: 'Code OTP envoyé par email.' };
    }

    /**
     * Verify OTP code
     */
    async verifyOtp(verifyOtpDto: VerifyOtpDto) {
        const { email, code } = verifyOtpDto;

        // Find user with OTP code
        const user = await this.usersService.findByEmailWithOtp(email);
        if (!user) {
            throw new BadRequestException('Email invalide');
        }

        // Check if OTP exists
        if (!user.otpCode || !user.otpExpires) {
            throw new BadRequestException('Aucun code OTP actif. Demandez un nouveau code.');
        }

        // Check if OTP expired
        if (new Date() > user.otpExpires) {
            throw new BadRequestException('Code OTP expiré. Demandez un nouveau code.');
        }

        // Verify code
        if (user.otpCode !== code) {
            throw new BadRequestException('Code OTP invalide');
        }

        // Mark email as verified and clear OTP
        await this.usersService.verifyEmail(user._id.toString());

        // Generate tokens
        const tokens = await this.generateTokens(user._id.toString(), user.username);

        this.securityLogger.logEvent({
            type: 'LOGIN_SUCCESS',
            userId: user._id.toString(),
            details: { action: 'otp_verified', email },
        });

        return {
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                totemId: user.totemId,
            },
            ...tokens,
        };
    }

    /**
     * Send OTP email using Nodemailer
     */
    private async sendOtpEmail(email: string, code: string, username: string) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASSWORD || 'your-app-password',
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@zenmo.app',
            to: email,
            subject: 'Ton code de vérification Zenmo',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #7C5EF6; font-size: 32px; margin: 0; letter-spacing: 3px;">ZENMO</h1>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #7C5EF6 0%, #5B43B8 100%); border-radius: 15px; padding: 30px; text-align: center;">
                        <h2 style="color: #FFFFFF; margin-top: 0;">Salut ${username} ! 👋</h2>
                        <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px;">Utilise ce code pour vérifier ton compte :</p>
                        
                        <div style="background: rgba(255, 255, 255, 0.2); border-radius: 10px; padding: 20px; margin: 20px 0;">
                            <div style="font-size: 48px; font-weight: bold; color: #E4C66D; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                ${code}
                            </div>
                        </div>
                        
                        <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-bottom: 0;">⏰ Ce code expire dans 10 minutes</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 10px;">
                        <p style="color: #666; font-size: 14px; margin: 0;">⚠️ Si tu n'as pas demandé ce code, ignore cet email.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
                        <p>Zenmo - Ton réseau social afro 🌍</p>
                    </div>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('✅ OTP email sent to:', email);
        } catch (error) {
            console.error('❌ Error sending OTP email:', error);
            throw new BadRequestException('Erreur lors de l\'envoi de l\'email');
        }
    }
}
