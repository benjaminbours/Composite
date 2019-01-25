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
        if (window.innerHeight < 600) {
            this.iy = 0.6;
        } else {
            this.iy = coordinate.y;
        }
        super.resize(ctx);
    }
}
