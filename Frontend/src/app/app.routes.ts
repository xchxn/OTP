import { Routes } from '@angular/router';
import { TestingComponent } from './testing/testing.component';
import { AuthComponent } from './auth/auth.component';
import { BoardComponent } from './board/board.component';
import { DmComponent } from './dm/dm.component';
import { PostComponent } from './post/post.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'board', component: BoardComponent },
  { path: 'dm', component: DmComponent },
  { path: 'testing', component: TestingComponent },
  { path: 'post', component: PostComponent },
];
