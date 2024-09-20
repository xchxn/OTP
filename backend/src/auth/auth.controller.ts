import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto, SignUpDto } from './dto/auth.dto';

import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiExcludeEndpoint,
  ApiProduces,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('인증 API')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 일반 로그인, 회원가입
  @ApiProduces('application/json')
  @ApiConsumes('application/json')
  @ApiOperation({ summary: '사용자 로그인 처리 후 JWT 토큰 반환' })
  @ApiBody({
    description: '로그인 요청 정보',
    type: LoginDto,
  })
  @Post('login')
  async login(@Body() req: LoginDto, @Res() res: any): Promise<any> {
    const result = await this.authService.login(req);
    res.cookie('accessToken', result.token, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000, // 15분
    });
    return res.send({ message: 'Login Success' });
  }

  @Post('register')
  async register(@Body() req: SignUpDto): Promise<any> {
    return this.authService.register(req);
  }

  @Post('confirm/:token')
  async confirmEmail(@Param('token') token: string): Promise<any> {
    return this.authService.confirmEmail(token);
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

    res.cookie('kakaoId', user.googleId, {
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
