// os native
import * as path from 'path';
import * as fs from 'fs';
// vendors
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as pjson from '../../package.json';

export function generateSwaggerDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Composite API')
    .setDescription('Composite the game API')
    .setVersion(pjson.version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  return document;
}

export function generateSwaggerSpec(app: INestApplication) {
  const document = generateSwaggerDocument(app);
  const outputPath = path.resolve(process.cwd(), 'swagger.json');

  fs.writeFileSync(outputPath, JSON.stringify(document), {
    encoding: 'utf8',
  });
}
