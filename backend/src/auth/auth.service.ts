import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor() {}

  async kakaoValidateUser(profile: any): Promise<any> {
    // 카카오 프로필 정보를 통해 유저 검증 및 DB에 저장하거나 불러옵니다.
    const { id, username } = profile;
    const user = {
      kakaoId: id,
      username: username,
    };
    // 예시: 유저가 없다면 DB에 생성
    // const existingUser = await this.usersService.findByKakaoId(id);
    // if (!existingUser) {
    //   return await this.usersService.create(user);
    // }
    return user;
  }

  async googleValidateUser(profile: any): Promise<any> {
    // 구글 프로필 정보를 통해 유저 검증 및 DB에 저장하거나 불러옵니다.
    const { id, emails, displayName } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      username: displayName,
    };
    // 예시: 유저가 없다면 DB에 생성
    // const existingUser = await this.usersService.findByGoogleId(id);
    // if (!existingUser) {
    //   return await this.usersService.create(user);
    // }
    return user;
  }
}
