import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

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
    FormsModule],
  providers: [CookieService],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor (
    private authservice: AuthService,
    private formBuilder: FormBuilder,
  ) {}

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
      },
      error: (err) => console.error(err),
      complete: () => console.log('login success')
    });
  }

  register(): void {
    const registerBody = {
      registerId: this.registerForm.value.id,
      registerUsername: this.registerForm.value.username,
      registerEmail: this.registerForm.value.email,
      registerPassword: this.registerForm.value.password
    }
    this.authservice.register(registerBody).subscribe({
      next: (res) => {
        console.log('Register in successfully!', res);
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
}
