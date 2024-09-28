import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  // 오브젝트 옵션
  getSelectOption(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/board/option`);
  }

  getTargetObjekt(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/objekt`, body);
  }

  getThumbnail(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/thumbnail`, body);
  }

  // 포스팅 CRUD
  createPosting(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/create`, body);
  }

  updatePosting(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/option`);
  }

  deletePosting(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/option`);
  }
}
