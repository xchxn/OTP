import { Module } from '@nestjs/common';
import { DmService } from './dm.service';
import { DmController } from './dm.controller';
import { ChatGateway } from './chat.gateway';
import { DMGateway } from './dm.gateway';
import { RedisIoAdapter } from './dm.adapter';

@Module({
  providers: [
    DmService,
    ChatGateway,
    DMGateway,
    { provide: 'APP_ADAPTER', useClass: RedisIoAdapter },
  ],
  controllers: [DmController],
})
export class DmModule {}
