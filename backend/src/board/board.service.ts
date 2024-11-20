import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostingEntity } from './entities/posting.entity';
import { ObjektEntity } from './entities/objekt.entity';
import { AuthEntity } from 'src/auth/entities/auth.entity';
@Injectable()
export class BoardService {
  constructor(
    @Inject('POSTING_REPOSITORY')
    private postingRepository: Repository<PostingEntity>,
    @Inject('OBJEKT_REPOSITORY')
    private objektRepository: Repository<ObjektEntity>,
  ) {}

  // 모든 포스팅 목록, 보드 채우기
  async getPostingList(): Promise<any> {
    const getPostingList = await this.postingRepository
      .createQueryBuilder('posting')
      .select([
        'posting.id',
        'posting.username',
        'posting.userId',
        'posting.title',
        'posting.content',
        'posting.objekts',
        'posting.createdAt',
        'posting.updatedAt',
      ])
      .getRawMany();
    // console.log(getPostingList);
    return getPostingList;
  }

  async getMyPost(body: any): Promise<any> {
    const myPost = await this.postingRepository
      .createQueryBuilder('posting')
      .select([
        'posting.id',
        'posting.username',
        'posting.userId',
        'posting.title',
        'posting.content',
        'posting.objekts',
        'posting.createdAt',
        'posting.updatedAt',
      ])
      .where('userId = :userId', { userId: body.userId })
      .getRawMany();
    console.log(myPost);
    return myPost;
  }

  // 포스팅 생성
  async createPosting(body: any): Promise<any> {
    const createTicket = await this.postingRepository
      .createQueryBuilder()
      .insert()
      .values({
        title: body.title,
        content: body.content,
        username: body.username,
        userId: body.userId,
        objekts: {
          have: body.objekt.have,
          want: body.objekt.want,
        },
      })
      .execute();
    return createTicket;
  }

  // 포스팅 수정
  async updatePosting(body: any): Promise<any> {
    const updateTicket = await this.postingRepository
      .createQueryBuilder()
      .update()
      .set({
        title: body.posting_title,
        content: body.posting_content,
        objekts: body.posting_objekts,
      })
      .where('id = :id', { id: body.posting_id })
      .execute();
    return updateTicket;
  }

  // 포스팅 삭제
  async deletePosting(body: any): Promise<any> {
    const deleteTicket = await this.postingRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: body })
      .execute();
    return deleteTicket;
  }

  // 오브젝트 선택 옵션 제공
  async getSelectOption(): Promise<any> {
    const season = await this.objektRepository
      .createQueryBuilder()
      .select('DISTINCT season', 'season')
      .getRawMany();
    const member = await this.objektRepository
      .createQueryBuilder()
      .select('DISTINCT member', 'member')
      .getRawMany();
    const collectionNO = await this.objektRepository
      .createQueryBuilder()
      .select('DISTINCT collectionNO', 'collectionNO')
      .getRawMany();
    const getClass = await this.objektRepository
      .createQueryBuilder()
      .select('DISTINCT classes', 'classes')
      .getRawMany();
    // 각각의 결과를 배열로 변환
    const seasonArray = season.map((item) => item.season);
    const memberArray = member.map((item) => item.member);
    const collectionNOArray = collectionNO.map((item) => item.collectionNO);
    const getClassArray = getClass.map((item) => item.classes);

    const options = {
      season: seasonArray,
      member: memberArray,
      collectionNo: collectionNOArray,
      classes: getClassArray,
    };

    return options;
  }

  // 선택 오브젝트의 아이디와 썸네일 주소 반환
  async getTargetObjekt(body: any): Promise<any> {
    const selectOption = await this.objektRepository
      .createQueryBuilder()
      // .select('DISTINCT id', 'id')
      .where('season = :season', { season: body.season })
      .andWhere('member = :member', { member: body.member })
      .andWhere('collectionNo = :collectionNo', {
        collectionNo: body.collectionNo,
      })
      .andWhere('classes = :classes', { classes: body.classes })
      .getOne();
    if (!selectOption) {
      throw new Error('No matching object found for the provided criteria.');
    }
    return selectOption;
  }

  async getThumbnail(body: any): Promise<any> {
    // console.log(body);
    const selectOption = await this.objektRepository
      .createQueryBuilder('')
      // .select('DISTINCT thumbnailImage', 'thumbnailImage')
      // .select()
      .where('id = :id', { id: body.id })
      .getOne();
    // console.log(selectOption);
    return selectOption;
  }
}
