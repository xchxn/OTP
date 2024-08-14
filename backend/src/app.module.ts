import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestingModule } from './testing/testing.module';
import { ConfigModule } from '@nestjs/config';
import { DmModule } from './dm/dm.module';
import { DatabaseModule } from './database/database.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    TestingModule,
    ConfigModule.forRoot(),
    DatabaseModule,
    DmModule,
    AuthModule,
    BoardModule,
    SearchModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
