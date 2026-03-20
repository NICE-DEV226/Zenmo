import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { ReverseContactBook, ReverseContactBookDocument } from './schemas/reverse-contact.schema';
import { UserDevice, UserDeviceDocument } from './schemas/user-device.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ReverseContactBook.name) private reverseContactModel: Model<ReverseContactBookDocument>,
    @InjectModel(UserDevice.name) private userDeviceModel: Model<UserDeviceDocument>,
    private notificationsService: NotificationsService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // 1. Hash du numéro de téléphone (SHA-256) pour la confidentialité
    const phoneNumberHash = crypto
      .createHash('sha256')
      .update(createUserDto.phoneNumber)
      .digest('hex');

    // 2. Génération du Totem ID (Deep Link)
    const totemId = uuidv4();

    try {
      const createdUser = new this.userModel({
        ...createUserDto,
        phoneNumberHash,
        totemId,
      });
      return await createdUser.save();
    } catch (error: any) {
      if (error.code === 11000) {
        if (error.keyPattern?.phoneNumber) {
          throw new ConflictException('Phone number already exists');
        }
        if (error.keyPattern?.username) {
          throw new ConflictException('Username already taken');
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string, currentUserId?: string): Promise<any | null> {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) return null;

    let isFollowing = false;
    if (currentUserId) {
      const currentUser = await this.userModel.findById(currentUserId).select('contacts').lean().exec();
      if (currentUser && currentUser.contacts) {
        isFollowing = currentUser.contacts.some((contactId: any) => contactId.toString() === id);
      }
    }

    return {
      ...user,
      isFollowing,
      followersCount: 0, // Placeholder until we implement real followers count
      followingCount: user.contacts?.length || 0
    };
  }

  async findByPhoneHash(hash: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phoneNumberHash: hash }).exec();
  }

  async findByPhoneHashWithPassword(hash: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phoneNumberHash: hash }).select('+password').exec();
  }

  async findByTotem(totemId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ totemId }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByPhone(phoneNumber: string): Promise<UserDocument | null> {
    // Note: We usually search by hash, but for seeding/admin we might need this if we don't have the hash handy
    // But wait, phoneNumber is select: false and hashed. We can't search by phoneNumber directly easily if it's not indexed/stored plain text for search?
    // Actually, phoneNumber IS stored but select: false. So we can query it.
    return this.userModel.findOne({ phoneNumber }).exec();
  }

  async search(query: string): Promise<UserDocument[]> {
    return this.userModel
      .find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .exec();
  }

  async syncContacts(hashes: string[], requestingUserId: string): Promise<any[]> {
    // 1. Update Reverse Contact Book
    const bulkOps = hashes.map(hash => ({
      updateOne: {
        filter: { _id: hash },
        update: { $addToSet: { importedBy: requestingUserId } },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await this.reverseContactModel.bulkWrite(bulkOps);
    }

    // 2. Find matching users who allow discovery
    const users = await this.userModel.find({
      phoneNumberHash: { $in: hashes },
      'privacySettings.discoverableByPhone': true,
    })
      .select('username displayName avatarUrl vibe totemId')
      .exec();

    return users;
  }

  /**
   * Register device for push notifications
   */
  async registerDevice(userId: string, registerDeviceDto: RegisterDeviceDto): Promise<UserDeviceDocument> {
    const existingDevice = await this.userDeviceModel.findOne({
      userId,
      oneSignalPlayerId: registerDeviceDto.oneSignalPlayerId,
    });

    if (existingDevice) {
      // Update existing device
      existingDevice.platform = registerDeviceDto.platform;
      existingDevice.deviceModel = registerDeviceDto.deviceModel;
      existingDevice.appVersion = registerDeviceDto.appVersion;
      existingDevice.lastActiveAt = new Date();
      return existingDevice.save();
    }

    // Create new device
    const device = new this.userDeviceModel({
      userId,
      ...registerDeviceDto,
      lastActiveAt: new Date(),
    });

    return device.save();
  }

  /**
   * Get user's OneSignal Player IDs (for notifications)
   */
  async getUserPlayerIds(userId: string): Promise<string[]> {
    const devices = await this.userDeviceModel.find({ userId }).exec();
    return devices.map(device => device.oneSignalPlayerId);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  // ==================== OTP METHODS ====================

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailWithOtp(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+otpCode +otpExpires').exec();
  }

  async updateOtp(userId: string, otpCode: string, otpExpires: Date): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      otpCode,
      otpExpires,
    });
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      emailVerified: true,
      otpCode: undefined,
      otpExpires: undefined,
    });
  }

  // ==================== SOCIAL METHODS ====================

  async follow(currentUserId: string, targetUserId: string): Promise<void> {
    if (currentUserId === targetUserId) {
      throw new ConflictException('You cannot follow yourself');
    }

    const targetUser = await this.userModel.findById(targetUserId);
    if (!targetUser) throw new NotFoundException('User not found');

    // Add to following of current user
    await this.userModel.findByIdAndUpdate(currentUserId, {
      $addToSet: { contacts: targetUserId } // Using contacts as following for now
    });

    // Add to followers of target user (if we had a followers field, but we use contacts/reverse contacts)
    // For now, we just ensure the contact link exists
  }

  async unfollow(currentUserId: string, targetUserId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(currentUserId, {
      $pull: { contacts: targetUserId }
    });
  }

  async updateProfile(userId: string, updateProfileDto: any): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, updateProfileDto, { new: true }).exec();
  }
}
