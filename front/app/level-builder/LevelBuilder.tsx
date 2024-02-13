'use client';
// vendors
import React, { useCallback, useMemo, useState } from 'react';
import { useRef } from 'react';
import { Object3D, Vector3 } from 'three';
import dynamic from 'next/dynamic';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// our libs
import {
    GameState,
    MovableComponentState,
    Side,
    degreesToRadians,
    gridSize,
} from '@benjaminbours/composite-core';
// project
import InputsManager from '../Game/Player/InputsManager';
import { BounceProperties, ElementType, LevelElement } from './types';
import { EmptyLevel } from '../Game/levels/EmptyLevel';
import App from '../Game/App';
import { SceneContentPanel } from './SceneContentPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { TopBar } from './TopBar';
import { createElement } from './utils';

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
                // TODO: Try better solution than putting the player position below the ground
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

    const addMeshToScene = useCallback((mesh: Object3D) => {
        if (appRef.current) {
            appRef.current.scene.add(mesh);
            // TODO: Do not add all as colliding elements, it depends of the type and position
            // appRef.current.collidingElements.push(mesh);
        }
    }, []);

    const removeMeshFromScene = useCallback(
        (state: LevelElement[], index: number) => {
            if (appRef.current) {
                const mesh = state[index].mesh;
                appRef.current.scene.remove(mesh);
                const collidingIndex =
                    appRef.current.collidingElements.indexOf(mesh);
                if (collidingIndex !== -1) {
                    appRef.current.collidingElements.splice(collidingIndex, 1);
                }
            }
        },
        [],
    );

    const addElementToLevel = useCallback(
        (type: ElementType) => {
            if (!appRef.current) {
                return;
            }
            const [mesh, properties] = createElement(appRef.current, type);
            setState((state) => [
                ...state,
                {
                    name: `${type}_${state.length}`,
                    type,
                    properties,
                    mesh,
                },
            ]);
            // last index + 1 = state.length
            setCurrentEditingIndex(state.length);
            addMeshToScene(mesh);
        },
        [state, addMeshToScene],
    );

    const selectElement = useCallback(
        (index: number) => () => {
            setCurrentEditingIndex((prev) => {
                if (prev === index) {
                    return undefined;
                }
                return index;
            });
        },
        [],
    );

    const deleteElement = useCallback(
        (index: number) => () => {
            setState((state) => {
                // remove mesh from scene first
                removeMeshFromScene(state, index);
                // update state
                const newState = [...state];
                newState.splice(index, 1);
                return newState;
            });
        },
        [removeMeshFromScene],
    );

    const updateElementProperty = useCallback(
        (propertyKey: string, value: any) => {
            if (currentEditingIndex === undefined) {
                return;
            }
            setState((state) => {
                const nextState = [...state];

                // update mesh
                if (!appRef.current) {
                    return nextState;
                }
                let { properties, mesh, type } = nextState[currentEditingIndex];
                switch (propertyKey) {
                    case 'side':
                        (properties as BounceProperties)[propertyKey] =
                            value === true ? Side.LIGHT : Side.SHADOW;
                        // remove element
                        removeMeshFromScene(nextState, currentEditingIndex);
                        const [newMeshBounce] = createElement(
                            appRef.current,
                            type,
                            nextState[currentEditingIndex].properties,
                        );
                        nextState[currentEditingIndex].mesh = newMeshBounce;
                        addMeshToScene(nextState[currentEditingIndex].mesh);
                        break;
                    case 'interactive':
                        // TODO: TO implement after managing graphics side of bounces
                        const props = properties as BounceProperties;
                        props[propertyKey] = value;

                        // remove element
                        removeMeshFromScene(nextState, currentEditingIndex);
                        const [bounceGroup] = createElement(
                            appRef.current,
                            type,
                            nextState[currentEditingIndex].properties,
                        );
                        nextState[currentEditingIndex].mesh = bounceGroup;
                        addMeshToScene(nextState[currentEditingIndex].mesh);
                        break;
                    case 'position':
                        properties[propertyKey] = value;
                        mesh.position.copy(
                            (value as Vector3).clone().multiplyScalar(gridSize),
                        );
                        break;
                    case 'rotation':
                        (properties as any)[propertyKey] = value;
                        const rotationX = degreesToRadians(value.x);
                        const rotationY = degreesToRadians(value.y);
                        const rotationZ = degreesToRadians(value.z);
                        mesh.rotation.set(rotationX, rotationY, rotationZ);
                        break;
                    case 'size':
                        (properties as any)[propertyKey] = value;
                        // remove element
                        removeMeshFromScene(nextState, currentEditingIndex);
                        // create a new one
                        const [newMesh] = createElement(
                            appRef.current,
                            type,
                            nextState[currentEditingIndex].properties,
                        );
                        nextState[currentEditingIndex].mesh = newMesh;
                        addMeshToScene(nextState[currentEditingIndex].mesh);
                        break;
                }
                return nextState;
            });
        },
        [currentEditingIndex, removeMeshFromScene, addMeshToScene],
    );

    const changeElementName = useCallback(
        (index: number) => (e: any) => {
            setState((state) => {
                const newState = [...state];
                newState[index].name = e.target.value;
                return newState;
            });
        },
        [],
    );

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
                <div className="level-builder__top-right-container">
                    <SceneContentPanel
                        elements={state}
                        currentEditingIndex={currentEditingIndex}
                        onElementClick={selectElement}
                        onChangeName={changeElementName}
                        onElementDelete={deleteElement}
                    />
                    {currentEditingElement && (
                        <PropertiesPanel
                            onUpdateProperty={updateElementProperty}
                            element={currentEditingElement}
                        />
                    )}
                </div>
            </ThemeProvider>
            <Game
                side={Side.SHADOW}
                initialGameState={initialGameState}
                tabIsHidden={false}
                stats={statsRef}
                inputsManager={inputsManager.current}
                levelBuilderAppRef={appRef}
            />
        </main>
    );
};
