import { TweenMax } from "gsap";
import React from "react";
import ReactDOM from "react-dom";
import * as STATS from "stats.js";
import Menu from "./layers/Menu";
import OnTop from "./layers/OnTop";
import UnderMenu from "./layers/UnderMenu";
import Mouse from "./Mouse";
import ButtonPlay from "./reactComps/ButtonPlay";

const stats = new STATS.default();
stats.showPanel(1);
document.body.appendChild(stats.dom);

export default class App {
    public static layers = {
        menu: new Menu(),
        underMenu: new UnderMenu(),
    };

    public static currentScene = "home";
    public static lastScene = "home";

    constructor() {
        TweenMax.ticker.addEventListener("tick", this.render);
        Mouse.init();
        ReactDOM.render(
            <ButtonPlay />,
            document.querySelector("#onTop"),
        );
    }

    private render = () => {
        stats.begin();
        for (const layer in App.layers) {
            if (App.layers[layer].hasOwnProperty("render")) {
                App.layers[layer].render();
            }
        }
        stats.end();
    }
}

const app = new App();
