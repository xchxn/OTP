import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from './post.service';

interface objektFilter {
  season: string;
  member: string;
  collectionNo: string;
  classes: string;
}

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    FormsModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent {
  postingForm!: FormGroup;
  objektFiler!: objektFilter;
  objektFilterForm!: FormGroup;

  constructor(
    private postService: PostService,
    // private cookieService: CookieService,
    private formBuilder: FormBuilder
  ) {
    this.loadData();
  }
  ngOnInit() {
    this.postingForm = this.formBuilder.group({
      title: [''],
      content: [''],
      author: [''],
      classes: [''],
      objekt: this.formBuilder.group({
        have: [''],
        want: ['']
      })
    });

    this.objektFilterForm = this.formBuilder.group({
      season: [''],
      member: [''],
      collectionNo: [''],
      objekt: [''],
    });
  }

  loadData(): void {
    this.postService.getSelectOption().subscribe({
      next: (data) => {
        this.objektFiler = data;
        console.log(this.objektFiler);
      },
      error: (err) => console.error(err),
      complete: () => console.log('Data loading complete')
    });
  }

  // 작성중인 포스트의 내용을 볼 수 있는 함수 추가하기

  addObjektToArray(): void {
    const objektFormValue = this.objektFilterForm.value;

    // service에서 오브젝트 id와 썸네일 가져오기
    // 썸네일 클릭하면 postingForm 배열에 추가하기
  }
}
