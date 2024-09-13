import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BoardService } from './board.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PostService } from '../post/post.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { DmService } from '../dm/dm.service';
import { DmComponent } from '../dm/dm.component';

import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
interface Posting {
  posting_id: number;
  posting_title: string;
  author: string;
  posting_content: string;
  posting_objekts: {
    have: number[];
    want: number[];
  };
  thumbnails: {
    have: string[];
    want: string[];
  };
}

interface objektFilter {
  season: Array<string>;
  member: Array<string>;
  collectionNo: Array<string>;
  classes: Array<string>;
}


@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule,
    FormsModule, MatMenuModule, MatButtonModule],
  providers: [CookieService],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  postings: Posting[] = [];
  searchForm!: FormGroup;
  objektFilter!: objektFilter;
  objektFilterForm!: FormGroup;

  constructor(
    private boardService: BoardService,
    private postService: PostService,
    private formBuilder: FormBuilder,
    private cookieService: CookieService,
    private router: Router
  ) { this.loadData(); }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      objekt: this.formBuilder.group({
        have: this.formBuilder.array([]),
        want: this.formBuilder.array([])
      })
    });

    this.objektFilterForm = this.formBuilder.group({
      season: [''],
      member: [''],
      collectionNo: [''],
      classes: ['']
    });
  }

  loadData(): void {
    this.boardService.getPostingList().subscribe({
      next: (data) => {
        this.postings = data.map((posting: any) => ({
          ...posting,
          thumbnails: {
            have: [],
            want: []
          }
        }));
        this.getThumbnail();
      },
      error: (err) => console.error(err),
      complete: () => console.log('Data loading complete')
    });

    // 검색 용 오브젝트 필터
    this.postService.getSelectOption().subscribe({
      next: (data) => {
        this.objektFilter = data;
        console.log(this.objektFilter);
      },
      error: (err) => console.error(err),
      complete: () => {
        console.log('Data loading complete');
        this.objektFilterForm.reset();
      }
    });
  }

  addObjektToHaveArray(): void {
    const objektFormValue = this.objektFilterForm.value;

    this.postService.getTargetObjekt(objektFormValue).subscribe({
      next: (data) => {
        console.log(data.id);

        const haveArray = this.searchForm.get('objekt.have') as FormArray;
        haveArray.push(this.formBuilder.control(data.id));
      },
      error: (err) => {
        console.error(err);
        alert('objekt가 존재하지 않음');
      },
      complete: () => console.log('Data loading complete')
    });
  }

  addObjektToWantArray(): void {
    const objektFormValue = this.objektFilterForm.value;

    this.postService.getTargetObjekt(objektFormValue).subscribe({
      next: (data) => {
        console.log(data.id);

        const wantArray = this.searchForm.get('objekt.want') as FormArray;
        wantArray.push(this.formBuilder.control(data.id));
        
        this.getThumbnail()
      },
      error: (err) => {
        console.error(err);
        alert('objekt가 존재하지 않음');
      },
      complete: () => console.log('Data loading complete')
    });
  }

  getThumbnail(): void {
    this.postings.forEach(posting => {
      const haveArr = posting.posting_objekts.have;
      const wantArr = posting.posting_objekts.want;

      haveArr.forEach(cont => {
        const haveValue = {
          id: cont
        }
        this.postService.getThumbnail(haveValue).subscribe({
          next: (data) => {
            // 썸네일 주소 배열에 data 추가
            posting.thumbnails.have.push(data.thumbnailImage);
          },
          error: (err) => console.error(err),
          complete: () => console.log('Thumbnail loading complete')
        });
      });

      wantArr.forEach(cont => {
        const wantValue = {
          id: cont
        }
        this.postService.getThumbnail(wantValue).subscribe({
          next: (data) => {
            // 썸네일 주소 배열에 data 추가
            posting.thumbnails.want.push(data.thumbnailImage);
          },
          error: (err) => console.error(err),
          complete: () => console.log('Thumbnail loading complete')
        });
      });
    });
  }

  searchObjekt(): void{
    // 필터로 추가해서 찾기
    const target = this.searchForm.value.objekt;
    this.boardService.searchObjekt(target).subscribe({
      next: (data) => {
        // 포스팅 배열 재생성
        console.log(data);
        this.postings = data.map((posting: any) => ({
          ...posting,
          thumbnails: {
            have: [],
            want: []
          }
        }));
        this.getThumbnail();
      },
      error: (err) => console.error(err),
      complete: () => console.log('Thumbnail loading complete')
    });
  }

  searchWithPosting(): void {
    const user = this.cookieService.get('kakaoId')
    this.boardService.searchWithPosting(user).subscribe({
      next: (data) => {
        // 포스팅 배열 재생성
        console.log(data);
        this.postings = data.map((posting: any) => ({
          ...posting,
          thumbnails: {
            have: [],
            want: []
          }
        }));
        this.getThumbnail();
      },
      error: (err) => console.error(err),
      complete: () => console.log('Thumbnail loading complete')
    });
  }

  goDM(author: string): void{
    this.router.navigate(['/dm'], { queryParams: { user: author } })
  }
}
