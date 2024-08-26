import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  constructor() {}

  // 하나의 오브젝트로 하나의 오브젝트 찾기
  async oneToOneSearch(): Promise<any> {
    return true;
  }

  // 하나의 오브젝트로 여러개의 찾을 오브젝트 중 일치하는 것 찾기
  async oneToMany(): Promise<any> {
    return true;
  }

  // 게시글 기반으로 want와 have 하나씩 비교해서 일치하는 것 있으면 반환
  async autoMatching(): Promise<any> {
    return true;
  }
}
