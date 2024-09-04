import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './dm/dm.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis();
  app.useWebSocketAdapter(redisAdapter);
  await app.listen(3000);
}
bootstrap();
