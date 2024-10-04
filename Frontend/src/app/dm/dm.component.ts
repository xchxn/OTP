import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DmService } from './dm.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  selector: 'app-dm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    FormsModule, RouterOutlet, RouterLink, RouterLinkActive, MatDividerModule
  ],
  providers: [CookieService],
  templateUrl: './dm.component.html',
  styleUrl: './dm.component.scss'
})
export class DmComponent {
  // @ViewChild('messageList') messageList!: ElementRef; // #messageList 참조
  // isUserScrolling = false;  // 사용자가 수동으로 스크롤하는지 여부
  // scrollThreshold = 100;    // 스크롤이 아래로 이동하는 임계값

  messageForm!: FormGroup;

  // 대상 유저와의 메시지 기록
  messages: Array<{ senderId: string, message: string }> = [];
  messageSubscription!: Subscription;
  fetchMessagesSubscription!: Subscription;

  // 디엠 유저 목록
  dmList: any[] = [];

  selectedReceiverId!: string;

  constructor(
    private dmService: DmService,
    private formBuilder: FormBuilder,
    private cookieService: CookieService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedReceiverId = params['user'];
    });

    this.messageForm = this.formBuilder.group({
      message: this.formBuilder.control('', Validators.required)
    });

    const idData = { senderId: this.cookieService.get('kakaoId')};

    // DM 리스트 가져오기
    this.dmService.getReceivers(idData);

    this.dmService.onReceivers().subscribe((receivers: string[]) => {
      this.dmList = receivers;
    });

    // 새로운 메시지 수신 구독
    this.messageSubscription = this.dmService.onMessage().subscribe((message) => {
      this.messages.push(message); // 새 메시지 추가

      this.dmService.fetchMessages(this.cookieService.get('kakaoId'), this.selectedReceiverId);
    });
  }

  // ngAfterViewInit() {
  //   // 스크롤 이벤트를 messageList에 직접 추가
  //   this.messageList.nativeElement.addEventListener('wheel', this.onScroll.bind(this));
  // }

  // // 스크롤을 가장 밑으로 이동시키는 메서드
  // scrollToBottom(): void {
  //   try {
  //     this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  // // 스크롤 이벤트 처리
  // onScroll(): void {
  //   const element = this.messageList.nativeElement;

  //   // 스크롤 위치가 상단에 가까울수록 수동 스크롤로 인식
  //   const atBottom =
  //     element.scrollHeight - element.scrollTop <= element.clientHeight + this.scrollThreshold;

  //   // 사용자가 스크롤을 위로 이동하면 자동 스크롤 비활성화
  //   if (!atBottom) {
  //     this.isUserScrolling = true;
  //   } else {
  //     this.isUserScrolling = false;
  //   }
  // }

  // Dm리스트에서 하나를 선택했을 때 소켓 연결?
  // receiverId: string
  selectDm(receiver: string): void {
    this.selectedReceiverId = receiver;
    const senderId = this.cookieService.get('kakaoId');

    // 서버로부터 선택된 수신자와의 메시지 기록을 요청
    this.dmService.fetchMessages(senderId, this.selectedReceiverId);

    // 서버로부터 받은 메시지 기록 구독
    this.fetchMessagesSubscription = this.dmService.onFetchMessages().subscribe((messages) => {
      this.messages = messages; // 기존 메시지 기록으로 업데이트
      // this.scrollToBottom();
    });
  }

  send(): void {
    if (this.messageForm.invalid) {
      return;
    }

    const message = { 
      senderId: this.cookieService.get('kakaoId'),
      receiverId: this.selectedReceiverId,
      message: this.messageForm.value.message
    };

    console.log(message);
    this.dmService.sendMessage(message);

    this.messageForm.reset();
    // this.scrollToBottom();
  }

  ngOnDestroy(): void {
    // this.messageSubscription.unsubscribe();
    // this.fetchMessagesSubscription.unsubscribe();
  }
}
