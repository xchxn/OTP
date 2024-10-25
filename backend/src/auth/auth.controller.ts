import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto, SignUpDto } from './dto/auth.dto';
import { Response } from 'express';
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
import { JwtAuthGuard } from './jwt-auth.guard';

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
  async login(@Body() req: LoginDto): Promise<any> {
    const result = await this.authService.login(req);

    return {
      message: 'Login Success',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      userId: result.userId,
      username: result.username,
    };
  }

  @Post('register')
  async register(@Body() req: SignUpDto): Promise<any> {
    return this.authService.register(req);
  }

  @Get('confirm/:token')
  async confirmEmail(
    @Param('token') token: string,
    @Res() res: Response,
  ): Promise<any> {
    try {
      // 이메일 확인 처리
      await this.authService.confirmEmail(token);

      // 이메일 확인 후 리다이렉트
      res.redirect('http://localhost:4200/auth'); // 성공 페이지로 리다이렉트
    } catch (error) {
      // 이메일 확인 실패 시 리다이렉트
      res.redirect('http://localhost:4200/auth'); // 실패 페이지로 리다이렉트
    }
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

    const accessToken = user.accessToken;
    const refreshToken = user.refreshToken;
    const userId = user.kakaoId;
    const username = user.username;
    res.redirect(
      `http://localhost:4200?accessToken=${accessToken}&refreshtoken=${refreshToken}&userId=${userId}&username=${username}`,
    );
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
    const accessToken = user.accessToken;
    const refreshToken = user.refreshToken;
    const userId = user.googleId;
    const username = user.username;

    res.redirect(
      `http://localhost:4200?accessToken=${accessToken}&refreshtoken=${refreshToken}&userId=${userId}&username=${username}`,
    );

    // return req.user;
  }

  // JWT Token Refresh
  // @UseGuards(JwtAuthGuard) // Optional: Use this if you require the user to be initially authenticated
  @Post('refresh')
  async refreshAccessToken(
    @Body() body: { refreshToken: string },
    @Res() res: Response,
  ) {
    try {
      const newAccessToken = await this.authService.refreshToken(
        body.refreshToken,
      );
      res.json({ accessToken: newAccessToken });
    } catch (error) {
      throw new UnauthorizedException('Failed to refresh access token');
    }
  }
}
