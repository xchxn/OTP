import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { boardProviders } from './board.providers';
import { DatabaseModule } from 'src/database/database.module';
import { CommentEntity } from './entities/comment.entity';
import { PostingEntity } from './entities/posting.entity';
import { ObjektEntity } from './entities/objekt.entity';
@Module({
  imports: [DatabaseModule],
  controllers: [BoardController],
  providers: [...boardProviders, BoardService],
})
export class BoardModule {}
