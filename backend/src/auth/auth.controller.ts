import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
  kakaoLoginCallback(@Req() req: any, @Res({ passthrough: true }) res: any) {
    // 리다이렉트 후 유저 정보가 req.user에 담깁니다.
    const { user } = req;

    console.log(user);

    res.cookie('kakaoId', user.kakaoId, {
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    res.cookie('accessToken', user.accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000, // 15분
    });

    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    res.redirect('http://localhost:4200');
    // return req.user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(): Promise<void> {
    // 구글 로그인 진입점
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req: any, @Res({ passthrough: true }) res: any) {
    // 리다이렉트 후 유저 정보가 req.user에 담깁니다.
    const { user } = req;

    console.log(user);

    res.cookie('kakaoId', user.kakaoId, {
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    res.cookie('accessToken', user.accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000, // 15분
    });

    res.cookie('refreshToken', user.refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    });

    res.redirect('http://localhost:4200');

    // return req.user;
  }
}
