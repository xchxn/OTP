// KakaoStrategy
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      callbackURL: 'http://localhost:3000/auth/kakao/callback',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ) {
    const profileJson = profile._json;
    const kakaoId = profileJson.id;
    try {
      const user: {
        accessToken: string;
        kakaoId: string;
        refreshToken: string;
      } = {
        accessToken,
        refreshToken,
        kakaoId,
      };
      done(null, user);
    } catch (error) {
      done(error);
    }
  }

  // async kakaoValidateUser(
  //   accessToken: string,
  //   refreshToken: string,
  //   profile: Profile,
  //   done: Function,
  // ): Promise<any> {
  //   try {
  //     const user = await this.authService.validateUser(profile);
  //     done(null, user);
  //   } catch (err) {
  //     done(err, false);
  //   }
  // }
}
