import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { DmService } from './dm.service';

@Component({
  selector: 'app-dm',
  standalone: true,
  imports: [],
  templateUrl: './dm.component.html',
  styleUrl: './dm.component.scss'
})
export class DmComponent {
  message = '';
  messages: Array<{ senderId: string, content: string }> = [];
  messageSubscription: Subscription;

  dmList: any[] = [];

  constructor(private dmService: DmService) {
    this.messageSubscription = this.dmService.onMessage().subscribe({
      next: (msg) => {
        this.messages.push(msg);
      }
    });
  }

  ngOnInit() {
    this.dmService.getDmList().subscribe(users => {
      this.dmList = users;
    });
  }

  // Dm리스트에서 하나를 선택했을 때 소켓 연결?
  selectDm(): void {
    
  }

  send(): void {
    const message = { senderId: 'userId', receiverId: 'otherUserId', content: this.message };
    this.dmService.sendMessage(message);
    this.message = '';  // 입력 필드 초기화
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }
}
