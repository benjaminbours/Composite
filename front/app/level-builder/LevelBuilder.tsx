'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { useRef } from 'react';
import InputsManager from '../Game/Player/InputsManager';
import dynamic from 'next/dynamic';
import {
    GameState,
    MovableComponentState,
    Side,
    createWall,
} from '@benjaminbours/composite-core';
import { LibraryPanel } from './LibraryPanel';
import { ElementType, LevelElement, WallProperties } from './types';
import { EmptyLevel } from '../Game/levels/EmptyLevel';
import { Scene, Vector3 } from 'three';
import App from '../Game/App';
import { SceneContentPanel } from './SceneContentPanel';
import { PropertiesPanel } from './PropertiesPanel';

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

export const LevelBuilder: React.FC = ({}) => {
    const [currentEditingIndex, setCurrentEditingIndex] = useState<
        number | undefined
    >(undefined);
    const [state, setState] = useState<LevelElement[]>([]);
    const appRef = useRef<App>();
    const statsRef = useRef<Stats>();
    const inputsManager = useRef<InputsManager>(new InputsManager());

    const addElementToLevel = useCallback(
        (type: ElementType) => (clickEvent: any) => {
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
            clickEvent.target.blur();

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

    const currentEditingElement = useMemo(() => {
        if (currentEditingIndex === undefined) {
            return null;
        }
        return state[currentEditingIndex];
    }, [currentEditingIndex, state]);

    return (
        <main className="level-builder">
            <LibraryPanel onElementClick={addElementToLevel} />
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
