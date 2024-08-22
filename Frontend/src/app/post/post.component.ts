import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from './post.service';

interface objektFilter {
  season: Array<string>;
  member: Array<string>;
  collectionNo: Array<string>;
  classes: Array<string>;
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
  objektFilter!: objektFilter;
  objektFilterForm!: FormGroup;
  thumbnail: string[] = [];

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
      objekt: this.formBuilder.group({
        have: this.formBuilder.array([]),
        want: ['']
        // 해당 배열에서 id를 읽어 클라이언트의 화면에는 썸네일만 보여지도록
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
    this.postService.getSelectOption().subscribe({
      next: (data) => {
        this.objektFilter = data;
        console.log(this.objektFilter);
      },
      error: (err) => console.error(err),
      complete: () => console.log('Data loading complete')
    });
  }
  // 작성중인 포스트의 내용을 볼 수 있는 함수 추가하기
  
  addObjektToArray(): void {
    const objektFormValue = this.objektFilterForm.value;

    this.postService.getTargetObjekt(objektFormValue).subscribe({
      next: (data) => {
        console.log(data.id);

        const haveArray = this.postingForm.get('objekt.have') as FormArray;
        haveArray.push(this.formBuilder.control(data.id));
      },
      error: (err) => console.error(err),
      complete: () => console.log('Data loading complete')
    });
  }

  getThumbnail(): void {
    const haveArray = this.postingForm.get('objekt.have') as FormArray;

    haveArray.controls.forEach(control => {
      const haveValue = {
        id: control.value
      }
      this.postService.getThumbnail(haveValue).subscribe({
        next: (data) => {
          // 썸네일 주소 배열에 data 추가
          console.log(data.thumbnailImage);
          this.thumbnail.push(data.thumbnailImage);
        },
        error: (err) => console.error(err),
        complete: () => console.log('Thumbnail loading complete')
      });
    });
  }
}
