import { Power3, TweenLite } from "gsap";
import React, { Component } from "react";
import Transition from "react-transition-group/Transition";
import ButtonPlay from "./ButtonPlay";
import crackTheDoorPath from "./crack_the_door.png";
import learnToFlyPath from "./learn_to_fly.png";
import Portal from "./Portal";
import theHightSpheresPath from "./the_hight_spheres.png";

interface IProps {
    currentScene: string;
    refPlay;
}

const levels = [
    {
        id: "position",
        name: "Crack the door",
        img: crackTheDoorPath,
    },
    {
        id: "projection",
        name: "Learn to fly",
        img: learnToFlyPath,
    },
    {
        id: "mixed",
        name: "The hight spheres",
        img: theHightSpheresPath,
    },
];

export default class Interfaces extends Component<IProps> {
    public componentDidUpdate(prevProps: IProps, prevStates) {
        if (prevProps.currentScene !== this.props.currentScene) {
            // if (this.props.currentScene === "level") {
            // }
        }
    }

    public render() {
        const { currentScene, refPlay } = this.props;
        return (
            <>
                <Transition
                    timeout={500}
                    mountOnEnter
                    unmountOnExit
                    in={currentScene === "home"}
                    onEnter={(node: HTMLElement) => {
                        TweenLite.fromTo(node, 0.5, {
                            opacity: 0,
                        }, {
                                opacity: 1,
                            });
                    }}
                    onExit={(node: HTMLElement) => {
                        TweenLite.fromTo(node, 0.5, {
                            opacity: 1,
                        }, {
                                opacity: 0,
                            });
                    }}
                >
                    <ButtonPlay refPlay={refPlay} />
                </Transition>
                <Transition
                    timeout={500}
                    mountOnEnter
                    unmountOnExit
                    in={currentScene === "level"}
                    onEnter={(node: HTMLElement) => {
                        TweenLite.fromTo(node, 0.5, {
                            opacity: 0,
                        }, {
                                opacity: 1,
                            });
                    }}
                >
                    <div className="level-list">
                        <h2>Select a level</h2>
                        {levels.map((item) => (
                            <Portal
                                {...item}
                                key={item.name}
                            />
                        ))}
                    </div>
                </Transition>
            </>
        );
    }
}
