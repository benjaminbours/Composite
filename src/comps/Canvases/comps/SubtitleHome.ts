import { Side } from "../types";
import TextDrawer from "./TextDrawer";

const coordinate = {
    x: 0.5,
    y: 0.5,
};

export default class SubtitleHome extends TextDrawer {
    constructor(content: string, isMount: boolean) {
        super(content, isMount, coordinate);
    }

    public render = (ctx: CanvasRenderingContext2D, color: Side): boolean => {
        if (ctx.canvas.width <= 768 && color === "black") {
            return false;
        }
        super.render(ctx, color);
        return true;
    }

    public resize = (ctx: CanvasRenderingContext2D) => {
        this.iy = coordinate.y;

        if (window.innerHeight < 800) {
            this.iy = 0.4;
        }

        if (window.innerHeight < 700) {
        // if (window.innerHeight < 600 || (window.innerWidth <= 1024 || window.innerHeight < 700)) {
            this.iy = 0.45;
        }
    }
}
