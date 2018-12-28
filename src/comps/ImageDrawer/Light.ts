import { Power3, TimelineMax, TweenMax } from "gsap";
<<<<<<< HEAD
=======
import ButtonPlay from "../ButtonPlay";
>>>>>>> 0a709f8bd1953d86b7acd641f94d26a1d13e723a
import ImageDrawer from "./index";
import lightPath from "./light.png";
import lightHaloPath from "./light_halo.png";

const light = new Image();
light.src = lightPath;
const lightHalo = new Image();
lightHalo.src = lightHaloPath;

<<<<<<< HEAD
export interface IPulseOptions {
    startScale: number;
    scale: number;
    maxScale: number;
    pulsingTime: number;
    opacity: number;
    delay: number;
}

export default class Light extends ImageDrawer {
    public static pulseFast() {
        Light.isPulsingFast = true;
    }

    public static pulseSlow() {
        Light.isPulsingFast = false;
    }

    private static isPulsingFast: boolean = false;

    private static pulsesOptions: IPulseOptions[] = [
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

    private static pulsesFastAnimation: TimelineMax[] = [];

    private static createAnimation(pulseOptions: IPulseOptions) {
        const animation = new TimelineMax({
            delay: pulseOptions.delay,
            // paused: true,
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

        Light.pulsesFastAnimation.push(animation);
    }

    private width: number = 450;
    private img: HTMLImageElement;

=======
export default class Light extends ImageDrawer {
    public static setScale(value: number) {
        TweenMax.to(Light, 1, {
            scale: value,
            ease: Power3.easeOut,
        });
    }

    private static pulseAnimation: TimelineMax;

    private static scale: number = 0.6;
    private width: number = 450;
    private img: HTMLImageElement;

    private haloOpacity: number = 0;

    private isPulsing: boolean = false;

>>>>>>> 0a709f8bd1953d86b7acd641f94d26a1d13e723a
    constructor(ctx: CanvasRenderingContext2D) {
        super(ctx);
        this.img = light;

<<<<<<< HEAD
        // Light.pulseAnimation = new TimelineMax({
        //     onComplete(this: TimelineMax) {
        //         this.invalidate().restart();
        //         console.log(Light.maxScale);
        //         // if (Light.isPulsingFast) {

        //         // }
        //         console.log(Light.pulsingTime);
        //     },
        // });

        // Light.pulseAnimation.to(Light, Light.pulsingTime / 2, {
        //     haloOpacity: 1,
        // });

        // Light.pulseAnimation.fromTo(Light, Light.pulsingTime / 2, {
        //     scale: 0.6,
        // }, {
        //         haloOpacity: 0,
        //         scale: Light.maxScale,
        //     });
        Light.pulsesOptions.forEach((pulse) => {
            Light.createAnimation(pulse);
        });

        // Light.isPulsingFast = true;
=======
        setTimeout(() => {
            Light.setScale(1.0);
        }, 2000);

        Light.pulseAnimation = new TimelineMax({
            onComplete(this: TimelineMax) {
                this.restart();
            },
        });

        Light.pulseAnimation.to(this, 1.5, {
            haloOpacity: 1,
        });

        Light.pulseAnimation.to(this, 1.5, {
            haloOpacity: 0,
            scale: 1.5,
        });
        this.isPulsing = true;
>>>>>>> 0a709f8bd1953d86b7acd641f94d26a1d13e723a
    }

    public render = () => {
        this.ctx.save();
        this.ctx.translate(this.startX, this.startY);
        this.ctx.drawImage(this.img, -this.width / 2, -this.width / 2, this.width, this.width);
        this.renderLightHalo();
        this.ctx.restore();
<<<<<<< HEAD
    }

    private renderLightHalo = () => {
        for (let i = 0; i < Light.pulsesOptions.length; i++) {
            const pulse = Light.pulsesOptions[i];
            this.ctx.save();
            this.ctx.scale(pulse.scale, pulse.scale);
            this.ctx.globalAlpha = pulse.opacity;
            this.ctx.drawImage(lightHalo, -this.width / 2, -this.width / 2, this.width, this.width);
            this.ctx.restore();
            if (!Light.isPulsingFast && i === 0) {
                break;
            }
        }
=======

        if (ButtonPlay.isMouseHover && this.isPulsing) {
            Light.pulseAnimation.kill();
            this.isPulsing = false;
        }
    }

    private renderLightHalo = () => {
        this.ctx.scale(Light.scale, Light.scale);
        this.ctx.globalAlpha = this.haloOpacity;
        this.ctx.drawImage(lightHalo, -this.width / 2, -this.width / 2, this.width, this.width);
>>>>>>> 0a709f8bd1953d86b7acd641f94d26a1d13e723a
    }
}
