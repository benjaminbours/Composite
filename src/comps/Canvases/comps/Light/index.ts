import { Power3, TimelineMax } from "gsap";
import { app } from "../../../../App";
import lightPath from "./light.png";
import lightHaloPath from "./light_halo.png";

const light = new Image();
light.src = lightPath;
const lightHalo = new Image();
lightHalo.src = lightHaloPath;

export interface IPulseOptions {
    startScale: number;
    scale: number;
    maxScale: number;
    pulsingTime: number;
    opacity: number;
    delay: number;
}

const resizeOptions = {
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
    faction(width: number, height: number) {
        return {
            x: width * 0.25,
            y: height * 0.5,
        };
    },
};

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
    private width: number = 450;
    private img: HTMLImageElement;

    private pulsesFastAnimation: TimelineMax[] = [];

    private readonly ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.startX = this.ctx.canvas.width * 0.5;
        this.startY = this.ctx.canvas.height * 0.75;
        this.img = light;
        this.pulsesOptions.forEach((pulse) => {
            this.createAnimation(pulse);
        });
        window.addEventListener("resize", this.resize);
    }

    public render = () => {
        this.ctx.save();
        this.ctx.translate(this.startX, this.startY);
        this.ctx.drawImage(this.img, -this.width / 2, -this.width / 2, this.width, this.width);
        this.renderLightHalo();
        this.ctx.restore();
    }

    private resize = () => {
        if (app) {
            const coordinate = resizeOptions[app.state.currentScene](this.ctx.canvas.width, this.ctx.canvas.height);
            this.startX = coordinate.x;
            this.startY = coordinate.y;
        }
    }

    private renderLightHalo = () => {
        for (let i = 0; i < this.pulsesOptions.length; i++) {
            const pulse = this.pulsesOptions[i];
            this.ctx.save();
            this.ctx.scale(pulse.scale, pulse.scale);
            this.ctx.globalAlpha = pulse.opacity;
            this.ctx.drawImage(lightHalo, -this.width / 2, -this.width / 2, this.width, this.width);
            this.ctx.restore();
            if (!this.isPulsingFast && i === 0) {
                // TODO: desactivate the render smoothly
                break;
            }
        }
    }

    private createAnimation(pulseOptions: IPulseOptions) {
        const animation = new TimelineMax({
            delay: pulseOptions.delay,
            onComplete(this: TimelineMax) {
                this.restart();
            },
        });
        animation.to(pulseOptions, pulseOptions.pulsingTime / 2, {
            opacity: 1,
            ease: Power3.easeOut,
        });

        animation.fromTo(pulseOptions, pulseOptions.pulsingTime / 2, {
            scale: pulseOptions.startScale,
            ease: Power3.easeOut,
        }, {
                opacity: 0,
                scale: pulseOptions.maxScale,
            });

        this.pulsesFastAnimation.push(animation);
    }

}
