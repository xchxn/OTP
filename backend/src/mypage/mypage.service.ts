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
      .createQueryBuilder('auth')
      .select([
        'auth.username',
        'auth.email',
      ])
      .where('id = :id', { id: body.id })
      .getRawOne();
    return myInfo;
  }

  async updateMyInfo(body: any): Promise<any> {
    const updateMyInfo = await this.authRepository
      .createQueryBuilder()
      .update()
      .set({ username: body.username, email: body.email })
      .where('id = :id', { id: body.id })
      .execute();
    return updateMyInfo;
  }

  async deleteMyInfo(body: any): Promise<any> {
    const deleteMyInfo = await this.authRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: body.id })
      .execute();
    return deleteMyInfo;
  }
}
