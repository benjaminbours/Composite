// vendors
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import {
    WebGLRenderer,
    Scene,
    Vector2,
    WebGLRenderTarget,
    PCFSoftShadowMap,
    ReinhardToneMapping,
    Layers,
} from 'three';
// our libs
import {
    GameState,
    Layer,
    MovableComponentState,
    Side,
    materials,
} from '@benjaminbours/composite-core';
// project
import basicPostProdVS from './glsl/basic_postprod_vs.glsl';
import playerInsideFS from './glsl/playerInside_fs.glsl';
import mixPassFS from './glsl/mixPass_fs.glsl';
import volumetricLightPlayerFS from './glsl/volumetricLightPlayer_fs.glsl';
import CustomCamera from './CustomCamera';
import { LightPlayer, Player } from './Player';
import { MiniMapManager } from './MiniMapManager';

const tempMaterials: Record<string, any> = {};

const bloomLayer = new Layers();
bloomLayer.set(Layer.BLOOM);

const playerOcclusionLayer = new Layers();
playerOcclusionLayer.set(Layer.OCCLUSION_PLAYER);

export class RendererManager {
    public renderer: WebGLRenderer;
    private renderPass: RenderPass;
    private width = window.innerWidth;
    private height = window.innerHeight;

    // player occlusion
    private playerOcclusionComposer: EffectComposer;
    public playerVolumetricLightPass: ShaderPass;
    // bloom
    private bloomComposer: EffectComposer;
    // player inside
    private playerInsideComposer?: EffectComposer;
    private playerInsideMixPass?: ShaderPass;
    // main
    private mainComposer: EffectComposer;

    private createRenderTarget = (
        width: number,
        height: number,
        renderScale: number,
    ) => {
        return new WebGLRenderTarget(width * renderScale, height * renderScale);
    };

    private createMixPass = (addTexture: WebGLRenderTarget) => {
        const mixPass = new ShaderPass(
            {
                uniforms: {
                    baseTexture: { value: null },
                    addTexture: { value: null },
                },
                vertexShader: basicPostProdVS,
                fragmentShader: mixPassFS,
            },
            'baseTexture',
        );
        mixPass.uniforms.addTexture.value = addTexture.texture;

        return mixPass;
    };

    private createOcclusionComposer = (
        renderer: WebGLRenderer,
        renderPass: RenderPass,
        lightPass: ShaderPass,
        occlusionRenderTarget: WebGLRenderTarget,
    ) => {
        const occlusionComposer = new EffectComposer(
            renderer,
            occlusionRenderTarget,
        );
        occlusionComposer.renderToScreen = false;
        occlusionComposer.addPass(renderPass);
        occlusionComposer.addPass(lightPass);

        return occlusionComposer;
    };

    public players?: Player[];

    public miniMapManager: MiniMapManager;

    constructor(
        private camera: CustomCamera,
        public canvasDom: HTMLCanvasElement,
        public canvasMiniMapDom: HTMLCanvasElement,
        private scene: Scene,
    ) {
        // init renderer
        this.renderer = new WebGLRenderer({
            canvas: canvasDom,
            powerPreference: 'high-performance',
            precision: 'highp',
            // antialias: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        this.renderer.toneMapping = ReinhardToneMapping;

        // post processing
        const renderScale = 1;

        this.renderPass = new RenderPass(scene, this.camera);

        // create occlusion render for player light
        const occlusionRenderTarget = this.createRenderTarget(
            this.width,
            this.height,
            renderScale,
        );
        this.playerVolumetricLightPass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                lightPosition: { value: new Vector2(0.5, 0.5) },
                exposure: { value: 0.18 },
                decay: { value: 0.97 },
                density: { value: 0.8 },
                weight: { value: 0.5 },
                samples: { value: 100 },
                time: { value: 0 },
            },
            vertexShader: basicPostProdVS,
            fragmentShader: volumetricLightPlayerFS,
        });
        this.playerVolumetricLightPass.needsSwap = false;
        this.playerOcclusionComposer = this.createOcclusionComposer(
            this.renderer,
            this.renderPass,
            this.playerVolumetricLightPass,
            occlusionRenderTarget,
        );
        const playerOcclusionRenderPass = this.createMixPass(
            occlusionRenderTarget,
        );

        const bloomPass = new UnrealBloomPass(
            new Vector2(window.innerWidth, window.innerHeight),
            0.6,
            0.4,
            0.85,
        );

        this.bloomComposer = new EffectComposer(this.renderer);
        this.bloomComposer.renderToScreen = false;
        this.bloomComposer.addPass(this.renderPass);
        this.bloomComposer.addPass(bloomPass);

        const bloomMixPass = this.createMixPass(
            this.bloomComposer.renderTarget2,
        );
        bloomMixPass.needsSwap = true;

        this.mainComposer = new EffectComposer(this.renderer);
        this.mainComposer.addPass(this.renderPass);
        this.mainComposer.addPass(playerOcclusionRenderPass);
        this.mainComposer.addPass(bloomMixPass);
        // this.mainComposer.addPass(new OutputPass());

        // setup minimap
        this.miniMapManager = new MiniMapManager(canvasMiniMapDom);
    }

    // create a renderer for when a player is inside an element
    public addPlayerInsideComposer = () => {
        const renderScale = 1;
        const playerInsideRenderTarget = this.createRenderTarget(
            this.width,
            this.height,
            renderScale,
        );
        const playerInsidePass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
            },
            vertexShader: basicPostProdVS,
            fragmentShader: playerInsideFS,
        });
        playerInsidePass.needsSwap = false;
        this.playerInsideComposer = new EffectComposer(
            this.renderer,
            playerInsideRenderTarget,
        );
        this.playerInsideComposer.renderToScreen = false;
        this.playerInsideComposer.addPass(this.renderPass);
        this.playerInsideComposer.addPass(playerInsidePass);
        this.playerInsideMixPass = this.createMixPass(playerInsideRenderTarget);
        this.mainComposer.addPass(this.playerInsideMixPass);
    };

    public removePlayerInsideComposer = () => {
        if (!this.playerInsideMixPass) {
            return;
        }
        this.mainComposer.removePass(this.playerInsideMixPass);
        this.playerInsideMixPass = undefined;
        this.playerInsideComposer = undefined;
    };

    private renderPlayerInsideComposer = (state: GameState) => {
        if (!this.playerInsideComposer || !this.players) {
            return;
        }
        if (
            state.players.some(
                (player) => player.state === MovableComponentState.inside,
            )
        ) {
            for (let i = 0; i < state.players.length; i++) {
                const player = state.players[i];

                if (player.state === MovableComponentState.inside) {
                    (this.players[i] as any).mesh.layers.enable(
                        Layer.PLAYER_INSIDE,
                    );
                } else {
                    (this.players[i] as any).mesh.layers.disable(
                        Layer.PLAYER_INSIDE,
                    );
                }
            }
            this.camera.layers.set(Layer.PLAYER_INSIDE);
            this.renderer.setClearColor(0x444444);
            this.playerInsideComposer.render();
        } else {
            this.renderer.setRenderTarget(
                this.playerInsideComposer.renderTarget1,
            );
            this.renderer.clear();
        }
    };

    public render = (state: GameState, delta: number) => {
        this.renderer.setClearColor(0x000000);
        // update materials for light elements
        this.scene.traverse((obj: any) => {
            if (
                obj.isMesh &&
                bloomLayer.test(obj.layers) === true &&
                obj.side !== Side.LIGHT
            ) {
                tempMaterials[obj.uuid] = obj.material;
                obj.material = materials.occlusion;
            }
        });
        this.camera.layers.set(Layer.OCCLUSION_PLAYER);
        this.playerOcclusionComposer.render();

        this.camera.layers.set(Layer.BLOOM);
        this.bloomComposer.render();
        // restore materials
        this.scene.traverse((obj: any) => {
            if (tempMaterials[obj.uuid]) {
                obj.material = tempMaterials[obj.uuid];
                delete tempMaterials[obj.uuid];
            }
        });
        this.renderPlayerInsideComposer(state);
        this.camera.layers.set(Layer.DEFAULT);
        this.renderer.setClearColor(0x000000);
        this.mainComposer.render();

        // minimap
        this.miniMapManager.render(
            this.camera,
            this.scene,
            this.players![1] as LightPlayer,
        );
    };

    public resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);

        // Update the composers
        this.playerOcclusionComposer.setSize(width, height);
        this.playerInsideComposer?.setSize(width, height);
        this.bloomComposer.setSize(width, height);
        this.mainComposer.setSize(width, height);
    };
}
