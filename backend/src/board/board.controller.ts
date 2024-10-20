import { Body, Controller, Get, Post } from '@nestjs/common';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('list')
  getBoardList(): any {
    return this.boardService.getPostingList();
  }

  @Post('create')
  createPosting(
    @Body()
    body: {
      title: string;
      content: string;
      username: string;
      objekt: {
        have: number[];
        want: number[];
      };
    },
  ): any {
    return this.boardService.createPosting(body);
  }

  @Post('update')
  updatePosting(
    @Body()
    body: {
      posting_id: string;
      posting_title: string;
      posting_content: string;
      posting_objekts: string;
    },
  ): any {
    return this.boardService.updatePosting(body);
  }

  @Post('delete')
  deletePosting(@Body() body: any): any {
    return this.boardService.deletePosting(body.id);
  }

  @Get('option')
  getSelectOption(): any {
    return this.boardService.getSelectOption();
  }

  @Post('objekt')
  getTargetObjekt(@Body() body: any): any {
    return this.boardService.getTargetObjekt(body);
  }

  @Post('thumbnail')
  getThumbnail(@Body() body: any): any {
    return this.boardService.getThumbnail(body);
  }
}
