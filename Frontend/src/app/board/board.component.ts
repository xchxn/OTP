import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BoardService } from './board.service';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface Posting {
  id: number;
  title: string;
  author: string;
  content: string;
  objekt: string;
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
    private boardService: BoardService
  ) { this.loadData(); }

  loadData(): void {
    this.boardService.getPostingList().subscribe({
      next: (data) => {
        this.postings = data;
      },
      error: (err) => console.error(err),
      complete: () => console.log('Data loading complete')
    });
  }
}
