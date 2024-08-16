import { Controller, Get, Post } from '@nestjs/common';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  getBoardList(): any {
    return this.boardService.getPostingList();
  }

  @Post()
  createPosting(): any {
    return this.boardService.createPosting();
  }

  @Post()
  updatePosting(): any {
    return this.boardService.updatePosting();
  }

  @Post()
  deletePosting(): any {
    return this.boardService.deletePosting();
  }
}
