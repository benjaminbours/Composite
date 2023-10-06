// vendors
import { NestFactory } from '@nestjs/core';
// eslint-disable-next-line
const NodeThreeExporter = require('@injectit/threejs-nodejs-exporters');
import * as fs from 'fs';
import type { Mesh } from 'three';
// our libs
import { addToGeometries } from '@benjaminbours/composite-core';

import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis-io.adapter';
import { ENVIRONMENT } from './environment';

async function bootstrap() {
  // load 3d assets for physics calculation server side
  const assetsFile = fs.readFileSync(`${process.cwd()}/assets.glb`);
  const onParse = (object) => {
    object.scene.children.forEach((mesh: Mesh) => {
      addToGeometries(mesh);
    });
  };
  const exporter = new NodeThreeExporter();
  exporter.parse('glb', assetsFile, onParse);

  const app = await NestFactory.create(AppModule);
  // disable while cors is managed in load balancer
  // app.enableCors({ origin: [ENVIRONMENT.CLIENT_URL] });
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  await app.listen(ENVIRONMENT.PORT);
}
bootstrap();
