import { putMeshOnGrid, multiplyByGridSize, sizeBox } from "../src/Game/Mesh/Grid";
import { Vector3, BoxGeometry, MeshBasicMaterial, Mesh, DoubleSide, Box3 } from "three";

describe("Grid", () => {
    test("element should have a width of 500", () => {
        const geometry = new BoxGeometry(
            multiplyByGridSize(2),
            multiplyByGridSize(2),
            multiplyByGridSize(2),
        );
        expect(geometry.parameters.width).toEqual(500);
    });

    test("element bbox.min should be at 0, 0, 0", () => {
        putMeshOnGrid(sizeBox, new Vector3(0, 0, 0));
        const bbox = new Box3().setFromObject(sizeBox);
        expect(bbox.min.x).toEqual(0);
        expect(bbox.min.y).toEqual(0);
        expect(bbox.min.z).toEqual(0);
    });
});
