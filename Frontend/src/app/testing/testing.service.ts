import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'any'
})
export class TestingService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getOptions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/option`);
  }

  getThumbnail(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/thumbnail`, body);
  }
}
