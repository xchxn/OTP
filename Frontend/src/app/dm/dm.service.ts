import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class DmService {
  private socket!: Socket;
  private url = 'http://localhost:3000';  // WebSocket 서버 URL

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {
    this.connect(this.cookieService.get('kakaoId'));
  }

  private connect(userId: string): void {
    this.socket = io(this.url, { autoConnect: false, transports: [ "websocket" ] });
    this.socket.connect();

    // 연결 상태 확인
    this.socket.on('connect', () => {
      console.log('Connected to websocket server');
      this.socket.emit('connectUser', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from websocket server');
    });
  }

  getReceivers(data : { senderId: string}): void {
    this.socket.emit('getReceivers', data);
  }
  
  // 서버로부터 수신자 목록 수신
  onReceivers(): Observable<string[]> {
    return new Observable((observer) => {
      this.socket.on('receivers', (receivers: string[]) => {
        observer.next(receivers);
      });
    });
  }

  // 메시지 보내기
  sendMessage(message: { senderId: string, receiverId: string, content: string }): void {
    this.socket.emit('dm', message);
  }

  // 메시지 수신 대기
  onMessage(): Observable<{ senderId: string, content: string }> {
    return new Observable<{ senderId: string, content: string }>(observer => {
      this.socket.on('dm', (data) => {
        observer.next(data);
      });
    });
  }
}
