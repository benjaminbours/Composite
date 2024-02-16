'use client';
// vendors
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRef } from 'react';
import { Mesh, Object3D, Vector3 } from 'three';
import dynamic from 'next/dynamic';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// our libs
import {
    ElementName,
    ElementToBounce,
    GameState,
    MovableComponentState,
    Side,
    degreesToRadians,
    gridSize,
} from '@benjaminbours/composite-core';
// project
import InputsManager from '../Game/Player/InputsManager';
import {
    BounceProperties,
    DoorOpenerProperties,
    ElementType,
    LevelElement,
    WallDoorProperties,
} from './types';
import { EmptyLevel } from '../Game/levels/EmptyLevel';
import App, { AppMode } from '../Game/App';
import { SceneContentPanel } from './SceneContentPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { TopBar } from './TopBar';
import { computeDoorInfo, createElement } from './utils';
import { DoorOpener } from '../Game/elements/DoorOpener';
import { SkinBounce } from '../Game/elements/SkinBounce';

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


    const addToCollidingElements = useCallback((group: Object3D) => {
        if (appRef.current) {
            const addToCollidingElements = (mesh: Mesh) => {
                if (appRef.current!.detectIfMeshIsCollidable(mesh)) {
                    (mesh.geometry as any).computeBoundsTree();
                    appRef.current!.collidingElements.push(mesh);
                }
            };
            const checkChildren = (elements: Object3D[]) => {
                for (let i = 0; i < elements.length; i++) {
                    const child = elements[i];
                    if (
                        child.name.includes('Occlusion') ||
                        child instanceof SkinBounce === true
                    ) {
                        continue;
                    }

                    if (child.children.length > 0) {
                        checkChildren(child.children);
                    } else {
                        addToCollidingElements(child as Mesh);
                    }
                }
            };
            checkChildren(group.children);
        }
    }, []);

    const addMeshToScene = useCallback(
        (type: ElementType, group: Object3D) => {
            if (appRef.current) {
                appRef.current.scene.add(group);
                addToCollidingElements(group);
            }
        },
        [addToCollidingElements],
    );

    const removeMeshFromScene = useCallback(
        (state: LevelElement[], index: number) => {
            if (appRef.current) {
                const mesh = state[index].mesh;
                appRef.current.scene.remove(mesh);
                appRef.current.removeFromCollidingElements(mesh);
                if (mesh.name.includes('BOUNCE')) {
                    const bounce = mesh.children[0] as ElementToBounce;
                    if (bounce.side === Side.LIGHT) {
                        appRef.current.rendererManager.removeLightBounceComposer(
                            bounce,
                        );
                    }
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
            const { mesh, properties } = createElement(appRef.current, type);
            setState((prevState) => [
                ...prevState,
                {
                    name: `${type}_${prevState.length}`,
                    type,
                    properties,
                    mesh,
                },
            ]);
            // last index + 1 = state.length
            setCurrentEditingIndex(state.length);
            addMeshToScene(type, mesh);
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
            setState((prevState) => {
                // remove mesh from scene first
                removeMeshFromScene(prevState, index);
                // update state
                const newState = [...prevState];
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
            setState((prevState) => {
                const nextState = [...prevState];

                // update mesh
                if (!appRef.current) {
                    return nextState;
                }
                let { properties, mesh, type } = nextState[currentEditingIndex];
                switch (propertyKey) {
                    case 'door_id':
                        (properties as DoorOpenerProperties)[propertyKey] =
                            value;

                        // mesh is a door opener group here
                        const doorOpener = mesh.children[1] as DoorOpener;
                        const wallDoor = prevState.find(
                            (el) =>
                                (el.properties as WallDoorProperties).id ===
                                value,
                        );
                        mesh.name = ElementName.AREA_DOOR_OPENER(String(value));
                        doorOpener.name = ElementName.DOOR_OPENER(
                            String(value),
                        );
                        if (wallDoor && value !== undefined) {
                            const doorInfo = computeDoorInfo(
                                wallDoor.mesh,
                                doorOpener,
                            );
                            doorOpener.doorInfo = doorInfo;
                        } else {
                            doorOpener.doorInfo = undefined;
                        }

                        break;
                    case 'side':
                        (properties as BounceProperties)[propertyKey] =
                            value === true ? Side.LIGHT : Side.SHADOW;
                        // remove element
                        removeMeshFromScene(nextState, currentEditingIndex);
                        const { mesh: newMeshBounce } = createElement(
                            appRef.current,
                            type,
                            nextState[currentEditingIndex].properties,
                        );
                        nextState[currentEditingIndex].mesh = newMeshBounce;
                        addMeshToScene(
                            type,
                            nextState[currentEditingIndex].mesh,
                        );
                        break;
                    case 'interactive':
                        // TODO: TO implement after managing graphics side of bounces
                        const props = properties as BounceProperties;
                        props[propertyKey] = value;

                        // remove element
                        removeMeshFromScene(nextState, currentEditingIndex);
                        const { mesh: bounceGroup } = createElement(
                            appRef.current,
                            type,
                            nextState[currentEditingIndex].properties,
                        );
                        nextState[currentEditingIndex].mesh = bounceGroup;
                        addMeshToScene(
                            type,
                            nextState[currentEditingIndex].mesh,
                        );
                        break;
                    case 'doorPosition':
                        (properties as WallDoorProperties)[propertyKey] = value;
                        removeMeshFromScene(nextState, currentEditingIndex);
                        const { mesh: newDoor } = createElement(
                            appRef.current,
                            type,
                            nextState[currentEditingIndex].properties,
                        );
                        nextState[currentEditingIndex].mesh = newDoor;
                        addMeshToScene(
                            type,
                            nextState[currentEditingIndex].mesh,
                        );
                        break;
                    case 'rotation':
                        (properties as any)[propertyKey] = value;
                        appRef.current.removeFromCollidingElements(mesh);
                        const rotationX = degreesToRadians(value.x);
                        const rotationY = degreesToRadians(value.y);
                        const rotationZ = degreesToRadians(value.z);
                        mesh.rotation.set(rotationX, rotationY, rotationZ);
                        addToCollidingElements(mesh);
                        break;
                    case 'position':
                        (properties as any)[propertyKey] = value;
                        appRef.current.removeFromCollidingElements(mesh);
                        mesh.position.copy(
                            (value as Vector3).clone().multiplyScalar(gridSize),
                        );
                        addToCollidingElements(mesh);
                        break;
                    case 'size':
                        (properties as any)[propertyKey] = value;
                        // remove element
                        removeMeshFromScene(nextState, currentEditingIndex);
                        // create a new one
                        const { mesh: newMesh } = createElement(
                            appRef.current,
                            type,
                            nextState[currentEditingIndex].properties,
                        );
                        nextState[currentEditingIndex].mesh = newMesh;
                        addMeshToScene(
                            type,
                            nextState[currentEditingIndex].mesh,
                        );
                        break;
                }
                return nextState;
            });
        },
        [
            currentEditingIndex,
            removeMeshFromScene,
            addMeshToScene,
            addToCollidingElements,
        ],
    );

    const changeElementName = useCallback(
        (index: number) => (e: any) => {
            setState((prevState) => {
                const newState = [...prevState];
                newState[index].name = e.target.value;
                return newState;
            });
        },
        [],
    );

    const resetCamera = useCallback(() => {
        if (appRef.current) {
            appRef.current.resetEditorCamera();
        }
    }, []);

    const toggleCollisionArea = useCallback(() => {
        if (appRef.current) {
            appRef.current.toggleCollisionArea();
        }
    }, []);

    const toggleTestMode = useCallback(() => {
        if (appRef.current) {
            appRef.current.setAppMode(
                appRef.current.mode === AppMode.GAME
                    ? AppMode.EDITOR
                    : AppMode.GAME,
            );
        }
    }, []);

    const resetPlayersPosition = useCallback(() => {
        if (appRef.current) {
            appRef.current.resetPlayersPosition();
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
                    onToggleCollisionArea={toggleCollisionArea}
                    onStartTestMode={toggleTestMode}
                    onResetPlayersPosition={resetPlayersPosition}
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
                            state={state}
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
