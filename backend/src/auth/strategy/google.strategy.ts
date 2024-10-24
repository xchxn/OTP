// src/auth/strategies/google.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/google/callback',
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

    try {
      const user = await this.authService.googleValidateUser({
        profile,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
      });
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
}
