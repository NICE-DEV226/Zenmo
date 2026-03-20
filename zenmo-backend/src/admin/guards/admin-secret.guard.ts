import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Admin Secret Key Guard - Vérifie une clé secrète pour l'accès admin
 * SÉCURITÉ RENFORCÉE : Clé secrète en plus du JWT
 */
@Injectable()
export class AdminSecretGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        // Récupérer la clé secrète depuis le header
        const providedSecret = request.headers['x-admin-secret'];

        // Clé secrète configurée dans .env
        let adminSecret = this.configService.get<string>('ADMIN_SECRET_KEY');

        console.log(`[DEBUG] AdminSecretGuard - Provided: ${providedSecret}, Configured: ${adminSecret}`);

        if (!adminSecret) {
            // Fallback pour le développement si la clé n'est pas dans le .env
            console.warn('[SECURITY] ADMIN_SECRET_KEY not found in env. Using default dev key.');
            adminSecret = 'zenmo_admin_secret_key_2024_secure';
            console.log(`[DEBUG] AdminSecretGuard - Using fallback key: ${adminSecret}`);
        }

        if (!providedSecret || providedSecret !== adminSecret) {
            console.warn(`[SECURITY] Invalid admin secret key attempt from IP: ${request.ip}`);
            console.log(`[DEBUG] Mismatch! Provided: '${providedSecret}' vs Expected: '${adminSecret}'`);
            throw new UnauthorizedException('Invalid admin credentials');
        }

        return true;
    }
}
