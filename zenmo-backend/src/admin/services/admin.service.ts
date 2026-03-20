import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { Report, ReportDocument } from '../schemas/report.schema';
import { AdminAction, AdminActionDocument } from '../schemas/admin-action.schema';
import { AuditService } from './audit.service';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
        private auditService: AuditService,
    ) { }

    // ===== USERS MANAGEMENT =====

    async findAllUsers(query: any) {
        const { page = 1, limit = 20, search, role, banned, city } = query;
        const skip = (page - 1) * limit;

        const filter: any = {};

        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
            ];
        }

        if (role) filter.role = role;
        if (banned !== undefined) filter.isBanned = banned === 'true';
        if (city) filter.city = { $regex: city, $options: 'i' };

        const [users, total] = await Promise.all([
            this.userModel
                .find(filter)
                .select('+phoneNumber +role +isBanned +banReason') // Include hidden fields for admin
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .exec(),
            this.userModel.countDocuments(filter),
        ]);

        return {
            data: users,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getUserDetails(id: string) {
        const user = await this.userModel.findById(id).select('+phoneNumber +role +isBanned +banReason +bannedAt');
        if (!user) throw new NotFoundException('User not found');

        // Get related data (reports, actions)
        const reports = await this.reportModel.find({ targetId: id, targetType: 'user' }).limit(10);

        return {
            user,
            reports,
            // Add more stats here later
        };
    }

    async banUser(adminId: string, userId: string, reason: string, durationHours?: number) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        user.isBanned = true;
        user.banReason = reason;
        user.bannedAt = new Date();

        await user.save();

        // Log action
        await this.auditService.logAction(
            adminId,
            'BAN_USER',
            'user',
            userId,
            { reason, durationHours },
        );

        return user;
    }

    async unbanUser(adminId: string, userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        user.isBanned = false;
        user.banReason = undefined;
        user.bannedAt = undefined;

        await user.save();

        // Log action
        await this.auditService.logAction(
            adminId,
            'UNBAN_USER',
            'user',
            userId,
            {},
        );

        return user;
    }

    async updateUserRole(adminId: string, userId: string, newRole: string) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const oldRole = user.role;
        user.role = newRole;

        await user.save();

        // Log action
        await this.auditService.logAction(
            adminId,
            'UPDATE_ROLE',
            'user',
            userId,
            { oldRole, newRole },
        );

        return user;
    }
}
