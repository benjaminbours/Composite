import { useCallback, useEffect, useReducer, useState } from 'react';
import { useSnackbar } from 'notistack';
import { getDictionary } from '../../../../getDictionary';
import { Euler, Object3D, Vector3 } from 'three';
import * as uuid from 'uuid';
import {
    Side,
    gridSize,
    radiansToDegrees,
    ElementType,
} from '@benjaminbours/composite-core';
import {
    LevelStatusEnum,
    type Level,
} from '@benjaminbours/composite-api-client';
import App, { AppMode } from '../../../Game/App';
import { servicesContainer } from '../../../core/frameworks';
import { ApiClient } from '../../../core/services';
import { notFound, useRouter } from 'next/navigation';
import { Route } from '../../../types';
import { useStoreState } from '../../../hooks';
import { generateErrorNotification } from '../../../utils/errors/generateErrorNotification';
import { startLoadingAssets } from '../../../Game/assetsLoader';
import { useConfirmDialogContext } from '../../../contexts';
import { ActionType, defaultLevel, initialState, reducer } from './reducer';

export function useController(
    level_id: string,
    dictionary: Awaited<ReturnType<typeof getDictionary>>,
) {
    const isAuthenticated = useStoreState(
        (state) => state.user.isAuthenticated,
    );
    const { enqueueSnackbar } = useSnackbar();
    const confirmDialogContext = useConfirmDialogContext();
    const router = useRouter();

    const [state, dispatch] = useReducer(reducer, initialState);

    const onAppLoaded = useCallback((app: App) => {
        dispatch({ type: ActionType.LOAD_APP, payload: app });
    }, []);

    const [isSaving, setIsSaving] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
    const [thumbnailSrc, setIsThumbnailSrc] = useState<string | undefined>(
        undefined,
    );
    const [hasErrorWithLevelName, setHasErrorWithLevelName] = useState(false);

    const handleLevelNameChange = useCallback((e: any) => {
        dispatch({
            type: ActionType.UPDATE_LEVEL_NAME,
            payload: e.target.value,
        });
        if (e.target.value) {
            setHasErrorWithLevelName(false);
        }
    }, []);

    const handleClickOnSave = useCallback(
        async (isFork?: boolean, status?: LevelStatusEnum) => {
            if (!state.levelName) {
                enqueueSnackbar(
                    dictionary.common.notification['error-missing-level-name'],
                    {
                        variant: 'error',
                    },
                );
                setHasErrorWithLevelName(true);
                return;
            }

            if (!isAuthenticated) {
                setIsAuthModalOpen(true);
                return;
            }

            const apiClient = servicesContainer.get(ApiClient);
            const onSuccess = (level: Level) => {
                if (level_id === 'new' || isFork) {
                    router.push(Route.LEVEL_EDITOR(level.id));
                }
                dispatch({
                    type: ActionType.LOAD_LEVEL,
                    payload: level,
                });
                const successMessage = (() => {
                    if (status === LevelStatusEnum.Published) {
                        return dictionary.common.notification[
                            'success-level-published'
                        ];
                    }

                    if (status === LevelStatusEnum.Draft) {
                        return dictionary.common.notification[
                            'success-level-unpublished'
                        ];
                    }
                    return dictionary.common.notification[
                        'success-level-saved'
                    ];
                })();
                enqueueSnackbar(successMessage, {
                    variant: 'success',
                });
            };
            const onCatch = async (error: any) => {
                console.error(error);
                const errorData = await error.response.json();
                let message;
                if (errorData.message === 'Unique constraint violation') {
                    message =
                        dictionary.common.notification[
                            'error-level-name-taken'
                        ];
                    setHasErrorWithLevelName(true);
                } else if (errorData.message.includes('Value is too long')) {
                    message =
                        dictionary.common.notification[
                            'error-level-name-too-long'
                        ];
                    setHasErrorWithLevelName(true);
                } else {
                    message = generateErrorNotification(
                        errorData,
                        dictionary.common,
                    );
                }
                enqueueSnackbar(message, {
                    variant: 'error',
                });
            };
            const onFinally = () => {
                setIsSaving(false);
            };

            setIsSaving(true);
            const elements = state.history[state.historyIndex] || [];
            const elementsToSend = elements.map((el) => ({
                type: el.type,
                properties: el.properties,
                name: el.name,
                isLocked: el.isLocked,
            }));
            if (level_id === 'new' || isFork) {
                return apiClient.defaultApi
                    .levelsControllerCreate({
                        createLevelDto: {
                            name: isFork
                                ? `${state.levelName}_forked`
                                : state.levelName,
                            data: elementsToSend,
                            lightStartPosition: [
                                state.lightStartPosition.x,
                                state.lightStartPosition.y,
                            ],
                            shadowStartPosition: [
                                state.shadowStartPosition.x,
                                state.shadowStartPosition.y,
                            ],
                        },
                    })
                    .then(onSuccess)
                    .catch(onCatch)
                    .finally(onFinally);
            } else {
                return apiClient.defaultApi
                    .levelsControllerUpdate({
                        id: level_id,
                        updateLevelDto: {
                            name: state.levelName,
                            data: elementsToSend,
                            status,
                            lightStartPosition: [
                                state.lightStartPosition.x,
                                state.lightStartPosition.y,
                            ],
                            shadowStartPosition: [
                                state.shadowStartPosition.x,
                                state.shadowStartPosition.y,
                            ],
                        },
                    })
                    .then(onSuccess)
                    .catch(onCatch)
                    .finally(onFinally);
            }
        },
        [enqueueSnackbar, dictionary, state, router, level_id, isAuthenticated],
    );

    const captureSnapshot = useCallback(() => {
        if (state.app) {
            state.app.onCaptureSnapshot = (image: string) => {
                setIsThumbnailSrc(image);
                setIsThumbnailModalOpen(true);
            };
            state.app.shouldCaptureSnapshot = true;
        }
    }, [state.app]);

    const handleSaveThumbnail = useCallback(() => {
        if (!thumbnailSrc || level_id === 'new') {
            return;
        }
        setIsThumbnailModalOpen(false);

        function base64ToBlob(base64: string, mimeType = '') {
            // Decode base64 string
            const byteCharacters = atob(base64);

            // Create byte array
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);

            // Create blob
            const blob = new Blob([byteArray], { type: mimeType });

            return blob;
        }

        const apiClient = servicesContainer.get(ApiClient);
        const base64Data = thumbnailSrc.replace(
            /^data:image\/(png|jpg|jpeg);base64,/,
            '',
        );
        const blob = base64ToBlob(base64Data, 'image/png');

        apiClient.defaultApi
            .levelsControllerUploadThumbnail({
                id: level_id,
                file: blob,
            })
            .then((res) => {
                console.log(res);
                enqueueSnackbar(
                    dictionary.common.notification[
                        'success-level-thumbnail-uploaded'
                    ],
                    {
                        variant: 'success',
                    },
                );
            })
            .catch((err) => {
                console.log(err);
                enqueueSnackbar(
                    dictionary.common.notification[
                        'error-level-thumbnail-upload'
                    ],
                    {
                        variant: 'error',
                    },
                );
            });
    }, [thumbnailSrc, enqueueSnackbar, dictionary, level_id]);

    const updateElementName = useCallback(
        (index: number) => (e: any) => {
            dispatch({
                type: ActionType.UPDATE_ELEMENT_NAME,
                payload: { index, name: e.target.value },
            });
        },
        [],
    );

    const handleControlObjectChange = useCallback((object: Object3D) => {
        // update element transformations
        const rotationX = radiansToDegrees(object.rotation.x);
        const rotationY = radiansToDegrees(object.rotation.y);
        const rotationZ = radiansToDegrees(object.rotation.z);
        dispatch({
            type: ActionType.UPDATE_ELEMENT_PROPERTY,
            payload: {
                propertyKey: 'transform',
                value: {
                    position: object.position.clone().divideScalar(gridSize),
                    rotation: new Euler(rotationX, rotationY, rotationZ),
                },
            },
        });
    }, []);

    const handleUpdateElementProperty = useCallback(
        (propertyKey: string, value: any) => {
            dispatch({
                type: ActionType.UPDATE_ELEMENT_PROPERTY,
                payload: { propertyKey, value, uuid: uuid.v4() },
            });
        },
        [],
    );

    const addElement = useCallback((type: ElementType) => {
        dispatch({
            type: ActionType.ADD_ELEMENT,
            payload: { type, uuid: uuid.v4() },
        });
    }, []);

    const removeElement = useCallback(
        (index: number) => () => {
            dispatch({ type: ActionType.REMOVE_ELEMENT, payload: index });
        },
        [],
    );

    const duplicateElement = useCallback(
        (index: number) => () => {
            dispatch({
                type: ActionType.DUPLICATE_ELEMENT,
                payload: { index, uuid: uuid.v4() },
            });
        },
        [],
    );

    const moveElement = useCallback((dragIndex: number, hoverIndex: number) => {
        dispatch({
            type: ActionType.MOVE_ELEMENT,
            payload: { dragIndex, hoverIndex },
        });
    }, []);

    const selectElement = useCallback(
        (index: number) => () => {
            dispatch({
                type: ActionType.SELECT_ELEMENT,
                payload: index,
                canUnselect: true,
            });
        },
        [],
    );

    const lockElement = useCallback(
        (index: number) => () => {
            dispatch({
                type: ActionType.LOCK_ELEMENT,
                payload: index,
            });
        },
        [],
    );

    const wrapperBlurEvent = useCallback(
        (callback: () => void) =>
            (event: React.MouseEvent<HTMLButtonElement>) => {
                event.currentTarget.blur();
                callback();
            },
        [],
    );

    const resetPlayersPosition = useCallback(() => {
        if (state.app) {
            const players = [
                state.shadowStartPosition.clone(),
                state.lightStartPosition.clone(),
            ];

            players.forEach((player) => {
                player.multiplyScalar(gridSize);
                if (player.y < 20) {
                    player.y = 20;
                }
            });
            state.app!.setPlayersPosition({
                shadow: players[0],
                light: players[1],
            });
        }
    }, [state.app, state.shadowStartPosition, state.lightStartPosition]);

    const onValidationComplete = useCallback(() => {
        // TODO: Duplicate code from toggleTestMode function. Address it
        if (state.app) {
            state.app.setAppMode(AppMode.EDITOR);
            state.app.onLevelEditorValidation = undefined;
            dispatch({
                type: ActionType.SET_APP_MODE,
                payload: { mode: state.app.mode },
            });
        }
        confirmDialogContext
            .showConfirmation({
                title: dictionary['after-publish-confirmation'].title,
                message: (
                    <>
                        <p>
                            <b>
                                {
                                    dictionary['after-publish-confirmation']
                                        .subtitle
                                }
                            </b>
                        </p>
                        <p>
                            {dictionary[
                                'after-publish-confirmation'
                            ].description.replace(
                                '{{levelName}}',
                                state.levelName,
                            )}
                        </p>
                    </>
                ),
                cancelText: dictionary.common['cancel-text'],
                confirmText: dictionary['after-publish-confirmation'].confirm,
            })
            .then((hasConfirmed) => {
                if (!hasConfirmed) {
                    return;
                }
                handleClickOnSave(false, LevelStatusEnum.Published).then(() => {
                    confirmDialogContext.closeConfirmation();
                });
            });
    }, [
        state.levelName,
        dictionary,
        confirmDialogContext,
        handleClickOnSave,
        state.app,
    ]);

    const toggleTestMode = useCallback(
        (isValidationProcess?: boolean) => {
            if (state.app) {
                state.app.setAppMode(
                    state.app.mode === AppMode.GAME
                        ? AppMode.EDITOR
                        : AppMode.GAME,
                );
                state.app.transformControls?.detach();
                state.app.onLevelEditorValidation = isValidationProcess
                    ? onValidationComplete
                    : undefined;
                dispatch({
                    type: ActionType.SET_APP_MODE,
                    payload: { mode: state.app.mode, isValidationProcess },
                });
            }
        },
        [state.app, onValidationComplete],
    );

    const toggleShortcut = useCallback(() => {
        dispatch({
            type: ActionType.TOGGLE_SHORTCUT,
        });
    }, []);

    const resetCamera = useCallback(() => {
        if (state.app) {
            state.app.resetEditorCamera();
        }
    }, [state.app]);

    const toggleCollisionArea = useCallback(() => {
        if (state.app) {
            state.app.toggleCollisionArea();
        }
    }, [state.app]);

    const switchPlayer = useCallback(() => {
        if (state.app) {
            const nextSide =
                state.app.mainPlayerSide === Side.SHADOW
                    ? Side.LIGHT
                    : Side.SHADOW;
            state.app.mainPlayerSide = nextSide;
            state.app.gameStateManager.mainPlayerSide = nextSide;
            state.app.camera.unfocus();
            state.app.secondPlayerSide =
                nextSide === Side.SHADOW ? Side.LIGHT : Side.SHADOW;
            state.app.setGameCamera();
        }
    }, [state.app]);

    const handleUpdatePlayerStartPosition = useCallback(
        (side: 'light' | 'shadow', position: Vector3) => {
            dispatch({
                type: ActionType.UPDATE_START_POSITION,
                payload: { side, position },
            });
        },
        [],
    );

    const handleClickOnPublish = useCallback(() => {
        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
            return;
        }

        confirmDialogContext
            .showConfirmation({
                title: dictionary['before-publish-confirmation'].title,
                message: (
                    <p>
                        {dictionary['before-publish-confirmation'].description}
                    </p>
                ),
                cancelText: dictionary.common['cancel-text'],
                confirmText: dictionary['before-publish-confirmation'].confirm,
            })
            .then((hasConfirmed) => {
                if (!hasConfirmed) {
                    return;
                }

                // TODO: Enter validation mode here
                resetPlayersPosition();
                toggleTestMode(true);
                confirmDialogContext.closeConfirmation();
            });
    }, [
        isAuthenticated,
        confirmDialogContext,
        dictionary,
        resetPlayersPosition,
        toggleTestMode,
    ]);

    // register all key down events
    useEffect(() => {
        if (!state.app) {
            return;
        }
        const app = state.app;
        const elements = state.history[state.historyIndex] || [];
        const updateTransformControlsAxis = () => {
            // for bounce, only allow rotation on Z (Y)
            if (
                state.currentEditingIndex !== undefined &&
                elements[state.currentEditingIndex] &&
                elements[state.currentEditingIndex].type ===
                    ElementType.BOUNCE &&
                app.transformControls?.mode === 'rotate'
            ) {
                app.transformControls!.showX = false;
                app.transformControls!.showY = false;
            } else {
                app.transformControls!.showX = true;
                app.transformControls!.showY = true;
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            // Listen for Ctrl + Z and Ctrl + Shift + Z
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();
                // Don't undo past the initial state
                if (!event.shiftKey && state.historyIndex > 0) {
                    dispatch({ type: ActionType.UNDO });
                }

                // Don't redo past the latest state
                else if (
                    event.shiftKey &&
                    state.historyIndex < state.history.length - 1
                ) {
                    dispatch({ type: ActionType.REDO });
                }
            } else if (event.code === 'KeyT') {
                app.transformControls?.setMode('translate');
                updateTransformControlsAxis();
            } else if (event.code === 'KeyR') {
                app.transformControls?.setMode('rotate');
                updateTransformControlsAxis();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        state.history,
        state.historyIndex,
        state.app,
        state.currentEditingIndex,
    ]);

    // responsible to register and clear mouse event listeners
    useEffect(() => {
        if (!state.app) {
            return;
        }
        const app = state.app;
        const elements = state.history[state.historyIndex] || [];
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
            // TODO: Make players selectable by clicking on them
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
                return (
                    // avoid searching in locked element
                    !el.isLocked &&
                    Boolean(findItemInParents(app.mouseSelectedObject, el.mesh))
                );
            });

            if (index !== -1) {
                dispatch({ type: ActionType.SELECT_ELEMENT, payload: index });
            }
        };

        app.canvasDom.addEventListener('mousemove', onMouseMove);
        app.canvasDom.addEventListener('mousedown', onMouseDown);
        return () => {
            app.canvasDom.removeEventListener('mousemove', onMouseMove);
            app.canvasDom.removeEventListener('mousedown', onMouseDown);
        };
    }, [state]);

    // effect responsible to close the auth modal after successful login
    useEffect(() => {
        if (isAuthenticated && isAuthModalOpen) {
            setIsAuthModalOpen(false);
        }
    }, [isAuthenticated, isAuthModalOpen]);

    // effect responsible to load the level data from the api
    useEffect(() => {
        const apiClient = servicesContainer.get(ApiClient);
        // load level
        Promise.all([
            startLoadingAssets(),
            level_id === 'new'
                ? undefined
                : apiClient.defaultApi.levelsControllerFindOne({
                      id: level_id,
                  }),
        ])
            .then(([_, level]) => {
                console.log('level loaded', level);
                dispatch({
                    type: ActionType.SAVE_INITIAL_LEVEL,
                    payload: level || defaultLevel,
                });
            })
            .catch((error) => {
                console.error(error);
                dispatch({ type: ActionType.LEVEL_IS_NOT_FOUND });
            });
    }, [level_id]);

    // effect loading the scene when assets and level data are ready
    // TODO: Can be remove and do in the reducer potentially
    useEffect(() => {
        // if the app is not ready, don't do anything
        if (!state.app || !state.initialLevel || state.isInitialLoadDone) {
            return;
        }

        dispatch({
            type: ActionType.LOAD_LEVEL,
            payload: state.initialLevel,
        });
    }, [state]);

    if (state.isNotFound) {
        notFound();
    }

    return {
        state,
        hasErrorWithLevelName,
        isAuthModalOpen,
        isThumbnailModalOpen,
        thumbnailSrc,
        isSaving,
        isAuthenticated,
        handleLevelNameChange,
        handleClickOnSave,
        handleSaveThumbnail,
        updateElementName,
        handleControlObjectChange,
        handleUpdateElementProperty,
        addElement,
        removeElement,
        duplicateElement,
        onAppLoaded,
        selectElement,
        setIsAuthModalOpen,
        setIsThumbnailModalOpen,
        setIsThumbnailSrc,
        toggleTestMode,
        toggleShortcut,
        lockElement,
        moveElement,
        captureSnapshot,
        handleClickOnPublish,
        resetPlayersPosition,
        wrapperBlurEvent,
        switchPlayer,
        toggleCollisionArea,
        resetCamera,
        handleUpdatePlayerStartPosition,
    };
}
