import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { KakaoStrategy } from './strategy/kakao-strategy';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategy/google.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.jwtConstants,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, KakaoStrategy, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
