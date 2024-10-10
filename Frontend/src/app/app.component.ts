import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Frontend';

  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // 로그인 상태를 구독
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });
  }
  // 로그아웃 함수
  logout() {
    this.authService.logout();
    // 로그아웃 후 추가 동작 (예: 로그인 페이지로 이동)
    this.router.navigate(['/auth']); // 로그아웃 후 로그인 페이지로 이동
  }

  ngOnInit() {
    // 현재 URL에서 토큰 추출
    const token = this.getTokenFromUrl();

    if (token) {
      // JWT 토큰을 localStorage에 저장
      this.authService.isLogin(token);
      // 인증된 사용자가 갈 수 있는 경로로 리다이렉트
      this.router.navigate(['/board']);
    } else {
      // 토큰이 없으면 로그인 페이지로 다시 리다이렉트
      this.router.navigate(['/auth']);
    }
  }

  // URL에서 토큰 추출 함수
  getTokenFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  }
}
