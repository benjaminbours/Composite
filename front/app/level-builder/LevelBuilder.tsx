'use client';
// vendors
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRef } from 'react';
import { Euler, Mesh, Object3D, Vector3 } from 'three';
import dynamic from 'next/dynamic';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// our libs
import {
    ElementName,
    ElementToBounce,
    GameState,
    InteractiveArea,
    MovableComponentState,
    Side,
    degreesToRadians,
    gridSize,
    radiansToDegrees,
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

    const currentEditingElement = useMemo(() => {
        if (currentEditingIndex === undefined) {
            return null;
        }
        return state[currentEditingIndex];
    }, [currentEditingIndex, state]);

    // effect responsible to update the current attach transform control element in three.js accordingly with the react state
    useEffect(() => {
        if (!appRef.current) {
            return;
        }
        if (currentEditingElement) {
            appRef.current?.attachTransformControls(currentEditingElement.mesh);
        } else {
            appRef.current?.detachTransformControls();
        }
    }, [currentEditingElement]);

    // responsible to register and clear event listeners for the level builder
    useEffect(() => {
        if (!appRef.current) {
            return;
        }
        function isMouseLeftButton(event: any) {
            if (
                event.metaKey ||
                event.ctrlKey ||
                event.altKey ||
                event.shiftKey
            ) {
                return false;
            } else if ('buttons' in event) {
                return event.buttons === 1;
            } else if ('which' in event) {
                return event.which === 1;
            } else {
                return event.button == 1 || event.type == 'click';
            }
        }
        const app = appRef.current;
        const onMouseMove = (e: MouseEvent) => {
            app.mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
            app.mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        const onMouseDown = (e: MouseEvent) => {
            if (!app.mouseSelectedObject) {
                return;
            }

            if (!isMouseLeftButton(e)) {
                return;
            }

            function findItemInParents(object: any, item: any) {
                // If the current object is the item, return it
                if (object === item) {
                    return object;
                }

                // If the current object has a parent, search in the parent
                if (object.parent) {
                    return findItemInParents(object.parent, item);
                }

                // If the item was not found, return null
                return null;
            }

            const index = state.findIndex((el) => {
                return Boolean(
                    findItemInParents(app.mouseSelectedObject, el.mesh),
                );
            });

            if (index !== -1) {
                setCurrentEditingIndex(index);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyT': // T
                    app.transformControls?.setMode('translate');
                    break;
                case 'KeyR': // R
                    app.transformControls?.setMode('rotate');
                    break;
                default:
                    break;
            }
        };
        app.canvasDom.addEventListener('mousemove', onMouseMove);
        app.canvasDom.addEventListener('mousedown', onMouseDown);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            app.canvasDom.removeEventListener('mousemove', onMouseMove);
            app.canvasDom.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [state]);

    const handleControlObjectChange = useCallback((object: Object3D) => {
        setState((prevState) => {
            const nextState = [...prevState];
            const index = nextState.findIndex((el) => el.mesh === object);
            nextState[index].properties.position = object.position
                .clone()
                .divideScalar(gridSize);
            const rotationX = radiansToDegrees(object.rotation.x);
            const rotationY = radiansToDegrees(object.rotation.y);
            const rotationZ = radiansToDegrees(object.rotation.z);
            (nextState[index].properties as any).rotation = new Euler(
                rotationX,
                rotationY,
                rotationZ,
            );
            return nextState;
        });
    }, []);

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
                    const notCollidable = ['particles'];
                    if (
                        child.name.includes('Occlusion') ||
                        notCollidable.includes(child.name) ||
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
                appRef.current.attachTransformControls(group);
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
                if (mesh.id === appRef.current.controlledMesh?.id) {
                    appRef.current.detachTransformControls();
                }
                appRef.current.removeFromCollidingElements(mesh);
                if (mesh.name.includes('WALL_DOOR')) {
                    const id = mesh.name.split('_')[0];
                    delete appRef.current.gameStateManager.currentState.level
                        .doors[id];
                }
                if (mesh.name.includes('BOUNCE')) {
                    const bounce = mesh.children[0] as ElementToBounce;
                    const index = appRef.current.level.bounces.findIndex(
                        (el) => el === mesh,
                    );
                    appRef.current.level.bounces.splice(index, 1);
                    delete appRef.current.gameStateManager.currentState.level
                        .bounces[bounce.bounceID];
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
                        const areaDoorOpener = mesh
                            .children[0] as InteractiveArea;
                        const doorOpener = mesh.children[1] as DoorOpener;
                        const wallDoor = prevState.find(
                            (el) =>
                                el.type === ElementType.WALL_DOOR &&
                                (el.properties as WallDoorProperties).id ===
                                    value,
                        );
                        mesh.name = `door-opener-group-${value}`;
                        areaDoorOpener.name = ElementName.AREA_DOOR_OPENER(
                            String(value),
                        );
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
                    case 'interactive':
                    case 'doorPosition':
                    case 'size':
                        (properties as any)[propertyKey] = (() => {
                            if (propertyKey === 'side') {
                                return value === true
                                    ? Side.LIGHT
                                    : Side.SHADOW;
                            }
                            return value;
                        })();
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
                    // Transformations
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

    // console.log(appRef.current?.collidingElements);

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
                onTransformControlsObjectChange={handleControlObjectChange}
            />
        </main>
    );
};
