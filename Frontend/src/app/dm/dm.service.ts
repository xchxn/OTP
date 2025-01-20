import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environments';

export interface DirectMessage {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp?: Date;
}

export interface ChatPartner {
  userId: string;
  username: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DmService {
  private socket!: Socket;
  apiUrl = environment.apiUrl;

  constructor() {
    // this.connect();
  }

  private connect(): void {
    this.socket = io(this.apiUrl, { 
      transports: ["websocket"],
      auth: {
        userId: localStorage.getItem('userId')
      }
    });

    this.socket.connect();

    this.socket.on('connect', () => {
      console.log('Connected to websocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from websocket server');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  // 메시지 전송
  sendMessage(message: DirectMessage): Observable<{ status: string; message?: string }> {
    return new Observable(observer => {
      this.socket.emit('dm', message, (response: { status: string; message?: string }) => {
        observer.next(response);
        observer.complete();
      });
    });
  }

  // 채팅 목록 조회
  getChatList(): Observable<{ status: string; chatList?: ChatPartner[]; message?: string }> {
    return new Observable(observer => {
      this.socket.emit('get_chat_list', (response: { status: string; chatList?: ChatPartner[]; message?: string }) => {
        observer.next(response);
        observer.complete();
      });
    });
  }

  // 실시간 메시지 수신
  onNewMessage(): Observable<DirectMessage> {
    return new Observable(observer => {
      this.socket.on('dm', (message: DirectMessage) => {
        observer.next(message);
      });
    });
  }

  // 채팅 목록 업데이트 수신
  onChatListUpdated(): Observable<void> {
    return new Observable(observer => {
      this.socket.on('chat_list_updated', () => {
        observer.next();
      });
    });
  }

  // 메시지 읽음 처리
  markAsRead(senderId: string): Observable<{ status: string; message?: string }> {
    return new Observable(observer => {
      this.socket.emit('mark_read', { senderId }, (response: { status: string; message?: string }) => {
        observer.next(response);
        observer.complete();
      });
    });
  }

  // 채팅방 삭제
  removeChat(partnerId: string): Observable<{ status: string; message?: string }> {
    return new Observable(observer => {
      this.socket.emit('remove_chat', { partnerId }, (response: { status: string; message?: string }) => {
        observer.next(response);
        observer.complete();
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}