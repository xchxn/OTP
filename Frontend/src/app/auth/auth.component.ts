import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { BehaviorSubject, merge } from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

interface authInform {
  id: string;
  password: string;
}

interface registerInform {
  id: string;
  username: string;
  email: string; 
  password: string;
  passwordCheck: string;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule,
    FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule,
    MatButtonModule],
  providers: [CookieService],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  isLoginMode = true;  // 기본 로그인 모드

  errorMessage = signal('');

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  constructor (
    private authservice: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // 이메일 입력 오류 컨트롤을 위한 merge
    // 오류 발생 구간
    // merge(this.registerForm.value.email.statusChanges, this.registerForm.value.email.valueChanges)
    //   .pipe(takeUntilDestroyed())
    //   .subscribe(() => this.updateErrorMessage());
  }

  // 로그인 폼과 회원가입 폼 전환
  toggleForm() {
    this.isLoginMode = !this.isLoginMode;  // 로그인/회원가입 모드 토글
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      id: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.registerForm = this.formBuilder.group({
      id: ['', Validators.required],
      username: ['', Validators.required],
      email: ['',  Validators.compose([ Validators.required, Validators.email ])],
      password: ['',  Validators.compose([ Validators.required, Validators.minLength(6) ])],
      passwordCheck: ['', Validators.required]
    });
  }

  login(): void {
    const loginId = this.loginForm.value.id;
    const loginPassword = this.loginForm.value.password;
    this.authservice.login(loginId, loginPassword).subscribe({
      next: (res) => {
        console.log('Logged in successfully!', res);
        this.router.navigate([`/`],{
          queryParams: { 
            token: res.accessToken,
            userId: res.userId,
            username: res.username
            }
        });
      },
      error: (err) => {
        if (err.status === 400) {
          console.error('Bad Request: Invalid login credentials.');
        } else if (err.status === 401) {
          console.error('Unauthorized: Incorrect username or password.');
        } else if (err.status === 500) {
          console.error('Server Error: Please try again later.');
        } else {
          console.error('An unknown error occurred:', err.message);
        }
      },
      complete: () => {
        console.log('login success');
      }
    });
  }

  register(): void {
    const registerBody = {
      id: this.registerForm.value.id,
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    }
    this.authservice.register(registerBody).subscribe({
      next: (res) => {
        console.log('Register in successfully!', res);
        // 이메일 인증 후 로그인 해주세요 팝업
        alert('회원가입이 완료 되었습니다. 이메일 인증 후 로그인 해주세요');
        this.router.navigate([`/`]);
      },
      error: (err) => console.error(err),
      complete: () => console.log('register success, please confirm email')
    });
  }

  onKakaoGetCode(): void {
    window.location.href = `http://localhost:3000/auth/kakao`;
  }

  onGoogleGetCode(): void {
    window.location.href = `http://localhost:3000/auth/google`;
  }

  // 이메일 입력 오류 메시지
  updateErrorMessage() {
    if (this.registerForm.value.email.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else if (this.registerForm.value.email.hasError('email')) {
      this.errorMessage.set('Not a valid email');
    } else {
      this.errorMessage.set('');
    }
  }
}
