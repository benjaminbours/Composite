// vendors
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
    WebGLRenderer,
    Scene,
    Camera,
    Vector2,
    WebGLRenderTarget,
} from 'three';
// project
import basicPostProdVS from './glsl/basic_postprod_vs.glsl';
import playerInsideFS from './glsl/playerInside_fs.glsl';
import mixPassFS from './glsl/mixPass_fs.glsl';
import volumetricLightBounceFS from './glsl/volumetricLightBounce_fs.glsl';
import volumetricLightPlayerFS from './glsl/volumetricLightPlayer_fs.glsl';
import { ElementToBounce } from '@benjaminbours/composite-core';

export class PostProcessingManager {
    public volumetricLightPasses: ShaderPass[] = [];
    public playerVolumetricLightPass!: ShaderPass;
    public mainComposer!: EffectComposer;
    public playerInsideComposer!: EffectComposer;
    public occlusionComposers: EffectComposer[] = [];
    public playerOcclusionComposer!: EffectComposer;

    constructor(
        renderer: WebGLRenderer,
        scene: Scene,
        camera: Camera,
        lightBounces: ElementToBounce[],
    ) {
        const renderScale = 1;
        this.mainComposer = new EffectComposer(renderer);

        const renderPass = new RenderPass(scene, camera);
        this.mainComposer.addPass(renderPass);

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
            renderer,
            renderPass,
            this.playerVolumetricLightPass,
            occlusionRenderTarget,
        );
        const mixPass = this.createMixPass(occlusionRenderTarget);

        this.mainComposer.addPass(mixPass);

        // create occlusion render for each light bounce element
        for (let i = 0; i < lightBounces.length; i++) {
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
                    isInteractive: { value: lightBounces[i].interactive },
                    time: { value: 0 },
                },
                vertexShader: basicPostProdVS,
                fragmentShader: volumetricLightBounceFS,
            });
            volumetricLightPass.needsSwap = false;
            const occlusionComposer = this.createOcclusionComposer(
                renderer,
                renderPass,
                volumetricLightPass,
                occlusionRenderTarget,
            );
            const mixPass = this.createMixPass(occlusionRenderTarget);

            this.mainComposer.addPass(mixPass);
            this.occlusionComposers.push(occlusionComposer);
            this.volumetricLightPasses.push(volumetricLightPass);
        }

        // create a renderer for when a player is inside an element
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
            renderer,
            playerInsideRenderTarget,
        );
        this.playerInsideComposer.renderToScreen = false;
        this.playerInsideComposer.addPass(renderPass);
        this.playerInsideComposer.addPass(playerInsidePass);
        const playerInsideMixPass = this.createMixPass(
            playerInsideRenderTarget,
        );
        this.mainComposer.addPass(playerInsideMixPass);
    }

    private width = window.innerWidth;
    private height = window.innerHeight;
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
}
