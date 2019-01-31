import { TweenLite } from "gsap";
import * as STATS from "stats.js";
import React, { Component, RefObject } from "react";
import App from "./App";

export default class Game extends Component {
    private stats = new STATS.default();
    private canvas: RefObject<HTMLCanvasElement> = React.createRef();
    private app: App | undefined;

    constructor(props: {}) {
        super(props);

        this.stats.showPanel(1);
        document.body.appendChild(this.stats.dom);
        TweenLite.ticker.addEventListener("tick", this.gameLoop);
    }

    public componentDidMount() {
        if (this.canvas.current) {
            this.app = new App(this.canvas.current);
            this.gameLoop();
        }
    }

    public render() {
        return (
            <canvas ref={this.canvas} id="game" style={{ zIndex: -4 }}></canvas>
        );
    }

    private gameLoop = () => {
        this.stats.begin();
        if (this.app) {
            this.app.render();
        }
        this.stats.end();
    }
}
