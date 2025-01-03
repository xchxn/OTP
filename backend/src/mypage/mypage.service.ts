import { Inject, Injectable } from '@nestjs/common';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MypageService {
  constructor(
    @Inject('AUTH_REPOSITORY')
    private authRepository: Repository<AuthEntity>,
  ) {}

  async getMyInfo(body: any): Promise<any> {
    const myInfo = await this.authRepository
      .createQueryBuilder()
      .select([
        'username',
        'email',
      ])
      .where('id = :id', { id: body.userId })
      .getRawOne();
    console.log(myInfo);
    return myInfo;
  }

  async updateMyInfo(body: any): Promise<any> {
    const updateMyInfo = await this.authRepository
      .createQueryBuilder()
      .update()
      .set({ username: body.username })
      .where('id = :id', { id: body.userId })
      .execute();
    console.log(updateMyInfo);
    return updateMyInfo;
  }

  async deleteMyInfo(body: any): Promise<any> {
    const deleteMyInfo = await this.authRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: body.userId })
      .execute();
    return deleteMyInfo;
  }
}
