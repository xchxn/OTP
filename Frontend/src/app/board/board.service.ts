import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'any'
})
export class BoardService {

  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  getPostingList(): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/board/list`, this.httpOptions);
  }

  searchObjekt(body: any): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/search/mtom`, { objekts: body }, this.httpOptions);
  }

  searchWithPosting(body: any): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/search/posting`, { user: body } , this.httpOptions);
  }
}
