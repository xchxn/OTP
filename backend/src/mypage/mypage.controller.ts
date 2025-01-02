import { Body, Controller, Get, Post } from '@nestjs/common';
import { MypageService } from './mypage.service';

@Controller('mypage')
export class MypageController {
  constructor(private readonly mypageService: MypageService) {}

  @Get('/myInfo')
  async getMyInfo(@Body() body: any): Promise<any> {
    return this.mypageService.getMyInfo(body);
  }

  @Post('/myUpdate')
  async updateMyInfo(@Body() body: any): Promise<any> {
    return this.mypageService.updateMyInfo(body);
  }

  @Post('/myDelete')
  async deleteMyInfo(@Body() body: any): Promise<any> {
    return this.mypageService.deleteMyInfo(body);
  }
}
