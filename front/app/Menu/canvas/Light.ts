// vendors
import { gsap } from 'gsap';
// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { MenuScene, ResizeOptions } from '../../types';

const light = new Image();
light.src = `/images/light.png`;
const lightHalo = new Image();
lightHalo.src = '/images/light_halo.png';

export interface IPulseOptions {
    startScale: number;
    scale: number;
    maxScale: number;
    pulsingTime: number;
    opacity: number;
    delay: number;
}

const DEFAULT_WIDTH = 450;

export default class Light {
    public startY: number = 30;
    public startX: number = 0;

    public isPulsingFast: boolean = false;
    public pulsesOptions: IPulseOptions[] = [
        {
            startScale: 0.6,
            scale: 0.6,
            maxScale: 1.3,
            pulsingTime: 3,
            opacity: 0,
            delay: 0,
        },
        {
            startScale: 0.6,
            scale: 0.6,
            maxScale: 1.3,
            pulsingTime: 3,
            opacity: 0,
            delay: 0.75,
        },
        {
            startScale: 0.6,
            scale: 0.6,
            maxScale: 1.3,
            pulsingTime: 3,
            opacity: 0,
            delay: 1.5,
        },
        {
            startScale: 0.6,
            scale: 0.6,
            maxScale: 1.3,
            pulsingTime: 3,
            opacity: 0,
            delay: 2.25,
        },
    ];

    public getParamsForScene = ({
        scene,
        canvasHeight,
        canvasWidth,
        isMobile,
    }: {
        scene: MenuScene;
        canvasWidth: number;
        canvasHeight: number;
        isMobile: boolean;
    }) => {
        let width = DEFAULT_WIDTH;
        if (window.innerHeight < 700 || window.innerWidth <= 768) {
            width = 400;
        }
        if (window.innerWidth > 2000) {
            width = 600;
        }
        switch (scene) {
            case MenuScene.NOT_FOUND:
                return {
                    coordinates: {
                        x: canvasWidth * 0.5,
                        y: canvasHeight * (isMobile ? 0.85 : 0.5),
                    },
                    width,
                };
            case MenuScene.HOME:
                return {
                    coordinates: {
                        x: canvasWidth * 0.5,
                        y: canvasHeight * 0.75,
                    },
                    width,
                };
            case MenuScene.TEAM_LOBBY:
                let x = -0.1;
                return {
                    coordinates: {
                        x: canvasWidth * x,
                        y: canvasHeight * 0.75,
                    },
                    width,
                };
            case MenuScene.TEAM_LOBBY_SELECTED:
                let xPos = 0.5;
                return {
                    coordinates: {
                        x: canvasWidth * xPos,
                        y: canvasHeight * 0.75,
                    },
                    width,
                };
            case MenuScene.END_LEVEL:
                let y = 0.5;
                return {
                    coordinates: {
                        x: canvasWidth * 0,
                        y: canvasHeight * y,
                    },
                    width: 325,
                };
        }
    };

    private width: number = 450;
    private img: HTMLImageElement;

    private readonly ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.startX = this.ctx.canvas.width * 0.5;
        this.startY = this.ctx.canvas.height * 0.75;
        this.img = light;
        this.pulsesOptions.forEach((pulse) => {
            this.createAnimation(pulse);
        });
    }

    public render = () => {
        this.ctx.save();
        this.ctx.translate(this.startX, this.startY);
        this.ctx.drawImage(
            this.img,
            -this.width / 2,
            -this.width / 2,
            this.width,
            this.width,
        );
        this.renderLightHalo();
        this.ctx.restore();
    };

    public resize = (options: ResizeOptions) => {
        const { coordinates, width } = this.getParamsForScene({
            scene: options.currentScene,
            canvasWidth: this.ctx.canvas.width,
            canvasHeight: this.ctx.canvas.height,
            isMobile: options.isMobileDevice,
        });
        this.startX = coordinates.x;
        this.startY = coordinates.y;
        this.width = width;
    };

    private renderLightHalo = () => {
        for (let i = 0; i < this.pulsesOptions.length; i++) {
            const pulse = this.pulsesOptions[i];
            this.ctx.save();
            this.ctx.scale(pulse.scale, pulse.scale);
            this.ctx.globalAlpha = pulse.opacity;
            this.ctx.drawImage(
                lightHalo,
                -this.width / 2,
                -this.width / 2,
                this.width,
                this.width,
            );
            this.ctx.restore();
            // this condition make only one pulsation rendered if the pulsing fast mode is disabled
            if (!this.isPulsingFast && i === 0) {
                // TODO: desactivate the render smoothly
                break;
            }
        }
    };

    private createAnimation(pulseOptions: IPulseOptions) {
        const animation = gsap.timeline({
            delay: pulseOptions.delay,
            onComplete(this: GSAPTimeline) {
                this.restart();
            },
        });
        animation.to(pulseOptions, {
            duration: pulseOptions.pulsingTime / 2,
            opacity: 1,
            ease: 'power3.easeOut',
        });

        animation.fromTo(
            pulseOptions,
            {
                scale: pulseOptions.startScale,
                ease: 'power3.easeOut',
            },
            {
                duration: pulseOptions.pulsingTime / 2,
                opacity: 0,
                scale: pulseOptions.maxScale,
            },
        );
    }
}
