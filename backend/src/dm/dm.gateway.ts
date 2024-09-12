// src/gateways/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import Redis from 'ioredis';
// import { createClient } from 'redis';
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

    // 반대의 경우도 저장
    // 즉, 받는 사람 측에서도 dm목록을 조회할 수 이도록 redis Key로 저장
    const receiverSendersKey = `receivers:${data.receiverId}:senders`;
    await this.redisClient.sadd(receiverSendersKey, data.senderId);

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('dm', data);
    } else {
      // console.log('Receiver is not connected');

      // 오프라인 유저의 메시지 저장
      const messagesKey = `messages:pending:${data.receiverId}`;
      await this.redisClient.rpush(
        messagesKey,
        JSON.stringify({
          senderId: data.senderId,
          receiverId: data.receiverId,
          message: data.message,
          timestamp: new Date().toISOString(),
        }),
      );
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
    data: { senderId: string; receiverId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    // 사용자가 보낸 메시지 키
    const sentMessagesKey = `messages:${data.senderId}:${data.receiverId}`;
    // 사용자가 받은 메시지 키
    const receivedMessagesKey = `messages:${data.receiverId}:${data.senderId}`;

    // 사용자가 보낸 메시지 조회
    let sentMessages = await this.redisClient.lrange(sentMessagesKey, 0, -1);
    sentMessages = sentMessages.map((message) => {
      const sendmsg = JSON.parse(message);
      return {
        ...sendmsg,
        senderId: data.senderId,
        receiverId: data.receiverId,
      };
    });

    // 사용자가 받은 메시지 조회
    let receivedMessages = await this.redisClient.lrange(
      receivedMessagesKey,
      0,
      -1,
    );
    receivedMessages = receivedMessages.map((message) => {
      const sendmsg = JSON.parse(message);
      return {
        ...sendmsg,
        senderId: data.receiverId,
        receiverId: data.senderId,
      };
    });

    // 메시지들을 시간순으로 정렬
    const allMessages = sentMessages.concat(receivedMessages);
    allMessages.sort(
      (a, b) =>
        safeDateParse(a.timestamp).getTime() -
        safeDateParse(b.timestamp).getTime(),
    );

    // console.log(allMessages);
    client.emit('dm', allMessages);
  }

  @SubscribeMessage('connectUser')
  async handleConnect(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    await this.redisClient.set(`user:${userId}`, client.id);

    // 오프라인 유저를 위한 메시지 펜딩 기능
    const messagesKey = `messages:pending:${userId}`;
    const messages = await this.redisClient.lrange(messagesKey, 0, -1);
    console.log(messages);
    if (messages.length > 0) {
      messages.forEach(async (message) => {
        client.emit('dm', JSON.parse(message));
      });

      await this.redisClient.del(messagesKey);
    }
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
    // 내가 메시지를 보낸 사람
    const receiverSetKey = `senders:${senderId}:receivers`;
    // 나에게 메시지를 보낸 사람
    const senderSetKey = `receivers:${senderId}:senders`;

    // 두 목록을 Redis에서 비동기적으로 가져오기
    const [receivers, senders] = await Promise.all([
      this.redisClient.smembers(receiverSetKey),
      this.redisClient.smembers(senderSetKey),
    ]);

    // Set 객체를 사용하여 중복을 제거하고 배열로 변환
    const uniqueContacts = new Set([...receivers, ...senders]);
    return Array.from(uniqueContacts);
    // return await this.redisClient.smembers(receiverSetKey);
  }
}
function safeDateParse(dateString: string): Date {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date(0) : date; // 유효하지 않은 날짜는 기본값으로 처리
}
