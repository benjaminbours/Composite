import TextDrawer from './TextDrawer';

const coordinate = {
    x: 0.5,
    y: 0.15,
};

export default class TitleFaction extends TextDrawer {
    constructor(content: string, isMount: boolean) {
        super(content, isMount, coordinate);
    }

    public resize = (ctx: CanvasRenderingContext2D) => {
        super.resize(ctx);
        this.iy = coordinate.y;

        if (window.innerWidth <= 768) {
            this.iy = 0.5;
        }
    };
}
