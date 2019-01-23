import React, { Component } from "react";
import Animation from "./Animation";
import Canvases from "./comps/Canvases";
import Interfaces from "./comps/Interfaces";
import { Context, IState } from "./context";
import "./styles/main.scss";

const backOptions = {
    level() {
        Animation.playLevelToHome();
    },
    faction() {
        Animation.playFactionToLevel();
    },
};

export let app: App | null = null;
export default class App extends Component {
    public state: IState;
    public onTransition: boolean = false;

    constructor(props) {
        super(props);
        this.state = {
            currentScene: "home",
            faction: "shadow",
            handleMouseEnterPlay: this.handleMouseEnterPlay,
            handleMouseLeavePlay: this.handleMouseLeavePlay,
            handleClickOnPlay: this.handleClickOnPlay,
            handleClickOnBack: this.handleClickOnBack,
            handleClickOnLevel: this.handleClickOnLevel,
            handleClickOnFaction: this.handleClickOnFaction,
        };
        app = this;
    }

    public componentDidMount() {
        console.log("App did mount");
        Animation.initComponents();
        Animation.initMouseEnterButtonPlay();
        Animation.initMouseLeaveButtonPlay();
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
        Animation.initLevelToFaction(() => {
            this.onTransition = false;
            this.setState({
                currentScene: "faction",
            });
        });
        Animation.initFactionToLevel(() => {
            this.onTransition = false;
            this.setState({
                currentScene: "level",
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

    public handleClickOnLevel = (name: string) => {
        // console.log(name);
        this.onTransition = true;
        Animation.playLevelToFaction();
    }

    public handleClickOnFaction = (side: string) => {
        Animation.initFactionToQueue(() => {
            this.onTransition = false;
            this.setState({
                currentScene: "queue",
            });
        }, side);
        this.onTransition = true;
        Animation.playFactionToQueue();
        this.setState({
            faction: side,
        });
    }

    public render() {
        // const { currentScene } = this.state;
        return (
            <Context.Provider value={this.state}>
                <Canvases />
                <Interfaces />
            </Context.Provider>
        );
    }
}
