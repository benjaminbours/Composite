import { Power3, TimelineMax } from "gsap";
import ImageDrawer from "./index";
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

export default class Light extends ImageDrawer {
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

    constructor(ctx: CanvasRenderingContext2D) {
        super(ctx);
        this.img = light;
        this.pulsesOptions.forEach((pulse) => {
            this.createAnimation(pulse);
        });
    }

    public render = () => {
        this.ctx.save();
        this.ctx.translate(this.startX, this.startY);
        this.ctx.drawImage(this.img, -this.width / 2, -this.width / 2, this.width, this.width);
        this.renderLightHalo();
        this.ctx.restore();
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
