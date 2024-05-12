// vendors
import { NestFactory } from '@nestjs/core';
import { generateSwaggerSpec } from './swagger';
import { AppModule } from '../app.module';

async function main() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  generateSwaggerSpec(app);
}

main().then(() => {
  process.exit();
});
