import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient) { }

  // 오브젝트 옵션
  getSelectOption(): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/option`);
  }

  getThumbnail(): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/option`);
  }

  // 포스팅 CRUD
  createPosting(): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/option`);
  }

  updatePosting(): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/option`);
  }

  deletePosting(): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/api/option`);
  }
}
