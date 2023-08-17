import React, { Component } from 'react';
import Animation from '../../Animation';
import ButtonBack from './ButtonBack';
import ButtonFaction from './ButtonFaction';
import ButtonPlay from './ButtonPlay';
import Portal from './Portal';
import Queue from './Queue';

const levels = [
    {
        name: 'Crack the door',
        img: '/crack_the_door.png',
    },
    {
        name: 'Learn to fly',
        img: '/learn_to_fly.png',
    },
    {
        name: 'The hight spheres',
        img: '/the_hight_spheres.png',
    },
];

interface IProps {
    currentScene: string;
}

export default class Interfaces extends Component<IProps> {
    public render() {
        const { currentScene } = this.props;
        return (
            <>
                <div
                    ref={Animation.components.homeInterface}
                    className={`home-container ${
                        currentScene !== 'home' ? 'unmount' : ''
                    }`}
                >
                    <h2>Think both ways</h2>
                    <ButtonPlay />
                </div>
                <div
                    ref={Animation.components.levelInterface}
                    className={`level-container ${
                        currentScene !== 'level' ? 'unmount' : ''
                    }`}
                >
                    <ButtonBack color={'white'} />
                    <div className="level-list">
                        <h2>Select a&nbsp;level</h2>
                        {levels.map((item) => (
                            <Portal {...item} key={item.name} />
                        ))}
                    </div>
                </div>
                <div
                    ref={Animation.components.factionInterface}
                    className={`faction-container ${
                        currentScene !== 'faction' ? 'unmount' : ''
                    }`}
                >
                    <ButtonBack color={'white'} />
                    <ButtonFaction side="white" />
                    <ButtonFaction side="black" />
                </div>
                <Queue />
            </>
        );
    }
}
