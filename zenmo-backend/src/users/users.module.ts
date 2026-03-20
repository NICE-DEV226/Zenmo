import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { ReverseContactBook, ReverseContactBookSchema } from './schemas/reverse-contact.schema';
import { UserDevice, UserDeviceSchema } from './schemas/user-device.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ReverseContactBook.name, schema: ReverseContactBookSchema },
      { name: UserDevice.name, schema: UserDeviceSchema },
    ]),
    NotificationsModule, // For push notifications
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export pour AuthModule
})
export class UsersModule { }
