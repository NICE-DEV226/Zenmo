import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * IP Whitelist Guard - Restreint l'accès admin à des IPs spécifiques
 * SÉCURITÉ MAXIMALE : Seules les IPs autorisées peuvent accéder aux routes admin
 */
@Injectable()
export class IpWhitelistGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        // Récupérer l'IP du client
        const clientIp = this.getClientIp(request);

        // Liste des IPs autorisées (depuis .env)
        const allowedIps = this.configService.get<string>('ADMIN_ALLOWED_IPS')?.split(',') || [];

        // Si aucune IP configurée, bloquer tout (fail-safe)
        if (allowedIps.length === 0) {
            throw new ForbiddenException('Admin access is not configured');
        }

        // Vérifier si l'IP est autorisée
        if (!allowedIps.includes(clientIp)) {
            // Log de tentative d'accès non autorisée
            console.warn(`[SECURITY] Unauthorized admin access attempt from IP: ${clientIp}`);
            throw new ForbiddenException('Access denied from this IP address');
        }

        return true;
    }

    private getClientIp(request: any): string {
        // Essayer différentes sources pour l'IP (proxy, direct, etc.)
        return (
            request.headers['x-forwarded-for']?.split(',')[0] ||
            request.headers['x-real-ip'] ||
            request.connection?.remoteAddress ||
            request.socket?.remoteAddress ||
            request.ip ||
            'unknown'
        );
    }
}
