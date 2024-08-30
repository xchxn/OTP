// KakaoStrategy
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      callbackURL: 'http://localhost:3000/auth/kakao/callback',
    });
  }

  // async validate(
  //   accessToken: string,
  //   refreshToken: string,
  //   profile: any,
  //   done: any,
  // ) {
  //   const profileJson = profile._json;
  //   const kakaoId = profileJson.id;
  //   try {
  //     const user: {
  //       accessToken: string;
  //       kakaoId: string;
  //       refreshToken: string;
  //     } = {
  //       accessToken,
  //       refreshToken,
  //       kakaoId,
  //     };
  //     done(null, user);
  //   } catch (error) {
  //     done(error);
  //   }
  // }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function,
  ): Promise<any> {
    try {
      const user = await this.authService.kakaoValidateUser({
        profile,
        kakaoAccessToken: accessToken,
        kakaoRefreshToken: refreshToken,
      });
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}
