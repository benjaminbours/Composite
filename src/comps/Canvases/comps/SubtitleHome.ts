import { Side } from "../types";
import TextDrawer from "./TextDrawer";

const coordinate = {
    x: 0.5,
    y: 0.5,
};

export default class SubtitleHome extends TextDrawer {
    constructor(ctx: CanvasRenderingContext2D, side: Side, content: string, isMount: boolean) {
        super(ctx, side, content, isMount, coordinate);
    }

    public resize = () => {
        if (window.innerHeight < 600) {
            this.iy = 0.6;
        } else {
            this.iy = coordinate.y;
        }
        this.x = (this.ctx.canvas.width * this.ix) - this.width / 2;
        this.y = (this.ctx.canvas.height * this.iy) - 100 / 2;
    }
}
