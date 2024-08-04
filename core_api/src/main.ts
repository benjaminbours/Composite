// vendors
import { NestFactory } from '@nestjs/core';
// eslint-disable-next-line
import { SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { ENVIRONMENT } from '@project-common/environment';
import { ValidationPipe } from '@nestjs/common';
import {
  generateSwaggerDocument,
  generateSwaggerSpec,
} from './scripts/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  if (ENVIRONMENT.STAGE === 'local') {
    const document = generateSwaggerDocument(app);
    generateSwaggerSpec(app);
    SwaggerModule.setup('api', app, document);
  }

  const rawBodyBuffer = (req, _res, buffer, encoding) => {
    if (!req.headers['stripe-signature']) {
      return;
    }

    if (buffer && buffer.length) {
      req.rawBody = buffer.toString(encoding || 'utf8');
    }
  };

  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ verify: rawBodyBuffer }));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(ENVIRONMENT.PORT);
}
bootstrap();
