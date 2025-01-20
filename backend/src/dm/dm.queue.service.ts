import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Redis } from 'ioredis';
import { redisConfig } from '../config/redis.config';

interface DirectMessage {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
}

@Injectable()
export class DmQueueService {
  private readonly redis: Redis;

  constructor(
    @InjectQueue('dm_queue') private dmQueue: Queue
  ) {
    this.redis = new Redis(redisConfig);
  }

  async enqueueMessage(message: DirectMessage) {
    try {
      await this.dmQueue.add('new_message', message, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: true
      });

      await this.redis.hincrby(`unread:${message.receiverId}`, message.senderId, 1);
      
      return true;
    } catch (error) {
      console.error('Failed to enqueue message:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string, senderId: string): Promise<number> {
    const count = await this.redis.hget(`unread:${userId}`, senderId);
    return parseInt(count || '0');
  }

  async markAsRead(userId: string, senderId: string) {
    await this.redis.hdel(`unread:${userId}`, senderId);
  }
}
