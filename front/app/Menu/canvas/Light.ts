import { gsap } from 'gsap';
import { ResizeOptions } from '../types';
import type { Side } from '../../types';

const light = new Image();
light.src = '/light.png';
const lightHalo = new Image();
lightHalo.src = '/light_halo.png';

export interface IPulseOptions {
    startScale: number;
    scale: number;
    maxScale: number;
    pulsingTime: number;
    opacity: number;
    delay: number;
}

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

    public resizeOptions = {
        home(width: number, height: number) {
            return {
                x: width * 0.5,
                y: height * 0.75,
            };
        },
        level(width: number, height: number) {
            return {
                x: width * 0.85,
                y: height * 0.5,
            };
        },
        faction(width: number, height: number, isOnMobile: boolean) {
            if (isOnMobile) {
                return {
                    x: width * 0.5,
                    y: height * 0.25,
                };
            }
            return {
                x: width * 0.25,
                y: height * 0.5,
            };
        },
        queue(
            width: number,
            height: number,
            isOnMobile: boolean,
            faction: Side,
        ) {
            const positionX = faction === 'white' ? 0.5 : -0.5;
            const positionY = 0.5;
            return {
                x: width * positionX,
                y: height * positionY,
            };
        },
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
        const coordinate = this.resizeOptions[options.currentScene](
            this.ctx.canvas.width,
            this.ctx.canvas.height,
            options.isMobileDevice,
            options.side,
        );
        this.startX = coordinate.x;
        this.startY = coordinate.y;
        this.width = 450;
        if (window.innerHeight < 700 || window.innerWidth <= 768) {
            this.width = 400;
        }
        if (window.innerWidth > 2000) {
            this.width = 600;
        }
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
