'use client';
// vendors
import React, { useCallback, useEffect, useMemo } from 'react';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import * as STATS from 'stats.js';
// our libs
import { Side } from '@benjaminbours/composite-core';
// project
import InputsManager from '../../../Game/Player/InputsManager';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CameraIcon from '@mui/icons-material/Camera';
import VerifiedIcon from '@mui/icons-material/Verified';
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';
import { AppMode } from '../../../Game/App';
import { SceneContentPanel } from './SceneContentPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { TopBarLevelEditor } from './TopBarLevelEditor';
import type { getDictionary } from '../../../../getDictionary';
import { useController } from './useController';
import { ThumbnailModal } from './ThumbnailModal';
import { AuthModal } from '../../../03_organisms/AuthModal';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Paper from '@mui/material/Paper';
import { ShortcutPanel } from './ShortcutPanel';
import { ConfirmDialogContextProvider } from '../../../contexts';
import Chip from '@mui/material/Chip';
import { PlayersPanel } from './PlayersPanel';

const Game = dynamic(() => import('../../../Game'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
    level_id: string;
}

const withConfirmDialogProvider = (Component: React.FC<Props>) => {
    const Wrapper = (props: Props) => {
        return (
            <ConfirmDialogContextProvider>
                <Component {...props} />
            </ConfirmDialogContextProvider>
        );
    };
    return Wrapper;
};

export const LevelEditor: React.FC<Props> = withConfirmDialogProvider(
    ({ dictionary, level_id }) => {
        const {
            state,
            hasErrorWithLevelName,
            isAuthModalOpen,
            isThumbnailModalOpen,
            thumbnailSrc,
            isSaving,
            isAuthenticated,
            onAppLoaded,
            handleLevelNameChange,
            handleClickOnSave,
            handleSaveThumbnail,
            handleControlObjectChange,
            handleUpdateElementProperty,
            updateElementName,
            addElement,
            removeElement,
            selectElement,
            setIsAuthModalOpen,
            setIsThumbnailModalOpen,
            toggleTestMode,
            toggleShortcut,
            lockElement,
            captureSnapshot,
            handleClickOnPublish,
            resetPlayersPosition,
            wrapperBlurEvent,
            switchPlayer,
            resetCamera,
            toggleCollisionArea,
            handleUpdatePlayerStartPosition,
        } = useController(level_id, dictionary);

        // local refs
        const statsRef = useRef<Stats>();
        const inputsManager = useRef<InputsManager>(new InputsManager());

        useEffect(() => {
            if (
                process.env.NEXT_PUBLIC_STAGE === 'local' ||
                process.env.NEXT_PUBLIC_STAGE === 'development'
            ) {
                const stats = new STATS.default();
                stats.showPanel(1);
                document.body.appendChild(stats.dom);
                statsRef.current = stats;
            }
        }, []);

        const elements = useMemo(
            () => state.history[state.historyIndex] || [],
            [state.history, state.historyIndex],
        );

        return (
            <main className="level-editor">
                <AuthModal
                    setIsModalOpen={setIsAuthModalOpen}
                    isModalOpen={isAuthModalOpen}
                    dictionary={dictionary.common}
                    text="In order to save your level, I need to know to whom it is"
                />
                <ThumbnailModal
                    setIsModalOpen={setIsThumbnailModalOpen}
                    isModalOpen={isThumbnailModalOpen}
                    dictionary={dictionary.common}
                    thumbnailSrc={thumbnailSrc}
                    levelName={state.levelName}
                    onSave={handleSaveThumbnail}
                />
                <TopBarLevelEditor
                    level_id={level_id}
                    levelStatus={state.levelStatus}
                    isSaving={isSaving}
                    isPlaying={state.appMode === AppMode.GAME}
                    dictionary={dictionary.common}
                    levelName={state.levelName}
                    onLevelNameChange={handleLevelNameChange}
                    onSave={handleClickOnSave}
                    hasErrorWithLevelName={hasErrorWithLevelName}
                    setIsModalOpen={setIsAuthModalOpen}
                    handleClickOnPublish={handleClickOnPublish}
                />
                <div className="level-editor__top-left-container">
                    <Paper>
                        <ButtonGroup>
                            <Button
                                onClick={wrapperBlurEvent(toggleTestMode)}
                                title="Play / Stop"
                            >
                                {state.appMode === AppMode.EDITOR ? (
                                    <PlayCircleIcon />
                                ) : (
                                    <StopCircleIcon />
                                )}
                            </Button>
                            <Button
                                disabled={state.appMode === AppMode.EDITOR}
                                onClick={wrapperBlurEvent(switchPlayer)}
                                title="Switch player"
                            >
                                <SwitchAccountIcon fontSize="small" />
                            </Button>
                            <Button
                                onClick={wrapperBlurEvent(resetPlayersPosition)}
                                title="Reset players position"
                            >
                                <RestartAltIcon fontSize="small" />
                            </Button>
                            <Button
                                disabled={state.appMode === AppMode.GAME}
                                onClick={wrapperBlurEvent(resetCamera)}
                                title="Reset camera"
                            >
                                <CameraIcon fontSize="small" />
                            </Button>
                            <Button
                                onClick={wrapperBlurEvent(toggleCollisionArea)}
                                title="Display players axis"
                            >
                                <VisibilityIcon fontSize="small" />
                            </Button>
                            <Button
                                onClick={wrapperBlurEvent(captureSnapshot)}
                                title="Capture snapshot"
                                disabled={
                                    !isAuthenticated || level_id === 'new'
                                }
                            >
                                <CameraEnhanceIcon fontSize="small" />
                            </Button>
                            <Button
                                onClick={wrapperBlurEvent(toggleShortcut)}
                                title="Display shortcuts"
                                color={
                                    state.isShortcutVisible
                                        ? 'success'
                                        : 'primary'
                                }
                            >
                                <KeyboardIcon fontSize="small" />
                            </Button>
                        </ButtonGroup>
                    </Paper>
                    {state.isValidatingProcess && (
                        <Chip
                            className="level-editor__validation-chip"
                            icon={<VerifiedIcon />}
                            color="primary"
                            label="Validation process run"
                        />
                    )}
                    {state.isShortcutVisible && <ShortcutPanel />}
                </div>
                {state.app?.mode === AppMode.EDITOR && (
                    <div className="level-editor__top-right-container">
                        <div className="column">
                            {state.currentEditingIndex !== undefined &&
                                elements[state.currentEditingIndex] && (
                                    <PropertiesPanel
                                        state={elements}
                                        onUpdateProperty={
                                            handleUpdateElementProperty
                                        }
                                        element={
                                            elements[state.currentEditingIndex]
                                        }
                                        disabled={isSaving}
                                    />
                                )}
                        </div>
                        <div className="column">
                            <SceneContentPanel
                                elements={elements}
                                currentEditingIndex={state.currentEditingIndex}
                                onElementClick={selectElement}
                                onChangeName={updateElementName}
                                onElementDelete={removeElement}
                                onAddElement={addElement}
                                onElementLock={lockElement}
                                disabled={isSaving}
                            />
                            <PlayersPanel
                                lightStartPosition={state.lightStartPosition}
                                shadowStartPosition={state.shadowStartPosition}
                                onUpdatePlayerStartPosition={
                                    handleUpdatePlayerStartPosition
                                }
                            />
                        </div>
                    </div>
                )}
                {/* when initial level exist, it means assets are loaded */}
                {state.initialLevel && (
                    <Game
                        side={Side.SHADOW}
                        levelEditorProps={{
                            onAppLoaded,
                            onTransformControlsObjectChange:
                                handleControlObjectChange,
                        }}
                        tabIsHidden={false}
                        stats={statsRef}
                        inputsManager={inputsManager.current}
                    />
                )}
            </main>
        );
    },
);
