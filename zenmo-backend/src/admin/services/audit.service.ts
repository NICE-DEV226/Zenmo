import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdminAction, AdminActionDocument } from '../schemas/admin-action.schema';

@Injectable()
export class AuditService {
    constructor(
        @InjectModel(AdminAction.name) private adminActionModel: Model<AdminActionDocument>,
    ) { }

    async logAction(
        adminId: string,
        action: string,
        targetType: string,
        targetId: string,
        metadata: any = {},
        ipAddress?: string,
        userAgent?: string,
    ) {
        try {
            await this.adminActionModel.create({
                adminId: new Types.ObjectId(adminId),
                action,
                targetType,
                targetId,
                metadata,
                ipAddress,
                userAgent,
            });
        } catch (error) {
            console.error('Failed to log admin action:', error);
            // Don't throw error to avoid blocking the main operation
        }
    }

    async getAdminActions(query: any) {
        const { page = 1, limit = 20, adminId, action, targetType } = query;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (adminId) filter.adminId = new Types.ObjectId(adminId);
        if (action) filter.action = action;
        if (targetType) filter.targetType = targetType;

        const [actions, total] = await Promise.all([
            this.adminActionModel
                .find(filter)
                .populate('adminId', 'username role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .exec(),
            this.adminActionModel.countDocuments(filter),
        ]);

        return {
            data: actions,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit),
            },
        };
    }
}
