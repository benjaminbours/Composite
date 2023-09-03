import {
    BoxGeometry,
    DoubleSide,
    MeshPhongMaterial,
    Object3D,
    Vector3,
} from 'three';
import { createMeshForGrid, gridSize, positionOnGrid } from '../Mesh/Grid';
import { Geometries, GeometriesRegistry } from '../types';

// TODO: Its not clear the fact is instantiated here then populate with more
// geometry later when loading assets. Lets make the loading function return a proper
// loading registry
export const geometries: GeometriesRegistry = {
    border: new BoxGeometry(100, 10, 100),
    platform: new BoxGeometry(gridSize * 0.65, 10, gridSize * 2.5),
};

const materials = {
    phong: new MeshPhongMaterial({
        color: 0xffffff,
        side: DoubleSide,
        specular: 0x000000,
        shininess: 0,
        transparent: true,
    }),
    border: new MeshPhongMaterial({
        color: 0xffffff,
        side: DoubleSide,
    }),
};

export function createWall(
    size: Vector3,
    position: Vector3,
    rotation: Vector3,
    ambientOcclusionMap?: any,
) {
    const group = new Object3D();

    for (var i = 0; i < size.x; i++) {
        const wallPiece = (() => {
            // if (ambientOcclusionMap) {
            //     return this.createMesh('phong', this.lib.geometries.wall.raw, {
            //         aoMap: this.lib.wallLight.raw,
            //         name: 'wallAo',
            //     });
            // }
            return createMeshForGrid(geometries.wall as any, materials.phong);
            // return this.createMesh('phong', this.lib.geometries.wall.raw, {
            //     aoMap: null,
            //     name: 'wall',
            // });
        })();
        positionOnGrid(wallPiece, new Vector3(i, 0, 0));

        // this.placeElementOnGrid(wall, {
        //     x: i + 0,
        //     y: 0,
        //     z: 0,
        // });

        group.add(wallPiece);

        if (size.y) {
            for (var j = 1; j < size.y; j++) {
                const wallFloor = createMeshForGrid(
                    geometries.wall as any,
                    materials.phong,
                );
                // const wallStage = this.createMesh(
                //     'phong',
                //     this.lib.geometries.wall.raw,
                //     {
                //         aoMap: null,
                //         name: 'wall',
                //     },
                // );
                positionOnGrid(wallFloor, new Vector3(i, j, 0));
                // this.placeElementOnGrid(wallStage, {
                //     x: i + 0,
                //     y: j,
                //     z: 0,
                // });
                group.add(wallFloor);
            }
        }
    }

    // position the whole group
    positionOnGrid(group, position, rotation);

    return group;
}
