import React, { Component } from "react";
import ReactDOM from "react-dom";
import Animation from "./Animation";
import Canvases from "./comps/Canvases";
import Interfaces from "./comps/Interfaces";
import { Context } from "./context";
import "./styles/main.scss";

const backOptions = {
    level() {
        Animation.playLevelToHome();
    },
};
export default class App extends Component {
    public state;
    public onTransition: boolean = false;

    constructor(props) {
        super(props);
        this.state = {
            currentScene: "home",
            handleMouseEnterPlay: this.handleMouseEnterPlay,
            handleMouseLeavePlay: this.handleMouseLeavePlay,
            handleClickOnPlay: this.handleClickOnPlay,
            handleClickOnBack: this.handleClickOnBack,
        };
    }

    public componentDidMount() {
        Animation.initHomeToLevel(() => {
            this.onTransition = false;
            this.setState({
                currentScene: "level",
            });
        });
        Animation.initLevelToHome(() => {
            this.onTransition = false;
            this.setState({
                currentScene: "home",
            });
        });
    }

    public handleMouseEnterPlay = () => {
        Animation.playMouseEnterButtonPlay();
    }

    public handleMouseLeavePlay = () => {
        if (!this.onTransition) {
            Animation.playMouseLeaveButtonPlay();
        }
    }

    public handleClickOnPlay = () => {
        this.onTransition = true;
        Animation.playHomeToLevel();
    }

    public handleClickOnBack = () => {
        const { currentScene } = this.state;
        this.onTransition = true;
        backOptions[currentScene]();
    }

    public render() {
        return (
            <Context.Provider value={this.state}>
                <Canvases />
                <Interfaces />
            </Context.Provider>
        );
    }
}

ReactDOM.render(
    <App />,
    document.querySelector("#root"),
);
