import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails } = profile;
    const userPayload = {
      googleId: id,
      email: emails[0].value,
      name: name.givenName + ' ' + name.familyName,
      accessToken,
    };

    const jwtToken = await this.authService.validateOAuthLogin(id, 'google');
    if (!jwtToken) {
      return done(new UnauthorizedException(), false);
    }
    userPayload['jwt'] = jwtToken;
    done(null, userPayload);
  }
}
