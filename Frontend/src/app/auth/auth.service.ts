import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environments';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

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
    private cookieService: CookieService,
    private router: Router

  ) { }

  login(id: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { id, password });
  }

  register(body: any) : Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, body);
  }

  // 로그인 함수
  isLogin(data: any) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshtoken', data.refreshtoken);
    localStorage.setItem('userId', data.userId);
    // localStorage.setItem('username', data.username);
    // this.cookieService.set('username', data.username);
    this.cookieService.set('userId', data.userId);
    console.log(data);
    // this.cookieService.set('accessToken', token , 7 * 24 * 60 * 60 * 1000);
    this.isLoggedInSubject.next(true);
  }
  // 로그아웃 함수
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshtoken');
    localStorage.removeItem('userId');
    // localStorage.removeItem('username');

    localStorage.clear()
    console.log("logout");
    // this.cookieService.delete('accessToken');
    this.cookieService.delete('userId');
    // this.cookieService.delete('username');

    this.isLoggedInSubject.next(false);

    this.router.navigate(['/auth']);
  }

  // 토큰 갱신
  // 현재 액세스 토큰을 반환하는 메서드
  getAccessToken(): any {
    const token = localStorage.getItem('accessToken');
    return token;
  }

  // 토큰 갱신 API 호출
  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/refresh`, {
      refreshToken: this.getRefreshToken(),
    }).pipe(
      switchMap((response) => {
        this.storeAccessToken(response.accessToken); // 갱신된 토큰을 저장
        return of(response);
      })
    );
  }

  // 갱신된 액세스 토큰 저장
  private storeAccessToken(token: string): void {
    localStorage.setItem('accessToken', token);
    this.cookieService.set('accessToken', token); // 쿠키나 로컬스토리지에 저장
  }

  // Refresh token을 가져오는 메서드 (예: 쿠키 또는 로컬 스토리지에서 가져오기)
  private getRefreshToken(): any {
    return localStorage.getItem('refreshToken');
  }
}
