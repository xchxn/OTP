import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BoardService } from './board.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PostService } from '../post/post.service';

interface Posting {
  id: number;
  title: string;
  author: string;
  content: string;
  objekts: {
    have: number[];
    want: number[];
  };
  thumbnails: {
    have: string[];
    want: string[];
  };
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  postings: Posting[] = [];

  constructor(
    private boardService: BoardService,
    private postService: PostService
  ) { this.loadData(); }

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
  }

  getThumbnail(): void {
    this.postings.forEach(posting => {
      const haveArr = posting.objekts.have;
      const wantArr = posting.objekts.want;

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

    // 포스트 기반으로 찾기
  }
}
