import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { DmService } from './dm.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-dm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  providers: [CookieService],
  templateUrl: './dm.component.html',
  styleUrl: './dm.component.scss'
})
export class DmComponent {
  messageForm!: FormGroup;

  // 대상 유저와의 메시지 기록
  messages: Array<{ senderId: string, message: string }> = [];
  messageSubscription!: Subscription;
  fetchMessagesSubscription!: Subscription;

  // 디엠 유저 목록
  dmList: any[] = [];

  // selectedReceiverId: string = '113484026984211984993'; // 선택된 수신자
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
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
    this.fetchMessagesSubscription.unsubscribe();
  }
}
