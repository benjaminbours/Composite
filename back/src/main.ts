// vendors
import { NestFactory } from '@nestjs/core';
// eslint-disable-next-line
const NodeThreeExporter = require('@injectit/threejs-nodejs-exporters');
import * as fs from 'fs';
import { BufferGeometry, Mesh } from 'three';
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
  const assetsFile = fs.readFileSync(`${process.cwd()}/assets.glb`);
  const onParse = (object) => {
    object.scene.children.forEach((mesh: Mesh) => {
      (mesh.geometry as any).computeBoundsTree = computeBoundsTree;
      (mesh.geometry as any).disposeBoundsTree = disposeBoundsTree;
      geometries[mesh.name] = mesh.geometry;
    });
  };
  const exporter = new NodeThreeExporter();
  exporter.parse('glb', assetsFile, onParse);

  const app = await NestFactory.create(AppModule);
  // disable while cors is managed in load balancer
  // app.enableCors({ allowedHeaders: ['content-type'] });

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
