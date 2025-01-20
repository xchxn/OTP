import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { DmChatListService } from './dm.chat-list.service';
import { Redis } from 'ioredis';
import { redisConfig } from '../config/redis.config';

@WebSocketGateway()
@Processor('dm_queue')
export class DmProcessor {
  @WebSocketServer()
  server: Server;
  private readonly redis: Redis;

  constructor(
    private readonly dmChatListService: DmChatListService
  ) {
    this.redis = new Redis(redisConfig);
  }

  @Process('new_message')
  async handleNewMessage(job: Job) {
    const message = job.data;

    try {
      // 메시지 Redis에 저장
      const chatKey = [message.senderId, message.receiverId].sort().join(':');
      const messagesKey = `messages:chat:${chatKey}`;
      await this.redis.rpush(messagesKey, JSON.stringify(message));
      
      // 채팅 목록 업데이트
      await this.dmChatListService.updateChatList(message);

      // 수신자 온라인 상태 확인
      const receiverSocketId = await this.redis.get(`user:${message.receiverId}`);
      const isOnline = !!receiverSocketId;

      if (isOnline) {
        // WebSocket으로 실시간 전송
        this.server.to(receiverSocketId).emit('dm', message);
        // 채팅 목록 업데이트 알림
        this.server.to(receiverSocketId).emit('chat_list_updated');
      } else {
        // 푸시 알림 발송
        await this.sendPushNotification(message);
      }

      return true;
    } catch (error) {
      console.error('Failed to process message:', error);
      throw error;
    }
  }

  private async sendPushNotification(message: any) {
    // TODO: 푸시 알림 서비스 구현
    console.log('Push notification sent:', message);
  }
}
