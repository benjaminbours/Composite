import { TimelineLite, TweenLite } from "gsap";
import React, { Component, RefObject } from "react";
import ReactDOM from "react-dom";
import Canvases from "./comps/Canvases";
import { defaultWave, wave } from "./comps/Canvases/comps/Curve/index";
import CanvasBlack from "./comps/Canvases/layers/CanvasBlack";
import CanvasWhite from "./comps/Canvases/layers/CanvasWhite";
import Interfaces from "./comps/Interfaces";
import { Context } from "./context";
import "./styles/main.scss";

export default class App extends Component {
    public state;

    public buttonPlay: RefObject<HTMLButtonElement>;
    private homeToLevelAnimation: TimelineLite;

    constructor(props) {
        super(props);
        this.buttonPlay = React.createRef();
        this.state = {
            currentScene: "home",
            isMouseHoverPlay: false,
            handleMouseEnterPlay: this.handleMouseEnterPlay,
            handleMouseLeavePlay: this.handleMouseLeavePlay,
            handleClickOnPlay: this.handleClickOnPlay,
        };
        this.homeToLevelAnimation = new TimelineLite({
            paused: true,
        });
    }

    public componentDidMount() {
        const canvasBlack = Canvases.layers.black as CanvasBlack;
        const canvasWhite = Canvases.layers.white as CanvasWhite;
        const { curve, light } = canvasBlack;
        const { shadow } = canvasWhite;

        const canvas = Canvases.layers.white.ctx.canvas;
        const mainTitleWhite = canvasBlack.scenes.home.mainTitle;
        const titleHomeWhite = canvasBlack.scenes.home.title;

        const mainTitleBlack = canvasWhite.scenes.home.mainTitle;
        const titleHomeBlack = canvasWhite.scenes.home.title;

        // const buttonPlay = this.buttonPlay.current as HTMLButtonElement;

        this.homeToLevelAnimation
            .fromTo(curve, 0.5, {
                origin: canvas.width * 0.5,
            }, {
                    origin: canvas.width * 0.85,
                    overwrite: "all",
                    onStart: () => {
                        wave.viscosity = 40;
                        wave.damping = 0.2;
                    },
                    onComplete: () => {
                        TweenLite.set(wave, {
                            ...defaultWave,
                        });
                    },
                })
            .fromTo([light, shadow], 0.5, {
                startX: canvas.width * 0.5,
                startY: canvas.height * 0.75,
            }, {
                    startX: canvas.width * 0.85,
                    startY: canvas.height * 0.5,
                }, "-= 0.5")
            .fromTo([mainTitleBlack, mainTitleWhite, titleHomeWhite, titleHomeBlack], 0.5, {
                opacity: 1,
            }, {
                    opacity: 0,
                    onComplete: () => {
                        mainTitleBlack.onTransition = false;
                        mainTitleBlack.isMount = false;
                        mainTitleWhite.onTransition = false;
                        mainTitleWhite.isMount = false;

                        titleHomeWhite.onTransition = false;
                        titleHomeBlack.onTransition = false;
                        titleHomeWhite.isMount = false;
                        titleHomeBlack.isMount = false;
                    },
                }, "-= 0.5");
            // .fromTo(buttonPlay, 0.5, {
            //     opacity: 1,
            // }, {
            //         opacity: 0,
            //         onComplete: () => {
            //             this.setState({
            //                 currentScene: "level",
            //             });
            //         },
            //     }, "-= 0.5");
    }

    public handleMouseEnterPlay = () => {
        this.setState({
            isMouseHoverPlay: true,
        });
    }

    public handleMouseLeavePlay = () => {
        this.setState({
            isMouseHoverPlay: false,
        });
    }

    public handleClickOnPlay = () => {
        this.homeToLevelAnimation.play();
    }

    public render() {
        const { isMouseHoverPlay, currentScene } = this.state;
        return (
            <Context.Provider value={this.state}>
                <Canvases
                    isMouseHoverPlay={isMouseHoverPlay}
                />
                <Interfaces
                    currentScene={currentScene}
                    refPlay={this.buttonPlay}
                />
            </Context.Provider>
        );
    }
}

ReactDOM.render(
    <App />,
    document.querySelector("#root"),
);
