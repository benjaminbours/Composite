import { OrthographicCamera, Scene, Vector3, WebGLRenderer } from 'three';
import CustomCamera from './CustomCamera';
import { Layer } from '@benjaminbours/composite-core';
import { LightPlayer } from './Player';

export const miniMapWidth = 1000;
export const miniMapHeight = 563;

export class MiniMapManager {
    public camera = new OrthographicCamera(
        -miniMapWidth,
        miniMapWidth,
        miniMapHeight,
        -miniMapHeight,
        1,
        5000,
    );

    public renderer: WebGLRenderer;

    constructor(public canvasDom: HTMLCanvasElement) {
        this.renderer = new WebGLRenderer({
            canvas: canvasDom,
            powerPreference: 'low-power',
            precision: 'lowp',
            alpha: true,
        });
        this.renderer.setPixelRatio(0.5);
        this.renderer.setSize(300, 167);

        this.camera.position.set(0, 563, 3000);
        this.camera.lookAt(0, 563, 0);
    }

    public updateCamera = (position: Vector3) => {
        this.camera.position.set(
            position.x,
            position.y <= 563 ? 563 : position.y,
            3000,
        );
    };

    public render = (
        camera: CustomCamera,
        scene: Scene,
        playerLight: LightPlayer,
    ) => {
        this.updateCamera(camera.position);
        this.camera.layers.enable(Layer.MINI_MAP);
        playerLight.mesh.scale.set(5, 5, 5);
        this.renderer.render(scene, this.camera);
        playerLight.mesh.scale.set(1, 1, 1);
    };
}
