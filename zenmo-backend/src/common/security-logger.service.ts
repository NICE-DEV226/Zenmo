import { Injectable, Logger } from '@nestjs/common';

export interface SecurityEvent {
  type: 'LOGIN_FAILED' | 'LOGIN_SUCCESS' | 'ACCOUNT_LOCKED' | 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY' | 'PASSWORD_RESET_REQUESTED';
  userId?: string;
  phoneNumber?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

@Injectable()
export class SecurityLogger {
  private readonly logger = new Logger('Security');

  /**
   * Log security-related events
   */
  logEvent(event: SecurityEvent) {
    const timestamp = new Date().toISOString();
    const message = this.formatMessage(event);

    switch (event.type) {
      case 'LOGIN_FAILED':
      case 'ACCOUNT_LOCKED':
      case 'UNAUTHORIZED_ACCESS':
      case 'SUSPICIOUS_ACTIVITY':
        this.logger.warn(`[${timestamp}] ${message}`);
        break;
      case 'LOGIN_SUCCESS':
        this.logger.log(`[${timestamp}] ${message}`);
        break;
      default:
        this.logger.log(`[${timestamp}] ${message}`);
    }

    // In production, you would also:
    // - Send to external logging service (Sentry, Datadog, etc.)
    // - Store in database for audit trail
    // - Trigger alerts for critical events
  }

  private formatMessage(event: SecurityEvent): string {
    const parts: string[] = [event.type];

    if (event.userId) parts.push(`User: ${event.userId}`);
    if (event.phoneNumber) parts.push(`Phone: ${this.maskPhone(event.phoneNumber)}`);
    if (event.ipAddress) parts.push(`IP: ${event.ipAddress}`);
    if (event.details) {
      const detailsStr = typeof event.details === 'string'
        ? event.details
        : JSON.stringify(event.details);
      parts.push(`Details: ${detailsStr}`);
    }

    return parts.join(' | ');
  }

  private maskPhone(phone: string): string {
    // Mask phone number for privacy (show only last 4 digits)
    if (phone.length > 4) {
      return '*'.repeat(phone.length - 4) + phone.slice(-4);
    }
    return phone;
  }
}
