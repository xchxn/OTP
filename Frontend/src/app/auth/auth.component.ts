import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';

interface authInform {
  id: string;
  password: string;
}

interface registerInform {
  id: string;
  username: string;
  password: string;
  passwordCheck: string;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  constructor (
    private authervice: AuthService,
  ) {}

  onKakaoGetCode(): void {
    window.location.href = `http://localhost:3000/auth/kakao`;
  }

  onGoogleGetCode(): void {
    window.location.href = `http://localhost:3000/auth/google`;
  }
}
