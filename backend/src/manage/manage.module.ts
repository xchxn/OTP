import { Module } from '@nestjs/common';
import { ManageService } from './manage.service';
import { ManageController } from './manage.controller';

@Module({
  providers: [ManageService],
  controllers: [ManageController]
})
export class ManageModule {}
