'use client';
// vendors
import React, { useCallback, useMemo, useState } from 'react';
import { useRef } from 'react';
import { Euler, Object3D, Vector3 } from 'three';
import dynamic from 'next/dynamic';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// our libs
import {
    GameState,
    MovableComponentState,
    Side,
    createArchGroup,
    createWall,
    degreesToRadians,
    gridSize,
} from '@benjaminbours/composite-core';
// project
import InputsManager from '../Game/Player/InputsManager';
import {
    ArchProperties,
    ElementType,
    LevelElement,
    WallProperties,
} from './types';
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
            appRef.current.collidingElements.push(mesh);
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
            const [mesh, properties] = (() => {
                let properties;
                let mesh;
                switch (type) {
                    case ElementType.ARCH:
                        properties = new ArchProperties();
                        mesh = createArchGroup({
                            size: properties.size.clone(),
                            position: properties.position.clone(),
                        });
                        return [mesh, properties];
                    case ElementType.WALL:
                    default:
                        properties = new WallProperties();
                        mesh = createWall({
                            size: properties.size.clone(),
                            position: properties.position.clone(),
                            rotation: properties.rotation.clone(),
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
        (propertyKey: string, value: Vector3 | Euler) => {
            if (currentEditingIndex === undefined) {
                return;
            }
            setState((state) => {
                const nextState = [...state];
                (nextState[currentEditingIndex].properties as any)[
                    propertyKey
                ] = value;

                // update mesh
                if (appRef.current) {
                    let { properties, mesh, type } =
                        nextState[currentEditingIndex];
                    switch (propertyKey) {
                        case 'position':
                            mesh.position.copy(
                                (value as Vector3)
                                    .clone()
                                    .multiplyScalar(gridSize),
                            );
                            break;
                        case 'rotation':
                            const rotationX = degreesToRadians(value.x);
                            const rotationY = degreesToRadians(value.y);
                            const rotationZ = degreesToRadians(value.z);
                            mesh.rotation.set(rotationX, rotationY, rotationZ);
                            break;
                        case 'size':
                            // remove element
                            removeMeshFromScene(nextState, currentEditingIndex);

                            // create a new one
                            switch (type) {
                                case ElementType.WALL:
                                    nextState[currentEditingIndex].mesh =
                                        createWall({
                                            size: properties.size.clone(),
                                            position:
                                                properties.position.clone(),
                                            rotation: (
                                                properties as WallProperties
                                            ).rotation.clone(),
                                        });
                                    break;
                                case ElementType.ARCH:
                                    nextState[currentEditingIndex].mesh =
                                        createArchGroup({
                                            size: properties.size.clone(),
                                            position:
                                                properties.position.clone(),
                                        });
                                default:
                                    break;
                            }
                            addMeshToScene(nextState[currentEditingIndex].mesh);
                            break;
                    }
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
