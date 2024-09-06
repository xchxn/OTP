// src/gateways/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
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
    this.redisClient = createClient({ url: 'redis://localhost:6379' });
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
    const receiverSocketId = this.redisClient.get(`user:${data.receiverId}`);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('dm', data);
    } else {
      console.log('Receiver is not connected');
    }
  }

  @SubscribeMessage('connectUser')
  async handleConnect(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    // this.connectedUsers.set(userId, client.id);
    await this.redisClient.set(`user:${userId}`, client.id);
  }

  @SubscribeMessage('disconnectUser')
  handleDisconnect(@ConnectedSocket() client: Socket): void {
    // this.connectedUsers.forEach(async (socketId, userId) => {
    //   if (socketId === client.id) {
    //     this.connectedUsers.delete(userId);
    //   }
    // });
    this.redisClient.keys('user:*').then((keys) => {
      keys.forEach(async (key) => {
        const socketId = await this.redisClient.get(key);
        if (socketId === client.id) {
          await this.redisClient.del(key);
        }
      });
    });
  }

  async getUserSessions(userId: string): Promise<string[]> {
    const pattern = `session:${userId}:*`;
    const keys = await this.redisClient.keys(pattern);
    console.log(keys);
    return keys;
  }
}
