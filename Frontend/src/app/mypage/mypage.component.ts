import { Component } from '@angular/core';
import { MypageService } from './mypage.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-mypage',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule,
    FormsModule],
  providers: [MypageService],
  templateUrl: './mypage.component.html',
  styleUrl: './mypage.component.scss'
})
export class MypageComponent {
  userId: string | any = '';
  updateForm: any;

  constructor(
    private mypageService: MypageService,
    private formBuilder: FormBuilder,
    private cookieService: CookieService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userId = localStorage.getItem('userId');

    if (!this.userId) {
      alert("Please Login!");
      this.router.navigate([`/auth`]);
    }

    this.updateForm = this.formBuilder.group({
      username: [''],
    });

    this.loadData();
  }

  loadData(): void {
    this.userId = localStorage.getItem('userId');
    this.mypageService.getMyInfo(JSON.stringify({ userId: this.userId })).subscribe({
      next: (data) => {
        this.updateForm.patchValue(data);
      },
      error: (err) => console.error(err),
      complete: () => console.log('Data loading complete')
    });
  }

  updateMyinfo(): void {
    const updateFormValue = this.updateForm.value;

    this.mypageService.updateMyInfo(JSON.stringify({ userId: this.userId, ...updateFormValue })).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (err) => console.error(err),
      complete: () => {
        console.log('Update complete');
        this.loadData();
      }
    });
  }

  deleteMyInfo(): void {
    this.mypageService.deleteMyInfo(this.userId).subscribe({
      next: (data) => {
        console.log(data);
      },
      error: (err) => console.error(err),
      complete: () => {
        console.log('Delete complete');
        this.router.navigate(['/auth']);
      }
    });
  }
}
