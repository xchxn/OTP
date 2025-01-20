import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { DmService, DirectMessage, ChatPartner } from './dm.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dm',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatDividerModule
  ],
  templateUrl: './dm.component.html',
  styleUrls: ['./dm.component.scss']
})
export class DmComponent implements OnInit, OnDestroy {
  messageForm!: FormGroup;
  messages: DirectMessage[] = [];
  chatList: ChatPartner[] = [];
  
  private subscriptions: Subscription[] = [];
  
  selectedReceiverId?: string;
  selectedUsername?: string;
  userId!: string;

  isMobileView: boolean = false;
  showReceiverList: boolean = true;

  @ViewChild('messageListContainer') messageListContainer!: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkMobileView();
  }

  constructor(
    private dmService: DmService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit() {
    this.checkMobileView();
    this.userId = localStorage.getItem('userId') || '';
    
    if (!this.userId) {
      alert("로그인이 필요합니다!");
      this.router.navigate(['/auth']);
      return;
    }

    this.initMessageForm();
    this.loadChatList();
    this.subscribeToNewMessages();
    this.subscribeToChatListUpdates();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.dmService.disconnect();
  }

  private initMessageForm() {
    this.messageForm = this.formBuilder.group({
      message: ['', Validators.required]
    });
  }

  private loadChatList() {
    const sub = this.dmService.getChatList().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.chatList) {
          this.chatList = response.chatList;
        }
      },
      error: (error) => {
        console.error('채팅 목록 로딩 실패:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private subscribeToNewMessages() {
    const sub = this.dmService.onNewMessage().subscribe({
      next: (message) => {
        if (
          message.senderId === this.selectedReceiverId ||
          message.receiverId === this.selectedReceiverId
        ) {
          this.messages.push(message);
          this.scrollToBottom();
        }
        this.loadChatList(); // 채팅 목록 업데이트
      },
      error: (error) => {
        console.error('메시지 수신 오류:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private subscribeToChatListUpdates() {
    const sub = this.dmService.onChatListUpdated().subscribe({
      next: () => {
        this.loadChatList();
      },
      error: (error) => {
        console.error('채팅 목록 업데이트 오류:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  selectChat(partner: ChatPartner) {
    this.selectedReceiverId = partner.userId;
    this.selectedUsername = partner.username;
    
    if (partner.unreadCount > 0) {
      this.markMessagesAsRead(partner.userId);
    }

    if (this.isMobileView) {
      this.showReceiverList = false;
    }
  }

  async sendMessage() {
    if (this.messageForm.invalid || !this.selectedReceiverId) return;

    const message: DirectMessage = {
      senderId: this.userId,
      receiverId: this.selectedReceiverId,
      message: this.messageForm.value.message,
      timestamp: new Date()
    };

    const sub = this.dmService.sendMessage(message).subscribe({
      next: (response) => {
        if (response.status === 'queued') {
          this.messageForm.reset();
          this.scrollToBottom();
        } else {
          console.error('메시지 전송 실패:', response.message);
        }
      },
      error: (error) => {
        console.error('메시지 전송 오류:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private markMessagesAsRead(senderId: string) {
    const sub = this.dmService.markAsRead(senderId).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.loadChatList();
        }
      },
      error: (error) => {
        console.error('읽음 처리 오류:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  removeChat(partnerId: string, event: Event) {
    event.stopPropagation();
    if (!confirm('이 채팅방을 삭제하시겠습니까?')) return;

    const sub = this.dmService.removeChat(partnerId).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          if (this.selectedReceiverId === partnerId) {
            this.selectedReceiverId = undefined;
            this.selectedUsername = undefined;
            this.messages = [];
          }
          this.loadChatList();
        }
      },
      error: (error) => {
        console.error('채팅방 삭제 오류:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
    this.showReceiverList = !this.isMobileView || !this.selectedReceiverId;
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messageListContainer) {
        const element = this.messageListContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    });
  }

  toggleView() {
    this.showReceiverList = !this.showReceiverList;
  }
}