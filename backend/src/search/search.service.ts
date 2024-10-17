import { Inject, Injectable } from '@nestjs/common';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { PostingEntity } from 'src/board/entities/posting.entity';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class SearchService {
  constructor(
    @Inject('POSTING_REPOSITORY')
    private postingRepository: Repository<PostingEntity>,
  ) {}

  // 하나의 오브젝트로 하나의 오브젝트 찾기
  // 사용자는 have와 want 각각 하나씩 입력
  async oneToOneSearch(body: any): Promise<any> {
    console.log(body);
    const oneSearch = await this.postingRepository
      .createQueryBuilder()
      .select('id')
      .where("JSON_CONTAINS(objekts->'$.want', :wantValue)", {
        wantValue: body.objekts.have,
      })
      .andWhere("JSON_CONTAINS(objekts->'$.have', :haveValue)", {
        haveValue: body.objekts.want,
      })
      .getRawMany();
    console.log(oneSearch);
    return true;
  }

  // 하나의 오브젝트로 여러개의 찾을 오브젝트 중 일치하는 것 찾기
  async manyToMany(body: any): Promise<any> {
    console.log(body);
    const queryBuilder = this.postingRepository
      .createQueryBuilder()
      .select('id');

    const haveArray = body.objekts.have;
    const wantArray = body.objekts.want;

    if (Array.isArray(haveArray) && Array.isArray(wantArray)) {
      // 배열로 들어온 have와 want의 모든 조합을 반복문으로 처리
      queryBuilder.where(
        new Brackets((qb) => {
          haveArray.forEach((haveValue) => {
            wantArray.forEach((wantValue) => {
              qb.orWhere(
                "(JSON_CONTAINS(objekts->'$.want', :wantValue) AND JSON_CONTAINS(objekts->'$.have', :haveValue))",
                {
                  wantValue: JSON.stringify(haveValue),
                  haveValue: JSON.stringify(wantValue),
                },
              );
            });
          });
        }),
      );
    }

    const oneSearch = await queryBuilder.getRawMany();
    console.log(oneSearch);

    const ids = oneSearch.map((r) => r.id);

    if (ids.length === 0) {
      return []; // ids가 비어 있으면 빈 배열 반환
    }

    const resPostingList = await this.postingRepository
      .createQueryBuilder('posting')
      .leftJoinAndSelect(AuthEntity, 'auth', 'auth.id = posting.username')
      .select([
        'posting.id',
        'posting.title',
        'posting.content',
        'posting.objekts',
        'posting.createdAt',
        'posting.updatedAt',
      ])
      .addSelect('auth.username', 'username')
      .where('posting.id IN (:...ids)', { ids })
      .getRawMany();
    console.log(resPostingList);

    return resPostingList;
  }

  // 게시글 기반으로 want와 have 하나씩 비교해서 일치하는 것 있으면 반환
  async autoMatching(body: any): Promise<any> {
    console.log(body);
    // 자신의 포스팅에서 오브젝트 want배열 가져오기
    const getArr = await this.postingRepository
      .createQueryBuilder('posting')
      .select('JSON_EXTRACT(posting.objekts, "$.want")', 'wantArray')
      .where('username = :username', { username: body.user })
      .getRawOne();
    console.log(getArr);
    // 위에서 가져온 want배열로 매칭
    const queryBuilder = this.postingRepository
      .createQueryBuilder('posting')
      .select('id');

    // 배열의 각 값이 objekt의 want 배열에 존재하는지 확인하는 조건 추가
    getArr.wantArray.forEach((value) => {
      queryBuilder.orWhere(
        "JSON_CONTAINS(posting.objekts->'$.have', :haveValue)",
        { haveValue: JSON.stringify(value) },
      );
    });

    const result = await queryBuilder.getRawMany();
    console.log(result);

    // result에 포함된 posting을 클라이언트에서 재요청할지,
    // 서버에서 다시 찾아서 리턴을 줄지 결정 08.31
    const ids = result.map((r) => r.id);

    const resPostingList = await this.postingRepository
      .createQueryBuilder('posting')
      .leftJoinAndSelect(AuthEntity, 'auth', 'auth.id = posting.username')
      .select([
        'posting.id',
        'posting.title',
        'posting.content',
        'posting.objekts',
        'posting.createdAt',
        'posting.updatedAt',
      ])
      .addSelect('auth.username', 'username')
      .where('posting.id IN (:...ids)', { ids })
      .getRawMany();
    console.log(resPostingList);
    return resPostingList;
  }
}
