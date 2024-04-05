'use client';
// vendors
import React, { useCallback, useMemo } from 'react';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
// our libs
import { Side } from '@benjaminbours/composite-core';
// project
import InputsManager from '../../../Game/Player/InputsManager';
import { AppMode } from '../../../Game/App';
import { SceneContentPanel } from './SceneContentPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { TopBarLevelEditor } from './TopBarLevelEditor';
import type { getDictionary } from '../../../../getDictionary';
import { useController } from './useController';
import { ThumbnailModal } from './ThumbnailModal';
import { AuthModal } from '../../../03_organisms/AuthModal';

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
    } = useController(level_id, dictionary);

    // local refs
    const statsRef = useRef<Stats>();
    const inputsManager = useRef<InputsManager>(new InputsManager());

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

    const captureSnapshot = useCallback(() => {
        if (state.app) {
            state.app.onCaptureSnapshot = (image: string) => {
                setIsThumbnailSrc(image);
                setIsThumbnailModalOpen(true);
            };
            state.app.shouldCaptureSnapshot = true;
        }
    }, [state.app, setIsThumbnailModalOpen, setIsThumbnailSrc]);

    const resetPlayersPosition = useCallback(() => {
        if (state.app) {
            state.app.resetPlayersPosition();
        }
    }, [state.app]);

    const switchPlayer = useCallback(() => {
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
    }, [state.app]);

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
                onResetCamera={resetCamera}
                onToggleCollisionArea={toggleCollisionArea}
                onStartTestMode={toggleTestMode}
                onResetPlayersPosition={resetPlayersPosition}
                onSwitchPlayer={switchPlayer}
                levelName={state.levelName}
                levelStatus={state.levelStatus}
                onLevelNameChange={handleLevelNameChange}
                onSave={handleClickOnSave}
                onCaptureSnapshot={captureSnapshot}
                hasErrorWithLevelName={hasErrorWithLevelName}
                setIsModalOpen={setIsAuthModalOpen}
            />
            <div className="level-editor__top-right-container">
                <SceneContentPanel
                    elements={elements}
                    currentEditingIndex={state.currentEditingIndex}
                    onElementClick={selectElement}
                    onChangeName={updateElementName}
                    onElementDelete={removeElement}
                    onAddElement={addElement}
                    disabled={isSaving || state.app?.mode === AppMode.GAME}
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
