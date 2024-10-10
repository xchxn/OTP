import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'any'
})
export class AuthService {
  apiUrl = environment.apiUrl;

  // 로그인 상태를 관리하는 BehaviorSubject
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  
  // Observable로 로그인 상태를 구독할 수 있도록 제공
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) { }

  login(id: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { id, password });
  }

  register(body: any) : Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, body);
  }

  // 로그인 함수
  isLogin(token: string) {
    // localStorage.setItem('authToken', token);
    this.cookieService.set('accessToken', token, 1, '/');
    this.isLoggedInSubject.next(true);
  }

  // 로그아웃 함수
  logout() {
    // localStorage.removeItem('authToken');
    console.log("logout");
    this.cookieService.delete('accessToken');
    this.cookieService.delete('kakaoId');

    this.isLoggedInSubject.next(false);
  }

  // 현재 로그인 상태를 반환
  isLoggedIn(): boolean {
    console.log("Status changes")
    // return !!localStorage.getItem('authToken');
    const token = this.cookieService.get('accessToken');
    return !!token; // 쿠키에 토큰이 있으면 true 반환
  }
}
