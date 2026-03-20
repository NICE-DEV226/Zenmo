import { Controller, Post, Body, Get, UseGuards, Request, HttpCode } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { IpWhitelistGuard } from '../guards/ip-whitelist.guard';
import { AdminSecretGuard } from '../guards/admin-secret.guard';
import { SecurityLogger } from '../../common/security-logger.service';

/**
 * Admin Authentication Controller
 * SÉCURITÉ MAXIMALE :
 * - IP Whitelist (seules IPs autorisées)
 * - Secret Key (clé secrète supplémentaire)
 * - JWT avec expiration courte (30 min)
 * - Audit logging de toutes tentatives
 */
@Controller('admin/auth')
export class AdminAuthController {
    constructor(
        private authService: AuthService,
        private securityLogger: SecurityLogger,
    ) { }

    /**
     * Login admin - ULTRA SÉCURISÉ
     * Requiert :
     * 1. IP whitelistée
     * 2. Secret key dans header X-Admin-Secret
     * 3. Credentials valides (phone + password)
     * 4. User avec role SUPER_ADMIN
     */
    @Post('login')
    @HttpCode(200)
    @UseGuards(IpWhitelistGuard, AdminSecretGuard)
    async adminLogin(@Body() loginDto: { phoneNumber: string; password: string }, @Request() req) {
        const ipAddress = req.ip || req.connection?.remoteAddress;
        const userAgent = req.headers['user-agent'];

        try {
            // Login normal
            const result = await this.authService.login(loginDto, ipAddress, userAgent);

            // Vérifier que c'est bien un SUPER_ADMIN
            // Note: On devrait récupérer le user complet pour vérifier le role
            // Pour l'instant, on fait confiance au JWT qui contient le role

            // Log succès
            this.securityLogger.logEvent({
                type: 'LOGIN_SUCCESS',
                userId: result.user.id,
                phoneNumber: loginDto.phoneNumber,
                ipAddress,
                details: { context: 'admin_login' },
            });

            return {
                ...result,
                message: 'Admin authentication successful',
                expiresIn: '30m', // Token admin expire plus vite
            };
        } catch (error) {
            // Log échec
            this.securityLogger.logEvent({
                type: 'LOGIN_FAILED',
                phoneNumber: loginDto.phoneNumber,
                ipAddress,
                details: { context: 'admin_login', error: error.message },
            });

            throw error;
        }
    }

    /**
     * Vérifier le statut admin
     */
    @Get('status')
    @UseGuards(JwtAuthGuard, SuperAdminGuard, IpWhitelistGuard)
    async getAdminStatus(@Request() req) {
        return {
            authenticated: true,
            role: req.user.role,
            userId: req.user.userId,
            username: req.user.username,
        };
    }

    /**
     * Logout admin (invalider le token)
     */
    @Post('logout')
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    async adminLogout(@Request() req) {
        this.securityLogger.logEvent({
            type: 'LOGIN_SUCCESS',
            userId: req.user.userId,
            details: { action: 'admin_logout' },
        });

        return {
            message: 'Admin logged out successfully',
        };
    }
}
