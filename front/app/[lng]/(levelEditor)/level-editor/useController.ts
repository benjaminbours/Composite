import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    addMeshToScene,
    addToCollidingElements,
    computeDoorInfo,
    createElement,
    parseLevelElements,
    removeMeshFromScene,
} from './utils';
import { useSnackbar } from 'notistack';
import { getDictionary } from '../../../../getDictionary';
import { Euler, Object3D, Vector3 } from 'three';
import {
    ElementName,
    InteractiveArea,
    Side,
    degreesToRadians,
    gridSize,
    radiansToDegrees,
    DoorOpenerProperties,
    ElementType,
    LevelElement,
    WallDoorProperties,
} from '@benjaminbours/composite-core';
import App from '../../../Game/App';
import { DoorOpener } from '../../../Game/elements/DoorOpener';
import { servicesContainer } from '../../../core/frameworks';
import { ApiClient } from '../../../core/services';
import { useRouter } from 'next/navigation';
import { Route } from '../../../types';
import { Level } from '@benjaminbours/composite-api-client';
import { useStoreState } from '../../../hooks';
import { generateErrorNotification } from '../../../utils/errors/generateErrorNotification';

export function useController(
    level_id: string,
    initialLevel: { name: string; data: any },
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'],
) {
    const isAuthenticated = useStoreState(
        (state) => state.user.isAuthenticated,
    );
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const [app, setApp] = useState<App>();
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditingIndex, setCurrentEditingIndex] = useState<number>();
    const [levelName, setLevelName] = useState(initialLevel.name);
    const [elements, setElements] = useState<LevelElement[]>([]);
    const [hasErrorWithLevelName, setHasErrorWithLevelName] = useState(false);

    const handleLevelNameChange = useCallback(
        (e: any) => {
            setLevelName(e.target.value);
            if (e.target.value) {
                setHasErrorWithLevelName(false);
            }
        },
        [setLevelName],
    );

    const handleClickOnSave = useCallback(() => {
        if (!levelName) {
            enqueueSnackbar(
                dictionary.notification['error-missing-level-name'],
                {
                    variant: 'error',
                },
            );
            setHasErrorWithLevelName(true);
            return;
        }

        if (!isAuthenticated) {
            setIsModalOpen(true);
            return;
        }

        const apiClient = servicesContainer.get(ApiClient);
        const onSuccess = (level: Level) => {
            if (!app) {
                return;
            }
            router.push(Route.LEVEL_EDITOR(level.id));
            // prepare the next state
            const nextState = parseLevelElements(level.data);
            setElements((prev) => {
                // remove all elements from the scene
                prev.forEach((el) => {
                    removeMeshFromScene(app, el.mesh);
                });
                // return the next state
                return nextState;
            });
            // load the next state into the scene
            const loadElementsToScene = (elementList: LevelElement[]) => {
                for (let i = 0; i < elementList.length; i++) {
                    const { type, mesh } = elementList[i];
                    addMeshToScene(app, type, mesh);
                }
            };
            loadElementsToScene(nextState);
            enqueueSnackbar(dictionary.notification['success-level-saved'], {
                variant: 'success',
            });
        };
        const onFinally = () => {
            setIsSaving(false);
        };
        setIsSaving(true);
        const elementsToSend = elements.map((el) => ({
            type: el.type,
            properties: el.properties,
            name: el.name,
        }));
        if (level_id === 'new') {
            apiClient.defaultApi
                .levelsControllerCreate({
                    createLevelDto: {
                        name: levelName,
                        data: elementsToSend,
                    },
                })
                .then(onSuccess)
                .catch(async (error: any) => {
                    console.error(error);
                    const errorData = await error.response.json();
                    let message;
                    if (errorData.message === 'Unique constraint violation') {
                        message =
                            dictionary.notification['error-level-name-taken'];
                        setHasErrorWithLevelName(true);
                    } else {
                        message = generateErrorNotification(
                            errorData,
                            dictionary,
                        );
                    }
                    enqueueSnackbar(message, {
                        variant: 'error',
                    });
                })
                .finally(onFinally);
        } else {
            apiClient.defaultApi
                .levelsControllerUpdate({
                    id: level_id,
                    updateLevelDto: {
                        name: levelName,
                        data: elementsToSend,
                    },
                })
                .then(onSuccess)
                .finally(onFinally);
        }
    }, [
        enqueueSnackbar,
        dictionary,
        elements,
        levelName,
        router,
        level_id,
        isAuthenticated,
        app,
    ]);

    const updateElementName = useCallback(
        (index: number) => (e: any) => {
            setElements((prev) => {
                const newState = [...prev];
                newState[index].name = e.target.value;
                return newState;
            });
        },
        [],
    );

    const handleControlObjectChange = useCallback((object: Object3D) => {
        // update element transformations
        setElements((prev) => {
            const nextState = [...prev];
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

    const handleUpdateElementProperty = useCallback(
        (propertyKey: string, value: any) => {
            if (currentEditingIndex === undefined || !app) {
                return;
            }

            setElements((prev) => {
                const nextState = [...prev];
                let { properties, mesh, type } = nextState[currentEditingIndex];
                switch (propertyKey) {
                    case 'door_id':
                        (properties as DoorOpenerProperties)[propertyKey] =
                            value;
                        // mesh is a door opener group here
                        const areaDoorOpener = mesh
                            .children[0] as InteractiveArea;
                        const doorOpener = mesh.children[1] as DoorOpener;
                        const wallDoor = nextState.find(
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
                        removeMeshFromScene(
                            app,
                            nextState[currentEditingIndex].mesh,
                        );
                        // create a new one
                        const { mesh: newMesh } = createElement(
                            app,
                            type,
                            nextState[currentEditingIndex].properties,
                        );
                        nextState[currentEditingIndex].mesh = newMesh;
                        addMeshToScene(
                            app,
                            type,
                            nextState[currentEditingIndex].mesh,
                        );
                        break;
                    // Transformations
                    case 'rotation':
                        (properties as any)[propertyKey] = value;
                        app.removeFromCollidingElements(mesh);
                        const rotationX = degreesToRadians(value.x);
                        const rotationY = degreesToRadians(value.y);
                        const rotationZ = degreesToRadians(value.z);
                        mesh.rotation.set(rotationX, rotationY, rotationZ);
                        addToCollidingElements(app, mesh);
                        break;
                    case 'position':
                        (properties as any)[propertyKey] = value;
                        app.removeFromCollidingElements(mesh);
                        mesh.position.copy(
                            (value as Vector3).clone().multiplyScalar(gridSize),
                        );
                        addToCollidingElements(app, mesh);
                        break;
                }
                return nextState;
            });
        },
        [currentEditingIndex, app],
    );

    const addElement = useCallback(
        (type: ElementType) => {
            if (!app) {
                return;
            }
            const { mesh, properties } = createElement(app, type);
            setElements((prev) => {
                const nextState = [...prev];
                nextState.push({
                    type,
                    properties,
                    mesh,
                    name: `${type}_${nextState.length}`,
                });
                return nextState;
            });
            setCurrentEditingIndex(elements.length);
            addMeshToScene(app, type, mesh);
        },
        [app, elements, setCurrentEditingIndex],
    );

    const removeElement = useCallback(
        (index: number) => () => {
            if (!app) {
                return;
            }
            setElements((prev) => {
                const newState = [...prev];
                const deletedElement = newState.splice(index, 1);
                removeMeshFromScene(app, deletedElement[0].mesh);
                return newState;
            });
        },
        [app],
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
        [setCurrentEditingIndex],
    );

    const currentEditingElement = useMemo(() => {
        if (currentEditingIndex === undefined) {
            return null;
        }
        return elements[currentEditingIndex];
    }, [currentEditingIndex, elements]);

    // effect responsible to update the current attach transform control element in three.js accordingly with the react state
    useEffect(() => {
        if (!app) {
            return;
        }
        if (currentEditingElement) {
            app.attachTransformControls(currentEditingElement.mesh);
        } else {
            app.detachTransformControls();
        }
    }, [currentEditingElement, app]);

    // responsible to register and clear event listeners for the level editor
    useEffect(() => {
        if (!app) {
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

            const index = elements.findIndex((el) => {
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
    }, [app, elements, setCurrentEditingIndex]);

    // effect responsible to close the auth modal after successful login
    useEffect(() => {
        if (isAuthenticated && isModalOpen) {
            setIsModalOpen(false);
        }
    }, [isAuthenticated, isModalOpen, elements]);

    // effect responsible to mount the 3d scene only once and when the app is ready
    useEffect(() => {
        // if the app is not ready, don't do anything
        if (!app) {
            return;
        }
        // parse the initial level elements
        const elementList = parseLevelElements(app, initialLevel.data);
        const loadElementsToScene = (elementList: LevelElement[]) => {
            for (let i = 0; i < elementList.length; i++) {
                const { type, mesh } = elementList[i];
                addMeshToScene(app, type, mesh);
            }
        };
        // load elements to the scene
        loadElementsToScene(elementList);
        // set the state
        setElements(elementList);
    }, [app, initialLevel]);

    return {
        levelName,
        elements,
        hasErrorWithLevelName,
        currentEditingIndex,
        currentEditingElement,
        app,
        isModalOpen,
        isSaving,
        handleLevelNameChange,
        handleClickOnSave,
        updateElementName,
        handleControlObjectChange,
        handleUpdateElementProperty,
        addElement,
        removeElement,
        setApp,
        selectElement,
    };
}
