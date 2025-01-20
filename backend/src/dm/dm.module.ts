import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DmGateway } from './dm.gateway';
import { DmQueueService } from './dm.queue.service';
import { DmChatListService } from './dm.chat-list.service';
import { DmProcessor } from './dm.processor';
import { redisConfig } from '../config/redis.config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    BullModule.forRoot({
      redis: redisConfig
    }),
    BullModule.registerQueue({
      name: 'dm_queue'
    }),
  ],
  providers: [
    DmGateway,
    DmQueueService,
    DmChatListService,
    DmProcessor
  ],
  exports: [
    DmGateway,
    DmQueueService,
    DmChatListService,
    DmProcessor
  ]
})
export class DmModule {}
