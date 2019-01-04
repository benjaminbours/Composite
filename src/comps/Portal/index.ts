import { ICoordinate } from "../../types";
import crackTheDoorPath from "./crack_the_door.png";

const crackTheDoor = new Image();
crackTheDoor.src = crackTheDoorPath;

export default class Portal {
    public isMount: boolean;
    public onTransition: boolean = false;

    public isMouseHover: boolean = false;
    public isMouseEnter: boolean = false;
    public isMouseExit: boolean = false;

    public ix: number = 0;
    public iy: number = 0;

    // public x: number = 0;
    // public y: number = 0;

    public path = new Path2D();
    public ray: number = 200;

    private readonly ctx: CanvasRenderingContext2D;

    private width: number = 500;
    private height: number = 200;
    private opacity: number = 1;

    constructor(ctx: CanvasRenderingContext2D, isMount: boolean, initialCoordinate: ICoordinate) {
        this.ctx = ctx;
        this.ix = initialCoordinate.x;
        this.iy = initialCoordinate.y;
        this.isMount = isMount;
        this.resize();
    }

    public render = () => {
        this.ctx.save();
        this.ctx.fillStyle = "#FFF";
        this.ctx.beginPath();
        this.ctx.globalAlpha = this.opacity;
        this.ctx.rect(this.ix - this.width / 2, this.iy - this.height / 2, this.width, this.height);
        // this.path.rect(this.ix - this.width / 2, this.iy - this.height / 2, this.width, this.height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.clip();

        // this.ctx.translate(this.ix, this.iy);
        this.ctx.drawImage(crackTheDoor, this.ix - 1344 / 2, this.iy - 720 / 1.5, 1344, 720);
        this.ctx.restore();
    }

    private resize = () => {
        this.width = this.ctx.canvas.width / 100 * 80;
    }

}
