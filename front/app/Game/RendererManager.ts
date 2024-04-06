// vendors
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
    WebGLRenderer,
    Scene,
    Vector2,
    WebGLRenderTarget,
    PCFSoftShadowMap,
} from 'three';
// our libs
import {
    ElementToBounce,
    GameState,
    Layer,
    MovableComponentState,
} from '@benjaminbours/composite-core';
// project
import basicPostProdVS from './glsl/basic_postprod_vs.glsl';
import playerInsideFS from './glsl/playerInside_fs.glsl';
import mixPassFS from './glsl/mixPass_fs.glsl';
import volumetricLightBounceFS from './glsl/volumetricLightBounce_fs.glsl';
import volumetricLightPlayerFS from './glsl/volumetricLightPlayer_fs.glsl';
import CustomCamera from './CustomCamera';
import { Player } from './Player';

export class RendererManager {
    private lightBounceMixPasses: ShaderPass[] = [];
    private volumetricLightPasses: ShaderPass[] = [];
    private playerInsideMixPass?: ShaderPass;
    private mainComposer: EffectComposer;
    private playerInsideComposer?: EffectComposer;
    private occlusionComposers: EffectComposer[] = [];
    private playerOcclusionComposer: EffectComposer;
    private width = window.innerWidth;
    private height = window.innerHeight;
    private lightBounces: ElementToBounce[] = [];
    private renderPass: RenderPass;

    public renderer: WebGLRenderer;
    public playerVolumetricLightPass: ShaderPass;

    private createRenderTarget = (renderScale: number) => {
        return new WebGLRenderTarget(
            this.width * renderScale,
            this.height * renderScale,
        );
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

    constructor(
        private camera: CustomCamera,
        public canvasDom: HTMLCanvasElement,
        scene: Scene,
        lightBounces: ElementToBounce[],
    ) {
        // init renderer
        this.renderer = new WebGLRenderer({
            canvas: canvasDom,
            powerPreference: 'high-performance',
            precision: 'highp',
            antialias: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;

        // post processing
        const renderScale = 1;
        this.mainComposer = new EffectComposer(this.renderer);

        this.renderPass = new RenderPass(scene, this.camera);
        this.mainComposer.addPass(this.renderPass);

        // create occlusion render for player light
        const occlusionRenderTarget = this.createRenderTarget(renderScale);
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
        const mixPass = this.createMixPass(occlusionRenderTarget);
        this.mainComposer.addPass(mixPass);

        // create occlusion render for each light bounce element
        for (let i = 0; i < lightBounces.length; i++) {
            this.addLightBounceComposer(lightBounces[i]);
        }
    }

    // create a renderer for when a player is inside an element
    public addPlayerInsideComposer = () => {
        const renderScale = 1;
        const playerInsideRenderTarget = this.createRenderTarget(renderScale);
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

    public addLightBounceComposer = (bounce: ElementToBounce) => {
        const renderScale = 1;
        const occlusionRenderTarget = this.createRenderTarget(renderScale);
        const volumetricLightPass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                lightPosition: { value: new Vector2(0.5, 0.5) },
                exposure: { value: 0.18 },
                decay: { value: 0.9 },
                density: { value: 0.5 },
                weight: { value: 0.5 },
                samples: { value: 100 },
                isInteractive: { value: bounce.interactive },
                time: { value: 0 },
            },
            vertexShader: basicPostProdVS,
            fragmentShader: volumetricLightBounceFS,
        });
        volumetricLightPass.needsSwap = false;
        const occlusionComposer = this.createOcclusionComposer(
            this.renderer,
            this.renderPass,
            volumetricLightPass,
            occlusionRenderTarget,
        );
        const mixPass = this.createMixPass(occlusionRenderTarget);

        this.mainComposer.addPass(mixPass);
        this.lightBounces.push(bounce);
        this.occlusionComposers.push(occlusionComposer);
        this.volumetricLightPasses.push(volumetricLightPass);
        this.lightBounceMixPasses.push(mixPass);
    };

    public removeLightBounceComposer = (bounce: ElementToBounce) => {
        const index = this.lightBounces.indexOf(bounce);
        const mixPass = this.lightBounceMixPasses[index];
        this.mainComposer.removePass(mixPass);
        this.occlusionComposers.splice(index, 1);
        this.volumetricLightPasses.splice(index, 1);
        this.lightBounceMixPasses.splice(index, 1);
        this.lightBounces.splice(index, 1);
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
        this.camera.layers.set(Layer.OCCLUSION_PLAYER);
        this.renderer.setClearColor(0x000000);
        this.playerOcclusionComposer.render();
        // one occlusion composer by bounce
        this.camera.layers.set(Layer.OCCLUSION);
        for (let i = 0; i < this.occlusionComposers.length; i++) {
            if (i > 0) {
                const previousLightBounce = this.lightBounces[i - 1];
                previousLightBounce.layers.disable(Layer.OCCLUSION);
            }
            const lightBounce = this.lightBounces[i];
            lightBounce.layers.enable(Layer.OCCLUSION);
            this.volumetricLightPasses[
                i
            ].material.uniforms.lightPosition.value = lightBounce.get2dPosition(
                this.camera,
            );
            this.volumetricLightPasses[i].material.uniforms.time.value += delta;
            const occlusionComposer = this.occlusionComposers[i];
            occlusionComposer.render();
            if (i === this.occlusionComposers.length - 1) {
                lightBounce.layers.disable(Layer.OCCLUSION);
            }
        }

        this.renderPlayerInsideComposer(state);
        this.camera.layers.set(Layer.DEFAULT);
        this.renderer.setClearColor(0x000000);
        this.mainComposer.render();
    };

    public resize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
}
