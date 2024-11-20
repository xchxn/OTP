import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ObjektEntity } from 'src/board/entities/objekt.entity';
import { Repository } from 'typeorm';
import Redis from 'ioredis';

@Injectable()
export class ManageService {
  constructor(
    @Inject('OBJEKT_REPOSITORY')
    private objektRepository: Repository<ObjektEntity>,
    private readonly httpService: HttpService,
  ) {}

  redis = new Redis();

  async getObjekt(): Promise<boolean> {
    const url = `https://api.cosmo.fans/objekt/v1/token`;
    const datas: Set<string> = new Set(); // 중복된 collectionId를 확인하기 위한 Set

    const requests = []; // 모든 요청을 담을 배열

    for (let i = 80000; i < 100000; i++) {
      requests.push(this.fetchAndSaveObjekt(url, i, datas));
    }

    await Promise.all(requests); // 모든 요청 병렬 처리

    return true;
  }

  private async fetchAndSaveObjekt(
    url: string,
    id: number,
    datas: Set<string>,
  ) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${url}/${id}`),
      );

      const collectionId = response.data.objekt.collectionId;

      if (!datas.has(collectionId)) {
        datas.add(collectionId);

        const data = {
          collectionId: response.data.objekt.collectionId,
          season: response.data.objekt.season,
          member: response.data.objekt.member,
          collectionNo: response.data.objekt.collectionNo,
          classes: response.data.objekt.class,
          artists: response.data.objekt.artists[0],
          thumbnailImage: response.data.objekt.thumbnailImage,
        };

        await this.redis.sadd('seasons', data.season);
        await this.redis.sadd('members', data.member);
        await this.redis.sadd('collectionNos', data.collectionNo);
        await this.redis.sadd('classes', data.classes);

        await this.objektRepository
          .createQueryBuilder()
          .insert()
          .values(data)
          .execute();
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`404 error at ${id}, skipping...`);
      } else {
        console.error(`Error at ${id}:`, error.message);
      }
    }
  }
}
