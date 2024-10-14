import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DmService } from './dm.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MatDividerModule } from '@angular/material/divider';

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
  messageForm!: FormGroup;
  // @ViewChild('scrollMe') private messageContainer!: ElementRef;

  // 대상 유저와의 메시지 기록
  messages: Array<{ senderId: string, message: string }> = [];
  messageSubscription!: Subscription;
  fetchMessagesSubscription!: Subscription;

  // 디엠 유저 목록
  // dmList: Set<string> = new Set();
  dmList: any[] = [];
  dmList$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

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

      // user query param이 존재하면 selectDm 자동 호출
      if (this.selectedReceiverId) {
        this.selectDm(this.selectedReceiverId);
      }
    });

    this.messageForm = this.formBuilder.group({
      message: this.formBuilder.control('', Validators.required)
    });

    const idData = { senderId: this.cookieService.get('userId') };

    // DM 리스트 가져오기
    this.dmService.getReceivers(idData);

    this.dmService.onReceivers().subscribe((receivers: string[]) => {
      // this.dmList = new Set(receivers); // 배열을 Set으로 변환하여 할당
      this.dmList = receivers;
      this.dmList$.next(Array.from(this.dmList));
    });


    // 새로운 메시지 수신 구독
    this.messageSubscription = this.dmService.onMessage().subscribe((message) => {
      this.messages.push(message); // 새 메시지 추가

      this.dmService.fetchMessages(this.cookieService.get('userId'), this.selectedReceiverId);

      if (!this.dmList.includes(message.senderId)) {
        this.dmList.push(message.senderId);
        this.dmList$.next(Array.from(this.dmList));
      }
    });

  }

  // Dm리스트에서 하나를 선택했을 때 소켓 연결?
  // receiverId: string
  selectDm(receiver: string): void {
    this.selectedReceiverId = receiver;
    const senderId = this.cookieService.get('userId');

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
      senderId: this.cookieService.get('userId'),
      receiverId: this.selectedReceiverId,
      message: this.messageForm.value.message
    };

    console.log(message);
    this.dmService.sendMessage(message);

    // 메시지 보낸 후, dmList에 상대방이 없으면 추가
    if (!this.dmList.includes(this.selectedReceiverId)) {
      this.dmList.push(this.selectedReceiverId); // DM 리스트에 추가
      this.dmList$.next(Array.from(this.dmList));
    }

    this.messageForm.reset();
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.fetchMessagesSubscription) {
      this.fetchMessagesSubscription.unsubscribe();
    }
  }
}
