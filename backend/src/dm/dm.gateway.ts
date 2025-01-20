import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DmQueueService } from './dm.queue.service';
import { DmChatListService } from './dm.chat-list.service';

interface DirectMessage {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp?: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DmGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly dmQueueService: DmQueueService,
    private readonly dmChatListService: DmChatListService
  ) {}

  @SubscribeMessage('dm')
  async handleDirectMessage(
    @MessageBody() data: DirectMessage,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const messageData = {
        ...data,
        timestamp: new Date()
      };

      // 메시지를 큐에 추가
      await this.dmQueueService.enqueueMessage(messageData);
      
      return { status: 'queued' };
    } catch (error) {
      console.error('Error handling direct message:', error);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('get_chat_list')
  async handleGetChatList(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      const userId = client.data.userId;
      const chatList = await this.dmChatListService.getChatList(userId);
      return { status: 'success', chatList };
    } catch (error) {
      console.error('Error getting chat list:', error);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @MessageBody() data: { senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.userId;
      await this.dmQueueService.markAsRead(userId, data.senderId);
      return { status: 'success' };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('remove_chat')
  async handleRemoveChat(
    @MessageBody() data: { partnerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.userId;
      await this.dmChatListService.removeChatPartner(userId, data.partnerId);
      return { status: 'success' };
    } catch (error) {
      console.error('Error removing chat:', error);
      return { status: 'error', message: error.message };
    }
  }
}
