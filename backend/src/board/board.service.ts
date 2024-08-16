import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostingEntity } from './entities/posting.entity';
@Injectable()
export class BoardService {
  constructor(
    @Inject('POSTING_REPOSITORY')
    private postingRepository: Repository<PostingEntity>,
  ) {}
  async getPostingList(): Promise<any> {
    return 'Hello World!';
  }

  async createPosting(): Promise<any> {
    return true;
  }

  async updatePosting(): Promise<any> {
    return true;
  }

  async deletePosting(): Promise<any> {
    return true;
  }
}
