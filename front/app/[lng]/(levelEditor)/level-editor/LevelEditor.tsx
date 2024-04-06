'use client';
// vendors
import React, { useCallback, useMemo } from 'react';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
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

const Game = dynamic(() => import('../../../Game'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
    level_id: string;
}

export const LevelEditor: React.FC<Props> = ({ dictionary, level_id }) => {
    const {
        state,
        hasErrorWithLevelName,
        isAuthModalOpen,
        isThumbnailModalOpen,
        thumbnailSrc,
        isSaving,
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
        setIsThumbnailSrc,
        toggleTestMode,
        toggleShortcut,
    } = useController(level_id, dictionary);

    // local refs
    const statsRef = useRef<Stats>();
    const inputsManager = useRef<InputsManager>(new InputsManager());

    const resetCamera = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.currentTarget.blur();
            if (state.app) {
                state.app.resetEditorCamera();
            }
        },
        [state.app],
    );

    const toggleCollisionArea = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.currentTarget.blur();
            if (state.app) {
                state.app.toggleCollisionArea();
            }
        },
        [state.app],
    );

    const captureSnapshot = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.currentTarget.blur();
            if (state.app) {
                state.app.onCaptureSnapshot = (image: string) => {
                    setIsThumbnailSrc(image);
                    setIsThumbnailModalOpen(true);
                };
                state.app.shouldCaptureSnapshot = true;
            }
        },
        [state.app, setIsThumbnailModalOpen, setIsThumbnailSrc],
    );

    const resetPlayersPosition = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.currentTarget.blur();
            if (state.app) {
                state.app.resetPlayersPosition();
            }
        },
        [state.app],
    );

    const switchPlayer = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.currentTarget.blur();
            if (state.app) {
                const nextSide =
                    state.app.mainPlayerSide === Side.SHADOW
                        ? Side.LIGHT
                        : Side.SHADOW;
                state.app.mainPlayerSide = nextSide;
                state.app.secondPlayerSide =
                    nextSide === Side.SHADOW ? Side.LIGHT : Side.SHADOW;
                state.app.setGameCamera();
            }
        },
        [state.app],
    );

    const elements = useMemo(
        () => state.history[state.historyIndex] || [],
        [state.history, state.historyIndex],
    );

    return (
        <main className="level-editor">
            <AuthModal
                setIsModalOpen={setIsAuthModalOpen}
                isModalOpen={isAuthModalOpen}
                dictionary={dictionary}
                text="In order to save your level, I need to know to whom it is"
            />
            <ThumbnailModal
                setIsModalOpen={setIsThumbnailModalOpen}
                isModalOpen={isThumbnailModalOpen}
                dictionary={dictionary}
                thumbnailSrc={thumbnailSrc}
                levelName={state.levelName}
                onSave={handleSaveThumbnail}
            />
            <TopBarLevelEditor
                level_id={level_id}
                isSaving={isSaving}
                dictionary={dictionary}
                levelName={state.levelName}
                levelStatus={state.levelStatus}
                onLevelNameChange={handleLevelNameChange}
                onSave={handleClickOnSave}
                hasErrorWithLevelName={hasErrorWithLevelName}
                setIsModalOpen={setIsAuthModalOpen}
            />
            <div className="level-editor__top-left-container">
                <Paper>
                    <ButtonGroup>
                        <Button onClick={toggleTestMode} title="Play / Stop">
                            {state.appMode === AppMode.EDITOR ? (
                                <PlayCircleIcon />
                            ) : (
                                <StopCircleIcon />
                            )}
                        </Button>
                        <Button
                            disabled={state.appMode === AppMode.EDITOR}
                            onClick={switchPlayer}
                            title="Switch player"
                        >
                            <SwitchAccountIcon fontSize="small" />
                        </Button>
                        <Button
                            disabled={state.appMode === AppMode.EDITOR}
                            onClick={resetPlayersPosition}
                            title="Reset players position"
                        >
                            <RestartAltIcon fontSize="small" />
                        </Button>
                        <Button
                            disabled={state.appMode === AppMode.GAME}
                            onClick={resetCamera}
                            title="Reset camera"
                        >
                            <CameraIcon fontSize="small" />
                        </Button>
                        <Button
                            onClick={toggleCollisionArea}
                            title="Display collision area"
                        >
                            <VisibilityIcon fontSize="small" />
                        </Button>
                        <Button
                            onClick={captureSnapshot}
                            title="Capture snapshot"
                        >
                            <CameraEnhanceIcon fontSize="small" />
                        </Button>
                        <Button
                            onClick={toggleShortcut}
                            title="Display shortcuts"
                            color={
                                state.isShortcutVisible ? 'success' : 'primary'
                            }
                        >
                            <KeyboardIcon fontSize="small" />
                        </Button>
                    </ButtonGroup>
                </Paper>
                {state.isShortcutVisible && <ShortcutPanel />}
            </div>
            {state.app?.mode === AppMode.EDITOR && (
                <div className="level-editor__top-right-container">
                    <SceneContentPanel
                        elements={elements}
                        currentEditingIndex={state.currentEditingIndex}
                        onElementClick={selectElement}
                        onChangeName={updateElementName}
                        onElementDelete={removeElement}
                        onAddElement={addElement}
                        disabled={isSaving}
                    />
                    {state.currentEditingIndex !== undefined &&
                        elements[state.currentEditingIndex] && (
                            <PropertiesPanel
                                state={elements}
                                onUpdateProperty={handleUpdateElementProperty}
                                element={elements[state.currentEditingIndex]}
                                disabled={isSaving}
                            />
                        )}
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
};
