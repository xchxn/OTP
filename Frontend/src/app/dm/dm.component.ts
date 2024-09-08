import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { DmService } from './dm.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
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
  messages: Array<{ senderId: string, content: string }> = [];
  messageSubscription: Subscription;

  // 디엠 유저 목록
  dmList: any[] = [];
  
  // 메시지 배열 확인용
  // messages: { senderId: string, content: string }[] = [];


  constructor(
    private dmService: DmService,
    private formBuilder: FormBuilder,
    private cookieService: CookieService,
  ) {
    this.messageSubscription = this.dmService.onMessage().subscribe({
      next: (msg) => {
        this.messages.push(msg);
      }
    });
  }

  ngOnInit() {
    this.messageForm = this.formBuilder.group({
      message: this.formBuilder.control('', Validators.required)
    });

    const idData = { senderId: this.cookieService.get('kakaoId')};

    this.dmService.getReceivers(idData);

    this.dmService.onReceivers().subscribe((receivers: string[]) => {
      this.dmList = receivers;
    });

    this.dmService.onMessage().subscribe((message) => {
      this.messages.push(message); // 메시지를 목록에 추가
    });
  }

  // Dm리스트에서 하나를 선택했을 때 소켓 연결?
  selectDm(): void {
    
  }

  send(): void {
    const message = { senderId: this.cookieService.get('kakaoId'), receiverId: '113484026984211984993', content: this.messageForm.value.message };
    console.log(message);
    this.dmService.sendMessage(message);
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }
}
