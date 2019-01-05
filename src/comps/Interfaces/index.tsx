import React, { Component } from "react";
import Animation from "../../Animation";
import ButtonBack from "./ButtonBack";
import ButtonFaction from "./ButtonFaction";
import ButtonPlay from "./ButtonPlay";
import crackTheDoorPath from "./crack_the_door.png";
import learnToFlyPath from "./learn_to_fly.png";
import Portal from "./Portal";
import Queue from "./Queue";
import theHightSpheresPath from "./the_hight_spheres.png";

const levels = [
    {
        name: "Crack the door",
        img: crackTheDoorPath,
    },
    {
        name: "Learn to fly",
        img: learnToFlyPath,
    },
    {
        name: "The hight spheres",
        img: theHightSpheresPath,
    },
];

export default class Interfaces extends Component {
    public render() {
        return (
            <>
                <ButtonPlay />
                <div ref={Animation.components.levelInterface} className="level-container">
                    <ButtonBack color={"white"} />
                    <div className="level-list">
                        <h2>Select a level</h2>
                        {levels.map((item) => (
                            <Portal
                                {...item}
                                key={item.name}
                            />
                        ))}
                    </div>
                </div>
                <div ref={Animation.components.factionInterface} className="faction-container">
                    <ButtonBack color={"white"} />
                    <ButtonFaction faction="light" />
                    <ButtonFaction faction="shadow" />
                </div>
                <Queue />
            </>
        );
    }
}
