import { Body, Controller, Post } from '@nestjs/common';
import { DMGateway } from './dm.gateway';
@Controller('dm')
export class DmController {
  constructor(private readonly dmgateway: DMGateway) {}

  // @Post('list')
  // async getUserSessions(@Body('userId') userId: string): Promise<any> {
  //   return this.dmgateway.getUserSessions(userId);
  // }
}
