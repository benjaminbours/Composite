// import * as dotenv from 'dotenv';
// dotenv.config({ path: `.env` });
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from 'src/auth/auth.service';

async function main() {
  const application = await NestFactory.createApplicationContext(AppModule);
  const authService = application.get(AuthService);

  const tokens = await authService.getTokens(
    17,
    'hathora_server@compositethegame.com',
    'ADMIN',
  );

  console.log('tokens', tokens);
}

main();
