import { TweenLite } from "gsap";
import React, { Component, RefObject } from "react";
import * as STATS from "stats.js";
import { runMethodForAllBothComponents } from "./bothComponents";
import CanvasBlack from "./layers/CanvasBlack";
import CanvasWhite from "./layers/CanvasWhite";
import Mouse from "./Mouse";

const stats = new STATS.default();
stats.showPanel(1);
document.body.appendChild(stats.dom);

interface ILayers {
    black: CanvasBlack;
    white: CanvasWhite;
}

export default class Canvases extends Component {
    public static layers: ILayers;

    public blackCanvas: RefObject<HTMLCanvasElement>;
    public whiteCanvas: RefObject<HTMLCanvasElement>;

    constructor(props: {}) {
        super(props);
        this.blackCanvas = React.createRef();
        this.whiteCanvas = React.createRef();
    }

    public componentDidMount() {
        Canvases.layers = {
            black: new CanvasBlack(this.blackCanvas.current as HTMLCanvasElement),
            white: new CanvasWhite(this.whiteCanvas.current as HTMLCanvasElement),
        };
        runMethodForAllBothComponents("resize", [
            Canvases.layers.black.ctx,
        ]);
        Mouse.init();
        TweenLite.ticker.addEventListener("tick", this.canvasLoop);
        window.addEventListener("resize", this.resize);
    }

    public render() {
        return (
            <>
                <canvas id="white" style={{ zIndex: -3 }} ref={this.whiteCanvas}></canvas>
                <canvas id="black" style={{ zIndex: -2 }} ref={this.blackCanvas}></canvas>
            </>
        );
    }

    private canvasLoop = () => {
        stats.begin();
        for (const layer in Canvases.layers) {
            if (Canvases.layers[layer].hasOwnProperty("render")) {
                Canvases.layers[layer].render();
            }
        }
        stats.end();
    }

    private resize = () => {
        for (const layer in Canvases.layers) {
            if (Canvases.layers[layer].hasOwnProperty("resize")) {
                Canvases.layers[layer].resize();
            }
        }
        runMethodForAllBothComponents("resize", [
            Canvases.layers.black.ctx, // no matter which canvas is used here, they have the same size
        ]);
    }
}
