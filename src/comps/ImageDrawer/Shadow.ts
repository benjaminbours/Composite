import { Power3, TweenMax } from "gsap";
import ImageDrawer from "./index";
import shadowPath from "./shadow.png";

const shadow = new Image();
shadow.src = shadowPath;

export default class Shadow extends ImageDrawer {
    private rotation: number = 0;
    private width: number = 600;

    private img: HTMLImageElement;
    private rotationSpeed: number = 0.005;

    constructor(ctx: CanvasRenderingContext2D) {
        super(ctx);
        this.img = shadow;
    }

    public setRotationSpeed(value: number) {
        TweenMax.to(this, 1, {
            rotationSpeed: value,
            ease: Power3.easeOut,
        });
    }

    public render = () => {
        this.ctx.save();
        this.ctx.translate(this.startX, this.startY);
        this.ctx.rotate(this.rotation);
        this.rotation -= this.rotationSpeed;
        this.ctx.drawImage(this.img, -this.width / 2, -this.width / 2, this.width, this.width);
        this.ctx.restore();
    }

}
