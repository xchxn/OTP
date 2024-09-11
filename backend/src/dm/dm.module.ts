import { Module } from '@nestjs/common';
import { DmService } from './dm.service';
import { DmController } from './dm.controller';
import { DMGateway } from './dm.gateway';

@Module({
  providers: [DmService, DMGateway],
  controllers: [DmController],
})
export class DmModule {}
