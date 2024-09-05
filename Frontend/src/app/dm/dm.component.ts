import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { DmService } from './dm.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dm',
  standalone: true,
  imports: [],
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


  constructor(
    private dmService: DmService,
    private formBuilder: FormBuilder
  ) {
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
    // 혹은 messages의 sendorId 목록으로 대체

    this.messageForm = this.formBuilder.group({
      message: this.formBuilder.control('', Validators.required)
    });
  }

  // Dm리스트에서 하나를 선택했을 때 소켓 연결?
  selectDm(): void {
    
  }

  send(): void {
    const message = { senderId: 'userId', receiverId: 'otherUserId', content:  this.messageForm.value };
    this.dmService.sendMessage(message);
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }
}
