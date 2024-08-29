import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 일반 로그인, 회원가입
  @Post('login')
  async login(@Body() req: any): Promise<any> {
    return this.authService.login(req);
  }

  @Post('register')
  async register(@Body() req: any): Promise<any> {
    return this.authService.register(req);
  }

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoLogin(): Promise<void> {
    // 카카오 로그인 진입점
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  kakaoLoginCallback(@Req() req: any) {
    // 리다이렉트 후 유저 정보가 req.user에 담깁니다.
    return req.user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(): Promise<void> {
    // 구글 로그인 진입점
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req) {
    // 리다이렉트 후 유저 정보가 req.user에 담깁니다.
    return req.user;
  }
}
