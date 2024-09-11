import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'any'
})
export class TestingService {
  private url = `http://localhost:3000/api`;

  constructor(private http: HttpClient) { }

  getOptions(): Observable<any> {
    return this.http.get<any>(`${this.url}/option`);
  }

  getThumbnail(body: any): Observable<any> {
    return this.http.post<any>(`${this.url}/thumbnail`, body);
  }
}
