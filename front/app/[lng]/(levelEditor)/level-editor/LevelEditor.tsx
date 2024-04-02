'use client';
// vendors
import React, { useCallback } from 'react';
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
import { PartialLevel } from '../../../types';
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
        levelName,
        levelStatus,
        elements,
        hasErrorWithLevelName,
        currentEditingIndex,
        currentEditingElement,
        appRef,
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
    } = useController(level_id, dictionary);

    // local refs
    const statsRef = useRef<Stats>();
    const inputsManager = useRef<InputsManager>(new InputsManager());

    const resetCamera = useCallback(() => {
        if (appRef.current) {
            appRef.current.resetEditorCamera();
        }
    }, [appRef]);

    const toggleCollisionArea = useCallback(() => {
        if (appRef.current) {
            appRef.current.toggleCollisionArea();
        }
    }, [appRef]);

    const toggleTestMode = useCallback(() => {
        if (appRef.current) {
            appRef.current.setAppMode(
                appRef.current.mode === AppMode.GAME
                    ? AppMode.EDITOR
                    : AppMode.GAME,
            );
        }
    }, [appRef]);

    const captureSnapshot = useCallback(() => {
        if (appRef.current) {
            appRef.current.onCaptureSnapshot = (image: string) => {
                setIsThumbnailSrc(image);
                setIsThumbnailModalOpen(true);
            };
            appRef.current.shouldCaptureSnapshot = true;
        }
    }, [appRef, setIsThumbnailModalOpen, setIsThumbnailSrc]);

    const resetPlayersPosition = useCallback(() => {
        if (appRef.current) {
            appRef.current.resetPlayersPosition();
        }
    }, [appRef]);

    const switchPlayer = useCallback(() => {
        if (appRef.current) {
            const nextSide =
                appRef.current.mainPlayerSide === Side.SHADOW
                    ? Side.LIGHT
                    : Side.SHADOW;
            appRef.current.mainPlayerSide = nextSide;
            appRef.current.secondPlayerSide =
                nextSide === Side.SHADOW ? Side.LIGHT : Side.SHADOW;
            appRef.current.setGameCamera();
        }
    }, [appRef]);

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
                levelName={levelName}
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
                levelName={levelName}
                levelStatus={levelStatus}
                onLevelNameChange={handleLevelNameChange}
                onSave={handleClickOnSave}
                onCaptureSnapshot={captureSnapshot}
                hasErrorWithLevelName={hasErrorWithLevelName}
                setIsModalOpen={setIsAuthModalOpen}
            />
            <div className="level-editor__top-right-container">
                <SceneContentPanel
                    elements={elements}
                    currentEditingIndex={currentEditingIndex}
                    onElementClick={selectElement}
                    onChangeName={updateElementName}
                    onElementDelete={removeElement}
                    onAddElement={addElement}
                    disabled={isSaving}
                />
                {currentEditingElement && (
                    <PropertiesPanel
                        state={elements}
                        onUpdateProperty={handleUpdateElementProperty}
                        element={currentEditingElement}
                        disabled={isSaving}
                    />
                )}
            </div>
            <Game
                side={Side.SHADOW}
                levelEditorProps={{
                    onAppLoaded,
                    onTransformControlsObjectChange: handleControlObjectChange,
                }}
                tabIsHidden={false}
                stats={statsRef}
                inputsManager={inputsManager.current}
            />
        </main>
    );
};
