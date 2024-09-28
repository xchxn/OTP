import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'any'
})
export class AuthService {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { username, password });
  }

  register(body: any) : Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/resgister`, body);
  }  
}
