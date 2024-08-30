import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AuthEntity } from './entities/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_REPOSITORY')
    private authRepository: Repository<AuthEntity>,
    private jwtService: JwtService,
    private configServcie: ConfigService,
  ) {}

  private saltOrRounds = 10;

  async register(req: any): Promise<any> {
    const existingUser = await this.authRepository.findOne({
      where: { id: req.id },
    });

    if (existingUser) {
      throw new BadRequestException('ID already in use.');
    }

    const payload = { sub: req.id, username: req.username };
    // JWT 인증 토큰 발급 추가
    const register = await this.authRepository
      .createQueryBuilder()
      .insert()
      .values({
        id: req.id,
        password: await bcrypt.hash(req.password, this.saltOrRounds),
        accessToken: await this.jwtService.signAsync(payload),
      })
      .execute();
    console.log(register);
    return true;
  }

  async login(req: any): Promise<any> {
    const login = await this.authRepository
      .createQueryBuilder()
      .select()
      .where('id = :id', { id: req.id })
      .getOne();
    const check = await bcrypt.compare(req.password, login.password);
    if (check) return true;
    else throw new UnauthorizedException();
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
    // 예시: 유저가 없다면 DB에 생성
    // const existingUser = await this.usersService.findByKakaoId(id);
    // if (!existingUser) {
    //   return await this.usersService.create(user);
    // }
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

    // 예시: 유저가 없다면 DB에 생성
    // const existingUser = await this.usersService.findByGoogleId(id);
    // if (!existingUser) {
    //   return await this.usersService.create(user);
    // }
    return user;
  }
}
