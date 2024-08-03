import { BufferGeometry, Mesh, ObjectLoader, Scene } from 'three';
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
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { ENVIRONMENT } from './environment';
// 3D

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
  await app.listen(ENVIRONMENT.PORT);
}
bootstrap();
