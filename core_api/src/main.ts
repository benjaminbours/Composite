// vendors
import { NestFactory } from '@nestjs/core';
// eslint-disable-next-line
import * as fs from 'fs';
import { BufferGeometry, Mesh, ObjectLoader, Scene } from 'three';
import { SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
} from 'three-mesh-bvh';
// addExtensionFunctions
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;
// our libs
import { geometries } from '@benjaminbours/composite-core';

import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis-io.adapter';
import { ENVIRONMENT } from '@project-common/environment';
import { ValidationPipe } from '@nestjs/common';
import {
  generateSwaggerDocument,
  generateSwaggerSpec,
} from './scripts/swagger';

async function bootstrap() {
  // load 3d assets for physics calculation server side
  const assets = JSON.parse(
    fs.readFileSync(`${process.cwd()}/assets.json`).toString(),
  );
  const scene = new ObjectLoader().parse(assets) as Scene;
  scene.children.forEach((mesh: Mesh) => {
    mesh.geometry.computeBoundsTree = computeBoundsTree;
    mesh.geometry.disposeBoundsTree = disposeBoundsTree;
    geometries[mesh.name] = mesh.geometry;
  });

  const app = await NestFactory.create(AppModule);
  // disable while cors is managed in load balancer
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  console.log('HERE', ENVIRONMENT.DATABASE_URL);

  if (ENVIRONMENT.STAGE === 'local') {
    const document = generateSwaggerDocument(app);
    generateSwaggerSpec(app);
    SwaggerModule.setup('api', app, document);
  }

  const rawBodyBuffer = (req, res, buffer, encoding) => {
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
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  await app.listen(ENVIRONMENT.PORT);
}
bootstrap();
