'use client';
// vendors
import React, { useCallback, useMemo, useState } from 'react';
import { useRef } from 'react';
import { Vector3 } from 'three';
import dynamic from 'next/dynamic';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// our libs
import {
    GameState,
    MovableComponentState,
    Side,
    createWall,
} from '@benjaminbours/composite-core';
// project
import InputsManager from '../Game/Player/InputsManager';
import { ElementType, LevelElement, WallProperties } from './types';
import { EmptyLevel } from '../Game/levels/EmptyLevel';
import App from '../Game/App';
import { SceneContentPanel } from './SceneContentPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { TopBar } from './TopBar';

const Game = dynamic(() => import('../Game'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

const level = new EmptyLevel();
const initialGameState = new GameState(
    [
        {
            position: {
                x: 200,
                y: 20,
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
                x: 10,
                y: 20,
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

// const theme = createTheme({
//     palette: {
//         primary: {
//             main: '#000000',
//             light: '#b8b8b8',
//             dark: '#3c3c3c',
//             contrastText: '#fff',
//         },
//         secondary: {
//             main: '#ffffff',
//             // light: '#b8b8b8',
//             // dark: '#777777',
//             contrastText: '#000',
//         },
//     },
// });

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export const LevelBuilder: React.FC = ({}) => {
    const [currentEditingIndex, setCurrentEditingIndex] = useState<
        number | undefined
    >(undefined);
    const [state, setState] = useState<LevelElement[]>([]);
    const appRef = useRef<App>();
    const statsRef = useRef<Stats>();
    const inputsManager = useRef<InputsManager>(new InputsManager());

    const addElementToLevel = useCallback(
        (type: ElementType) => {
            const [mesh, properties] = (() => {
                let properties;
                switch (type) {
                    case ElementType.WALL:
                    default:
                        properties = new WallProperties();
                        const mesh = createWall({
                            size: properties.size,
                            position: properties.position,
                            rotation: new Vector3(),
                        });
                        return [mesh, properties];
                }
            })();
            setState((state) => [
                ...state,
                {
                    name: `${type}_${state.length}`,
                    type,
                    properties,
                },
            ]);
            // last index + 1 = state.length
            setCurrentEditingIndex(state.length);

            if (appRef.current) {
                appRef.current.scene.add(mesh);
                appRef.current.collidingElements.push(mesh);
            }
        },
        [state],
    );

    const selectElement = useCallback((index: number) => {
        setCurrentEditingIndex((prev) => {
            if (prev === index) {
                return undefined;
            }
            return index;
        });
    }, []);

    const resetCamera = useCallback(() => {
        if (appRef.current) {
            appRef.current.camera.position.set(0, 100, 500);
            appRef.current.controls?.target.set(0, 100, 0);
        }
    }, []);

    const currentEditingElement = useMemo(() => {
        if (currentEditingIndex === undefined) {
            return null;
        }
        return state[currentEditingIndex];
    }, [currentEditingIndex, state]);

    return (
        <main className="level-builder">
            <ThemeProvider theme={darkTheme}>
                <TopBar
                    onResetCamera={resetCamera}
                    onLibraryElementClick={addElementToLevel}
                />
                <div className="level-builder__bottom-right-container">
                    <SceneContentPanel
                        elements={state}
                        currentEditingIndex={currentEditingIndex}
                        onElementClick={selectElement}
                    />
                    {currentEditingElement && (
                        <PropertiesPanel element={currentEditingElement} />
                    )}
                </div>
            </ThemeProvider>
            <Game
                side={Side.SHADOW}
                initialGameState={initialGameState}
                // socketController={socketController.current}
                tabIsHidden={false}
                stats={statsRef}
                inputsManager={inputsManager.current}
                levelBuilderAppRef={appRef}
            />
        </main>
    );
};
