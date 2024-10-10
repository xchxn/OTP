import { Module } from '@nestjs/common';
import { TestingModule } from './testing/testing.module';
import { ConfigModule } from '@nestjs/config';
import { DmModule } from './dm/dm.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { SearchModule } from './search/search.module';
import { ManageModule } from './manage/manage.module';

@Module({
  imports: [
    TestingModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    DmModule,
    AuthModule,
    BoardModule,
    SearchModule,
    ManageModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
