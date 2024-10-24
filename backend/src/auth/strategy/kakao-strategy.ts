// KakaoStrategy
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { AuthService } from '../auth.service';
import { VerifyCallback } from 'passport-google-oauth20';

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

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { id } = profile;
    const user = await this.authService.validateOAuthLogin(id, 'kakao');
    if (!user) {
      throw new UnauthorizedException();
    }
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
