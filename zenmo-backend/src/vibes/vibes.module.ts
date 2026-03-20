import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VibesController } from './vibes.controller';
import { VibesService } from './vibes.service';
import { Vibe, VibeSchema } from './schemas/vibe.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';

import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Vibe.name, schema: VibeSchema },
            { name: Comment.name, schema: CommentSchema },
        ]),
        NotificationsModule,
        UsersModule,
    ],
    controllers: [VibesController],
    providers: [VibesService],
    exports: [VibesService],
})
export class VibesModule { }
