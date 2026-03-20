import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OneSignal from 'onesignal-node';

export interface PushNotificationPayload {
  userIds: string[]; // OneSignal player IDs
  title: string;
  message: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actionButtons?: Array<{ id: string; text: string }>;
}

@Injectable()
export class NotificationsService {
  private oneSignalClient: OneSignal.Client;
  private appId: string;

  constructor(private configService: ConfigService) {
    this.appId = this.configService.get<string>('ONESIGNAL_APP_ID') || '';
    const apiKey = this.configService.get<string>('ONESIGNAL_API_KEY') || '';

    this.oneSignalClient = new OneSignal.Client(this.appId, apiKey);
  }

  /**
   * Send push notification to specific users
   */
  async sendNotification(payload: PushNotificationPayload): Promise<void> {
    try {
      const notification = {
        app_id: this.appId,
        include_player_ids: payload.userIds,
        headings: { en: payload.title },
        contents: { en: payload.message },
        data: payload.data || {},
        large_icon: payload.imageUrl || 'https://your-cdn.com/zemons.png', // Default Zenmo icon
        android_channel_id: 'zenmo-notifications',
        priority: 10,
      };

      if (payload.actionButtons) {
        notification['buttons'] = payload.actionButtons;
      }

      await this.oneSignalClient.createNotification(notification);
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  /**
   * Notify user when someone accepts their message request (Taper la porte)
   */
  async notifyMessageRequestAccepted(
    recipientPlayerId: string,
    senderUsername: string
  ): Promise<void> {
    await this.sendNotification({
      userIds: [recipientPlayerId],
      title: '🚪 Message Request Accepted',
      message: `${senderUsername} a accepté votre demande de message !`,
      data: {
        type: 'message_request_accepted',
        senderUsername,
      },
    });
  }

  /**
   * Notify user when they receive a new message
   */
  async notifyNewMessage(
    recipientPlayerId: string,
    senderUsername: string,
    messagePreview: string
  ): Promise<void> {
    await this.sendNotification({
      userIds: [recipientPlayerId],
      title: `💬 ${senderUsername}`,
      message: messagePreview,
      data: {
        type: 'new_message',
        senderUsername,
      },
    });
  }

  /**
   * Notify user when a contact joins Zenmo (ReverseContactBook)
   */
  async notifyFriendJoined(
    recipientPlayerId: string,
    newUserUsername: string,
    newUserAvatarUrl?: string
  ): Promise<void> {
    await this.sendNotification({
      userIds: [recipientPlayerId],
      title: '🎉 Ami sur Zenmo !',
      message: `${newUserUsername} vient de rejoindre Zenmo`,
      imageUrl: newUserAvatarUrl,
      data: {
        type: 'friend_joined',
        username: newUserUsername,
      },
      actionButtons: [
        { id: 'view_profile', text: 'Voir le profil' },
        { id: 'send_message', text: 'Envoyer un message' }
      ],
    });
  }

  /**
   * Notify user when someone likes their Vibe
   */
  async notifyVibeLiked(
    recipientPlayerId: string,
    likerUsername: string,
    vibeText: string
  ): Promise<void> {
    await this.sendNotification({
      userIds: [recipientPlayerId],
      title: `❤️ ${likerUsername} a aimé votre Vibe`,
      message: vibeText.substring(0, 50) + '...',
      data: {
        type: 'vibe_liked',
        likerUsername,
      },
    });
  }

  /**
   * Notify user when someone comments on their Vibe
   */
  async notifyVibeCommented(
    recipientPlayerId: string,
    commenterUsername: string,
    commentText: string,
    vibeId: string
  ): Promise<void> {
    await this.sendNotification({
      userIds: [recipientPlayerId],
      title: `💬 ${commenterUsername} a commenté`,
      message: commentText.substring(0, 50) + (commentText.length > 50 ? '...' : ''),
      data: {
        type: 'vibe_commented',
        commenterUsername,
        vibeId,
      },
    });
  }

  /**
   * Notify user when someone views their Story
   */
  async notifyStoryViewed(
    recipientPlayerId: string,
    viewerUsername: string
  ): Promise<void> {
    await this.sendNotification({
      userIds: [recipientPlayerId],
      title: '👁️ Story Vue',
      message: `${viewerUsername} a vu votre story`,
      data: {
        type: 'story_viewed',
        viewerUsername,
      },
    });
  }

  /**
   * Notify multiple users (broadcast)
   */
  async sendBroadcast(
    userIds: string[],
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    await this.sendNotification({
      userIds,
      title,
      message,
      data,
    });
  }
}
