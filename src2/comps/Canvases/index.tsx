import { Power3, TimelineLite, TweenLite } from "gsap";
import React, { Component, RefObject } from "react";
import * as STATS from "stats.js";
import { defaultWave, wave } from "./comps/Curve/index";
import CanvasBlack from "./layers/CanvasBlack";
import CanvasWhite from "./layers/CanvasWhite";
import Mouse from "./Mouse";

const stats = new STATS.default();
stats.showPanel(1);
document.body.appendChild(stats.dom);

interface IProps {
    isMouseHoverPlay: boolean;
}

interface ILayers {
    [key: string]: CanvasBlack | CanvasWhite;
}

export default class Canvases extends Component<IProps> {
    public static layers: ILayers = {};

    public blackCanvas: RefObject<HTMLCanvasElement>;
    public whiteCanvas: RefObject<HTMLCanvasElement>;

    private mouseEnterAnimation: TimelineLite;

    constructor(props) {
        super(props);
        this.blackCanvas = React.createRef();
        this.whiteCanvas = React.createRef();
        this.mouseEnterAnimation = new TimelineLite({ paused: true });
    }

    public componentDidMount() {
        Canvases.layers = {
            black: new CanvasBlack(this.blackCanvas.current as HTMLCanvasElement),
            white: new CanvasWhite(this.whiteCanvas.current as HTMLCanvasElement),
        };
        Mouse.init();
        TweenLite.ticker.addEventListener("tick", this.canvasLoop);

        const shadow = (Canvases.layers.white as CanvasWhite).shadow;
        this.mouseEnterAnimation
            .fromTo(wave, 0.1, {
                ...defaultWave,
            }, {
                    ...defaultWave,
                    randomRange: 300,
                    amplitudeRange: 50,
                    speed: 0.1,
                    overwrite: "all",
                })
            .fromTo(shadow, 1, {
                rotationSpeed: 0.005,
            }, {
                    rotationSpeed: 0.02,
                    ease: Power3.easeOut,
                }, "-= 0.1");
    }

    public componentDidUpdate(prevProps: IProps, prevStates) {
        const { curve, light } = Canvases.layers.black as CanvasBlack;
        if (this.props.isMouseHoverPlay) {
            curve.mouseIsHoverButton = true;
            light.isPulsingFast = true;
            this.mouseEnterAnimation.play();
        } else {
            curve.mouseIsHoverButton = false;
            light.isPulsingFast = false;
            this.mouseEnterAnimation.reverse();
        }
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
}
