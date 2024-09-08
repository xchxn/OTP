// src/gateways/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import Redis from 'ioredis';
import { createClient } from 'redis';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DMGateway {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>();
  private redisClient;

  constructor() {
    // this.redisClient = createClient({ url: 'redis://localhost:6379' });
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
    this.redisClient.connect().catch((err) => {
      console.error('Failed to connect to Redis:', err);
    });

    // Redis 클라이언트에 'error' 이벤트 핸들러 추가
    this.redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  @SubscribeMessage('dm')
  async handleDirectMessage(
    @MessageBody()
    data: { senderId: string; receiverId: string; message: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const receiverSocketId = await this.redisClient.get(
      `user:${data.receiverId}`,
    );

    // 메시지를 Redis에 저장하기 위한 키
    const messagesKey = `messages:${data.senderId}:${data.receiverId}`;
    // 메시지 저장
    await this.redisClient.rpush(
      messagesKey,
      JSON.stringify({
        message: data.message,
        timestamp: new Date().toISOString(),
      }),
    );

    // senderId와 receiverId 관계를 저장
    const senderReceiversKey = `senders:${data.senderId}:receivers`;
    await this.redisClient.sadd(senderReceiversKey, data.receiverId);

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('dm', data);
    } else {
      console.log('Receiver is not connected');
    }
  }

  @SubscribeMessage('getReceivers')
  async handleGetReceivers(
    @MessageBody() data: { senderId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const receivers = await this.getReceiversForSender(data.senderId);
    client.emit('receivers', receivers);
  }

  @SubscribeMessage('fetchMessages')
  async fetchMessages(
    @MessageBody()
    data: { userId: string; receiverId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const messagesKey = `messages:${data.userId}:${data.receiverId}`;
    let messages = await this.redisClient.lrange(messagesKey, 0, -1);
    messages = messages.map((message) => JSON.parse(message));

    client.emit('messages', messages);
  }

  @SubscribeMessage('connectUser')
  async handleConnect(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.redisClient.set(`user:${userId}`, client.id);
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket): void {
    this.redisClient.keys('user:*').then((keys) => {
      keys.forEach(async (key) => {
        const socketId = await this.redisClient.get(key);
        if (socketId === client.id) {
          await this.redisClient.del(key);
        }
      });
    });
  }

  async getReceiversForSender(senderId: string): Promise<string[]> {
    const receiverSetKey = `senders:${senderId}:receivers`;
    return await this.redisClient.smembers(receiverSetKey);
  }

  // async getUserSessions(userId: string): Promise<string[]> {
  //   const pattern = `session:${userId}:*`;
  //   const keys = await this.redisClient.keys(pattern);
  //   return keys;
  // }
}
