import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
    this.cookieService.set('userId', data.userId);
    console.log(data);
    // this.cookieService.set('accessToken', token , 7 * 24 * 60 * 60 * 1000);
    this.isLoggedInSubject.next(true);
  }
  // 로그아웃 함수
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshtoken');
    localStorage.removeItem('userId');

    localStorage.clear()
    console.log("logout");
    // this.cookieService.delete('accessToken');
    this.cookieService.delete('userId');

    this.isLoggedInSubject.next(false);

    this.router.navigate(['/auth']);
  }
}
