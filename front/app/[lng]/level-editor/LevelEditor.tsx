'use client';
// vendors
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRef } from 'react';
import { Object3D } from 'three';
import dynamic from 'next/dynamic';
// our libs
import {
    GameState,
    MovableComponentState,
    Side,
} from '@benjaminbours/composite-core';
// project
import InputsManager from '../../Game/Player/InputsManager';
import { ElementType } from './types';
import { EmptyLevel } from '../../Game/levels/EmptyLevel';
import App, { AppMode } from '../../Game/App';
import { SceneContentPanel } from './SceneContentPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { TopBarLevelEditor } from './TopBarLevelEditor';
import { addMeshToScene, createElement, removeMeshFromScene } from './utils';
import { useStoreActions, useStoreState } from '../../hooks';
import type { getDictionary } from '../../../getDictionary';
import { AuthModal } from './AuthModal';
import { useSnackbar } from 'notistack';

const Game = dynamic(() => import('../../Game'), {
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

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
}

export const LevelEditor: React.FC<Props> = ({ dictionary }) => {
    // global states
    const isAuthenticated = useStoreState(
        (state) => state.user.isAuthenticated,
    );
    const currentEditingIndex = useStoreState(
        (state) => state.levelEditor.currentEditingIndex,
    );
    const levelName = useStoreState((state) => state.levelEditor.levelName);
    const elements = useStoreState((state) => state.levelEditor.elements);
    // global actions
    const setLevelName = useStoreActions(
        (store) => store.levelEditor.setLevelName,
    );
    const setCurrentEditingIndex = useStoreActions(
        (store) => store.levelEditor.setCurrentEditingIndex,
    );
    const updateElementTransformation = useStoreActions(
        (store) => store.levelEditor.updateElementTransformation,
    );
    const updateElementName = useStoreActions(
        (store) => store.levelEditor.updateElementName,
    );
    const updateElementProperty = useStoreActions(
        (store) => store.levelEditor.updateElementProperty,
    );
    const addElement = useStoreActions((store) => store.levelEditor.addElement);
    const removeElement = useStoreActions(
        (store) => store.levelEditor.removeElement,
    );
    // local states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMissingLevelName, setIsMissingLevelName] = useState(false);

    // local refs
    const { enqueueSnackbar } = useSnackbar();
    const appRef = useRef<App>();
    const statsRef = useRef<Stats>();
    const inputsManager = useRef<InputsManager>(new InputsManager());

    const currentEditingElement = useMemo(() => {
        if (currentEditingIndex === undefined) {
            return null;
        }
        return elements[currentEditingIndex];
    }, [currentEditingIndex, elements]);

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

    // responsible to register and clear event listeners for the level editor
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
    }, [elements, setCurrentEditingIndex]);

    const handleLevelNameChange = useCallback(
        (e: any) => {
            setLevelName(e.target.value);
            if (e.target.value) {
                setIsMissingLevelName(false);
            }
        },
        [setLevelName],
    );

    const handleControlObjectChange = useCallback(
        (object: Object3D) => {
            updateElementTransformation(object);
        },
        [updateElementTransformation],
    );

    const addElementToLevel = useCallback(
        (type: ElementType) => {
            if (!appRef.current) {
                return;
            }
            const { mesh, properties } = createElement(appRef.current, type);
            addElement({
                type,
                properties,
                mesh,
            });
            setCurrentEditingIndex(elements.length);
            addMeshToScene(appRef.current, type, mesh);
        },
        [elements, addElement, setCurrentEditingIndex],
    );

    const selectElement = useCallback(
        (index: number) => () => {
            setCurrentEditingIndex(index);
        },
        [setCurrentEditingIndex],
    );

    const deleteElement = useCallback(
        (index: number) => () => {
            if (!appRef.current) {
                return;
            }
            removeElement(index);
            removeMeshFromScene(appRef.current, elements, index);
        },
        [elements, removeElement],
    );

    const handleUpdateElementProperty = useCallback(
        (propertyKey: string, value: any) => {
            if (currentEditingIndex === undefined || !appRef.current) {
                return;
            }
            updateElementProperty([appRef.current, propertyKey, value]);
        },
        [currentEditingIndex, updateElementProperty],
    );

    const changeElementName = useCallback(
        (index: number) => (e: any) => {
            updateElementName([index, e.target.value]);
        },
        [updateElementName],
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

    const handleClickOnSave = useCallback(() => {
        if (!levelName) {
            enqueueSnackbar(
                dictionary.notification['error-missing-level-name'],
                {
                    variant: 'error',
                },
            );
            setIsMissingLevelName(true);
            return;
        }

        if (!isAuthenticated) {
            setIsModalOpen(true);
            return;
        }
    }, [enqueueSnackbar, dictionary, levelName, isAuthenticated]);

    return (
        <main className="level-editor">
            <AuthModal isModalOpen={isModalOpen} dictionary={dictionary} />
            <TopBarLevelEditor
                dictionary={dictionary}
                onResetCamera={resetCamera}
                onToggleCollisionArea={toggleCollisionArea}
                onStartTestMode={toggleTestMode}
                onResetPlayersPosition={resetPlayersPosition}
                levelName={levelName}
                onLevelNameChange={handleLevelNameChange}
                isAuthenticated={isAuthenticated}
                onSave={handleClickOnSave}
                isMissingLevelName={isMissingLevelName}
            />
            <div className="level-editor__top-right-container">
                <SceneContentPanel
                    elements={elements}
                    currentEditingIndex={currentEditingIndex}
                    onElementClick={selectElement}
                    onChangeName={changeElementName}
                    onElementDelete={deleteElement}
                    onAddElement={addElementToLevel}
                />
                {currentEditingElement && (
                    <PropertiesPanel
                        state={elements}
                        onUpdateProperty={handleUpdateElementProperty}
                        element={currentEditingElement}
                    />
                )}
            </div>
            <Game
                side={Side.SHADOW}
                initialGameState={initialGameState}
                tabIsHidden={false}
                stats={statsRef}
                inputsManager={inputsManager.current}
                levelEditorAppRef={appRef}
                onTransformControlsObjectChange={handleControlObjectChange}
            />
        </main>
    );
};
