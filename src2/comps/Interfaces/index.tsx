import React, { Component } from "react";
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
                {/* {currentScene === "home" && */}
                <ButtonPlay refPlay={refPlay} />
                {/* } */}
                {/* {currentScene === "level" && */}
                <div className={`level-list${currentScene === "level" ? "" : " unmount"}`}>
                    {levels.map((item) => (
                        <Portal
                            {...item}
                            key={item.name}
                        />
                    ))}
                </div>
                {/* } */}
            </>
        );
    }
}
