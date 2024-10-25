import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AuthEntity } from './entities/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from './dto/auth.dto';
import { randomBytes } from 'crypto';
import * as nodemailer from 'nodemailer';
@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;
  private saltOrRounds = 10;

  constructor(
    @Inject('AUTH_REPOSITORY')
    private authRepository: Repository<AuthEntity>,
    private jwtService: JwtService,
    private configServcie: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: configServcie.get<string>('EMAIL_HOST'),
      port: parseInt(configServcie.get<string>('EMAIL_PORT'), 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: configServcie.get<string>('EMAIL_USER'), // 이메일 계정
        pass: configServcie.get<string>('EMAIL_PASS'), // 이메일 비밀번호
      },
    });
  }

  async register(req: SignUpDto): Promise<any> {
    const existingUser = await this.authRepository.findOne({
      where: { id: req.id },
    });

    if (existingUser) {
      throw new BadRequestException('ID already in use.');
    }

    const emailConfirmationToken = randomBytes(16).toString('hex');

    // JWT 인증 토큰 발급 추가
    const register = await this.authRepository
      .createQueryBuilder()
      .insert()
      .values({
        id: req.id,
        email: req.email,
        username: req.username,
        password: await bcrypt.hash(req.password, this.saltOrRounds),
        emailConfirmationToken: emailConfirmationToken,
      })
      .execute();

    // 이메일 전송 후 토큰 확인 로직까지 추가 요망
    await this.sendEmail(req.email, req.username, emailConfirmationToken);
    console.log(register);
    return true;
  }

  async sendEmail(to: string, subject: string, token: string): Promise<any> {
    // const url = `${token}`;
    const mailOptions = {
      // from: '"Example Team" <example@example.com>',
      to: to,
      subject: subject,
      text: 'Please confirm your email for service.',
      html: `Click here to confirm your email: <a href="http://localhost:3000/auth/confirm/${token}">Confirm Email</a>`,
    };

    const info = await this.transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
  }

  async confirmEmail(token: string): Promise<void> {
    const user = await this.authRepository.findOne({
      where: { emailConfirmationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Token is invalid.');
    }

    user.isEmailConfirmed = true;
    user.emailConfirmationToken = null;

    await this.authRepository.save(user);
  }

  async login(req: any): Promise<any> {
    const login = await this.authRepository
      .createQueryBuilder()
      .select()
      .where('id = :id', { id: req.id })
      .getOne();
    if (login === null) {
      throw new Error('There is no login information, register first please');
    }
    if (!login.isEmailConfirmed) {
      throw new Error(
        'Email not confirmed. Please check your email to confirm your account.',
      );
    }
    const check = await bcrypt.compare(req.password, login.password);
    if (check) {
      // JWT 인증 토큰 발급 추가
      const payload = { sub: login.id, username: login.username };

      login.accessToken = await this.jwtService.signAsync(payload);
      login.refreshToken = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      });

      await this.authRepository.save(login);

      return {
        accessToken: login.accessToken,
        refreshToken: login.refreshToken,
        userId: login.id,
        username: login.username,
      };
    } else throw new UnauthorizedException();
  }

  async kakaoValidateUser({
    profile,
    kakaoAccessToken,
    kakaoRefreshToken,
  }: any): Promise<any> {
    // 카카오 프로필 정보를 통해 유저 검증 및 DB에 저장하거나 불러옵니다.
    const { id, username } = profile;
    const user = {
      kakaoId: id,
      username: username,
      accessToken: kakaoAccessToken,
      refreshToken: kakaoRefreshToken,
    };

    const existingUser = await this.authRepository.findOne({
      where: { id: profile.id },
    });

    if (existingUser) {
      return user;
    } else {
      // TypeORM으로 DB에 유저 추가
      const newUser = await this.authRepository
        .createQueryBuilder()
        .insert()
        .values({
          id: profile.id,
          username: profile.username,
          accessToken: kakaoAccessToken,
          refreshToken: kakaoRefreshToken,
        })
        .execute();
      console.log(newUser);
    }
    return user;
  }

  async googleValidateUser({
    profile,
    googleAccessToken,
    googleRefreshToken,
  }: any): Promise<any> {
    // 구글 프로필 정보를 통해 유저 검증 및 DB에 저장하거나 불러옵니다.
    const { id, emails, displayName } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      username: displayName,
    };

    const existingUser = await this.authRepository.findOne({
      where: { id: profile.id },
    });

    if (existingUser) {
      return user;
    } else {
      // TypeORM으로 DB에 유저 추가
      const newUser = await this.authRepository
        .createQueryBuilder()
        .insert()
        .values({
          id: profile.id,
          username: profile.username,
          accessToken: googleAccessToken,
          refreshToken: googleRefreshToken,
        })
        .execute();
      console.log(newUser);
    }
    return user;
  }

  async validateOAuthLogin(
    thirdPartyId: string,
    provider: string,
  ): Promise<string> {
    const payload = { thirdPartyId, provider };
    return this.jwtService.signAsync(payload);
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken); // 리프레시 토큰 검증
      console.log('토큰 검사 완료', decoded);

      const user = await this.authRepository.findOne(decoded.id);
      if (!user) {
        throw new UnauthorizedException();
      }
      const payload = { sub: user.id, username: user.username };
      return {
        accessToken: this.jwtService.sign(payload), // 새 액세스 토큰 발급
      };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
