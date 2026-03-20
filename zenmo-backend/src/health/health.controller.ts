import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
    constructor(@InjectConnection() private connection: Connection) { }

    @Get()
    getHealth() {
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
        };
    }

    @Get('db')
    getDatabaseHealth() {
        const dbState = this.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };

        return {
            status: dbState === 1 ? 'OK' : 'ERROR',
            state: states[dbState] || 'unknown',
            database: this.connection.name,
            host: this.connection.host,
            collections: Object.keys(this.connection.collections),
            timestamp: new Date().toISOString(),
        };
    }
}
