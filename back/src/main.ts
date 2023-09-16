import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis.adapter';
import { ENVIRONMENT } from './environment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: [ENVIRONMENT.CLIENT_URL] });
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  await app.listen(ENVIRONMENT.PORT);
}
bootstrap();
