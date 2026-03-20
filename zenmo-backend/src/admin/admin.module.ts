import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

// Controllers
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminContentController } from './controllers/admin-content.controller';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { AdminSystemController } from './controllers/admin-system.controller';
import { AdminConfigController } from './controllers/admin-config.controller';

// Services
import { AdminService } from './services/admin.service';
import { AuditService } from './services/audit.service';
import { ModerationService } from './services/moderation.service';
import { AnalyticsService } from './services/analytics.service';

// Schemas
import { Report, ReportSchema } from './schemas/report.schema';
import { AdminAction, AdminActionSchema } from './schemas/admin-action.schema';
import { FeatureFlag, FeatureFlagSchema } from './schemas/feature-flag.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Story, StorySchema } from '../stories/schemas/story.schema';
import { Vibe, VibeSchema } from '../vibes/schemas/vibe.schema';
import { Message, MessageSchema } from '../conversations/schemas/message.schema';

// Guards
import { AdminGuard } from './guards/admin.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { IpWhitelistGuard } from './guards/ip-whitelist.guard';
import { AdminSecretGuard } from './guards/admin-secret.guard';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Report.name, schema: ReportSchema },
            { name: AdminAction.name, schema: AdminActionSchema },
            { name: FeatureFlag.name, schema: FeatureFlagSchema },
            { name: User.name, schema: UserSchema },
            { name: Story.name, schema: StorySchema },
            { name: Vibe.name, schema: VibeSchema },
            { name: Message.name, schema: MessageSchema },
        ]),
        AuthModule,
        UsersModule,
        ConfigModule,
    ],
    controllers: [
        AdminAuthController,
        AdminUsersController,
        AdminContentController,
        AdminAnalyticsController,
        AdminSystemController,
        AdminConfigController,
    ],
    providers: [
        AdminService,
        AuditService,
        ModerationService,
        AnalyticsService,
        AdminGuard,
        SuperAdminGuard,
        IpWhitelistGuard,
        AdminSecretGuard,
    ],
    exports: [
        AdminService,
        AuditService,
        ModerationService,
        AnalyticsService,
    ],
})
export class AdminModule { }
