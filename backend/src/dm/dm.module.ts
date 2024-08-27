import { Module } from '@nestjs/common';
import { DmService } from './dm.service';
import { DmController } from './dm.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [DmService, ChatGateway],
  controllers: [DmController],
})
export class DmModule {}
