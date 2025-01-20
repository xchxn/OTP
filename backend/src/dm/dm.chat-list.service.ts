import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { redisConfig } from '../config/redis.config';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';

interface ChatPartner {
  userId: string;
  username: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

interface DirectMessage {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
}

@Injectable()
export class DmChatListService {
  private readonly redis: Redis;
  
  constructor(
    @Inject('AUTH_REPOSITORY')
    private authRepository: Repository<AuthEntity>,
  ) {
    this.redis = new Redis(redisConfig);
  }

  private getChatListKey(userId: string): string {
    return `chat_list:${userId}`;
  }

  async updateChatList(message: DirectMessage) {
    const { senderId, receiverId, message: content } = message;
    
    await this.redis.zadd(
      this.getChatListKey(senderId),
      Date.now(),
      receiverId
    );

    await this.redis.zadd(
      this.getChatListKey(receiverId),
      Date.now(),
      senderId
    );

    const lastMessageKey = `last_message:${senderId}:${receiverId}`;
    await this.redis.hmset(lastMessageKey, {
      content,
      timestamp: Date.now().toString(),
      senderId
    });
  }

  async getChatList(userId: string): Promise<ChatPartner[]> {
    const chatPartnerIds = await this.redis.zrevrange(
      this.getChatListKey(userId),
      0,
      -1
    );

    const chatList: ChatPartner[] = [];

    for (const partnerId of chatPartnerIds) {
      const [userInfo, lastMessage, unreadCount] = await Promise.all([
        this.getUserInfo(partnerId),
        this.getLastMessage(userId, partnerId),
        this.getUnreadCount(userId, partnerId)
      ]);

      chatList.push({
        userId: partnerId,
        username: userInfo.username,
        lastMessage: lastMessage.content,
        lastMessageTime: new Date(parseInt(lastMessage.timestamp)),
        unreadCount: parseInt(unreadCount || '0')
      });
    }

    return chatList;
  }

  private async getLastMessage(userId1: string, userId2: string) {
    const key1 = `last_message:${userId1}:${userId2}`;
    const key2 = `last_message:${userId2}:${userId1}`;
    
    const [message1, message2] = await Promise.all([
      this.redis.hgetall(key1),
      this.redis.hgetall(key2)
    ]);

    return message1.timestamp > message2.timestamp ? message1 : message2;
  }

  private async getUserInfo(userId: string) {
    const userKey = `user:${userId}`;
    let userInfo: any = await this.redis.hgetall(userKey);

    if (!userInfo.userId) {
      userInfo = await this.authRepository.findOne({ where: { id: userId } });
      await this.redis.hmset(userKey, userInfo);
      await this.redis.expire(userKey, 3600);
    }

    return userInfo;
  }

  private async getUnreadCount(userId: string, partnerId: string): Promise<string> {
    return await this.redis.hget(`unread:${userId}`, partnerId) || '0';
  }

  async removeChatPartner(userId: string, partnerId: string) {
    await Promise.all([
      this.redis.zrem(this.getChatListKey(userId), partnerId),
      this.redis.del(`last_message:${userId}:${partnerId}`),
      this.redis.del(`unread:${userId}:${partnerId}`)
    ]);
  }
}
