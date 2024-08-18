import { Body, Controller, Get, Post } from '@nestjs/common';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  getBoardList(): any {
    return this.boardService.getPostingList();
  }

  @Post()
  createPosting(
    @Body()
    body: {
      user: string;
      content: string;
      author: string;
      objekts: string;
    },
  ): any {
    return this.boardService.createPosting(body);
  }

  @Post()
  updatePosting(
    @Body()
    body: {
      user: string;
      content: string;
      author: string;
      objekts: string;
    },
  ): any {
    return this.boardService.updatePosting(body);
  }

  @Post()
  deletePosting(@Body() body: { id: string }): any {
    return this.boardService.deletePosting(body);
  }
}
