import React, { Component, RefObject } from "react";
import Animation from "./Animation";
import Canvases from "./comps/Canvases";
import Interfaces from "./comps/Interfaces";
import { Context, IState } from "./context";
import { initBothComponents } from "./comps/Canvases/bothComponents";

const backOptions = {
    level() {
        Animation.playLevelToHome();
    },
    faction() {
        Animation.playFactionToLevel();
    },
    queue() {
        Animation.playQueueToFaction();
    },
};

export let app: Menu;

export default class Menu extends Component {
    public state: IState;
    public onTransition: boolean = false;
    public isMobileDevice: boolean = window.innerWidth <= 768;

    private canvases: RefObject<Canvases> = React.createRef();

    constructor(props: {}) {
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
        initBothComponents(this.state.currentScene);
    }

    public componentDidMount() {
        this.initAnimations();
        window.addEventListener("resize", this.resize);
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
        if (currentScene === "queue") {
            Animation.initQueueToFaction(() => {
                this.onTransition = false;
                this.setState({
                    currentScene: "faction",
                });
            });
        }
        backOptions[currentScene]();
    }

    public handleClickOnLevel = (name: string) => {
        // console.log(name);
        this.onTransition = true;
        Animation.playLevelToFaction();
    }

    public handleClickOnFaction = (side: string) => {
        this.setState({
            faction: side,
        }, () => {
            this.onTransition = true;
            Animation.initFactionToQueue(() => {
                this.onTransition = false;
                this.setState({
                    currentScene: "queue",
                });
            });
            Animation.playFactionToQueue();
        });
    }

    public render() {
        const { currentScene } = this.state;
        return (
            <Context.Provider value={this.state}>
                <Canvases ref={this.canvases} />
                <Interfaces currentScene={currentScene} />
            </Context.Provider>
        );
    }

    private initAnimations = () => {
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

    private resize = () => {
        this.isMobileDevice = window.innerWidth <= 768;
        if (this.canvases.current) {
            this.canvases.current.resize();
        }
        this.initAnimations();
    }
}
