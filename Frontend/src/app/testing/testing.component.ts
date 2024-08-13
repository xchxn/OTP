import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestingService } from './testing.service';

interface Option {
  season: Array<string>; // 과제 이름
  member: Array<string>; // 사용자 식별자
  collectionNo: Array<string>; // 요약
  classes: Array<string>; // 사용자 설정 분류
}

@Component({
  selector: 'app-testing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    FormsModule],
  templateUrl: './testing.component.html',
  styleUrl: './testing.component.scss'
})
export class TestingComponent {

  Options!: Option;
  optionForm!: FormGroup;
  thumbnailUrl!: string;

  constructor(
    private testingService: TestingService,
    private formBuilder: FormBuilder
  ) {
    this.loadData();
  }

  ngOnInit() {
    this.optionForm = this.formBuilder.group({
      season: [''],
      member: [''],
      collectionNo: [''],
      classes: [''],
    });
  }

  loadData() {
    this.testingService.getOptions().subscribe({
      next: (res) => {
        // 옵션 채우기
        console.log(res);
        this.Options = res;
        console.log(this.Options);
      },
      error: (err) => console.error(err),
      complete: () => console.log('Data loading complete')
    });
  }

  getThumbnail(): void {
    if (this.optionForm.valid) {
      console.log(this.optionForm.value);
      this.testingService.getThumbnail(this.optionForm.value).subscribe({
      next: (res) => {
        console.log(res);
        this.thumbnailUrl = res[0].thumbnailImage;
      },
      error: (err) => console.error('Error creating quest', err)
    });
    }
  }
}
