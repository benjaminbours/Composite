'use client';
import React from 'react';
import { useRef } from 'react';
import InputsManager from '../Game/Player/InputsManager';
import dynamic from 'next/dynamic';
import {
    GameState,
    MovableComponentState,
    Side,
} from '@benjaminbours/composite-core';
import { CrackTheDoorLevelWithGraphic } from '../Game/levels/CrackTheDoorLevelWithGraphic';
import { ElementsPanel } from './ElementsPanel';

const Game = dynamic(() => import('../Game'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

const level = new CrackTheDoorLevelWithGraphic();
const initialGameState = new GameState(
    [
        {
            position: {
                x: level.startPosition.shadow.x,
                y: level.startPosition.shadow.y,
            },
            velocity: {
                x: 0,
                y: 0,
            },
            state: MovableComponentState.onFloor,
            insideElementID: undefined,
        },
        {
            position: {
                x: level.startPosition.light.x,
                y: level.startPosition.light.y,
            },
            velocity: {
                x: 0,
                y: 0,
            },
            state: MovableComponentState.onFloor,
            insideElementID: undefined,
        },
    ],
    {
        ...level.state,
    },
    Date.now(),
    0,
);

export const LevelBuilder: React.FC = ({}) => {
    const statsRef = useRef<Stats>();
    const inputsManager = useRef<InputsManager>(new InputsManager());

    return (
        <main className="level-builder-core">
            <ElementsPanel />
            <Game
                side={Side.SHADOW}
                initialGameState={initialGameState}
                // socketController={socketController.current}
                tabIsHidden={false}
                stats={statsRef}
                inputsManager={inputsManager.current}
            />
        </main>
    );
};
