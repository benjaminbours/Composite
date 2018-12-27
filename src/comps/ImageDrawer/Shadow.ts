import { Power3, TweenMax } from "gsap";
import ImageDrawer from "./index";
import shadowPath from "./shadow.png";

const shadow = new Image();
shadow.src = shadowPath;

export default class Shadow extends ImageDrawer {
    public static setRotationSpeed(value: number) {
        TweenMax.to(Shadow, 1, {
            rotationSpeed: value,
            ease: Power3.easeOut,
        });
        // this.rotationSpeed = value;
    }

    private static rotationSpeed: number = 0.005;

    private rotation: number = 0;
    private width: number = 600;

    private img: HTMLImageElement;

    constructor(ctx: CanvasRenderingContext2D) {
        super(ctx);
        this.img = shadow;
    }

    public render = () => {
        this.ctx.save();
        this.ctx.translate(this.startX, this.startY);
        this.ctx.rotate(this.rotation);
        this.rotation -= Shadow.rotationSpeed;
        this.ctx.drawImage(this.img, -this.width / 2, -this.width / 2, this.width, this.width);
        this.ctx.restore();
    }

}
