import { Inject, Injectable } from '@nestjs/common';
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
    const oneSearch = await this.postingRepository
      .createQueryBuilder()
      .select('id')
      .where("JSON_CONTAINS(objekts->'$.want', :value)", {
        value: body.have,
      })
      .andWhere("JSON_CONTAINS(objekts->'$.have', :value)", {
        value: body.want,
      })
      .getMany();
    console.log(oneSearch);
    return true;
  }

  // 하나의 오브젝트로 여러개의 찾을 오브젝트 중 일치하는 것 찾기
  async manyToMany(body: any): Promise<any> {
    const queryBuilder = this.postingRepository
      .createQueryBuilder('posting')
      .select('id');

    const haveArray = body.have;
    const wantArray = body.want;

    if (Array.isArray(haveArray) && Array.isArray(wantArray)) {
      // 배열로 들어온 have와 want의 모든 조합을 반복문으로 처리
      queryBuilder.where(
        new Brackets((qb) => {
          haveArray.forEach((haveValue) => {
            wantArray.forEach((wantValue) => {
              qb.orWhere(
                "(JSON_CONTAINS(posting.objekts->'$.want', :haveValue) AND JSON_CONTAINS(posting.objekts->'$.have', :wantValue))",
                { haveValue: haveValue, wantValue: wantValue },
              );
            });
          });
        }),
      );
    } else {
      // 배열이 아닌 경우 (기존 코드와 동일한 처리)
      queryBuilder
        .where("JSON_CONTAINS(posting.objekts->'$.want', :value)", {
          value: body.have,
        })
        .andWhere("JSON_CONTAINS(posting.objekts->'$.have', :value)", {
          value: body.want,
        });
    }

    const oneSearch = await queryBuilder.getMany();
    console.log(oneSearch);
    return oneSearch;
  }

  // 게시글 기반으로 want와 have 하나씩 비교해서 일치하는 것 있으면 반환
  async autoMatching(body: any): Promise<any> {
    console.log(body);
    // 자신의 포스팅에서 오브젝트 want배열 가져오기
    const getArr = await this.postingRepository
      .createQueryBuilder()
      .select('objekt.have')
      .where('author = :author', { author: body.user })
      .getOne();

    // 위에서 가져온 want배열로 매칭
    const queryBuilder = this.postingRepository.createQueryBuilder('posting');

    // 배열의 각 값이 objekt의 want 배열에 존재하는지 확인하는 조건 추가
    getArr.objekts.have.forEach((value, index) => {
      queryBuilder.orWhere(
        "JSON_CONTAINS(posting.objekts->'$.want', :value" + index + ')',
        { ['value' + index]: value },
      );
    });

    const result = await queryBuilder.getMany();
    console.log(result);
    return true;
  }
}
