import { Power3, TimelineMax, TweenMax } from "gsap";
import ButtonPlay from "../ButtonPlay";
import ImageDrawer from "./index";
import lightPath from "./light.png";
import lightHaloPath from "./light_halo.png";

const light = new Image();
light.src = lightPath;
const lightHalo = new Image();
lightHalo.src = lightHaloPath;

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

    constructor(ctx: CanvasRenderingContext2D) {
        super(ctx);
        this.img = light;

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
    }

    public render = () => {
        this.ctx.save();
        this.ctx.translate(this.startX, this.startY);
        this.ctx.drawImage(this.img, -this.width / 2, -this.width / 2, this.width, this.width);
        this.renderLightHalo();
        this.ctx.restore();

        if (ButtonPlay.isMouseHover && this.isPulsing) {
            Light.pulseAnimation.kill();
            this.isPulsing = false;
        }
    }

    private renderLightHalo = () => {
        this.ctx.scale(Light.scale, Light.scale);
        this.ctx.globalAlpha = this.haloOpacity;
        this.ctx.drawImage(lightHalo, -this.width / 2, -this.width / 2, this.width, this.width);
    }
}
