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
    initialLevel: PartialLevel;
}

export const LevelEditor: React.FC<Props> = ({
    dictionary,
    level_id,
    initialLevel,
}) => {
    const {
        levelName,
        levelStatus,
        elements,
        hasErrorWithLevelName,
        currentEditingIndex,
        currentEditingElement,
        app,
        isAuthModalOpen,
        isThumbnailModalOpen,
        thumbnailSrc,
        isSaving,
        handleLevelNameChange,
        handleClickOnSave,
        handleSaveThumbnail,
        handleControlObjectChange,
        handleUpdateElementProperty,
        updateElementName,
        addElement,
        removeElement,
        setApp,
        selectElement,
        setIsAuthModalOpen,
        setIsThumbnailModalOpen,
        setIsThumbnailSrc,
    } = useController(level_id, initialLevel, dictionary);

    // local refs
    const statsRef = useRef<Stats>();
    const inputsManager = useRef<InputsManager>(new InputsManager());

    const resetCamera = useCallback(() => {
        if (app) {
            app.resetEditorCamera();
        }
    }, [app]);

    const toggleCollisionArea = useCallback(() => {
        if (app) {
            app.toggleCollisionArea();
        }
    }, [app]);

    const toggleTestMode = useCallback(() => {
        if (app) {
            app.setAppMode(
                app.mode === AppMode.GAME ? AppMode.EDITOR : AppMode.GAME,
            );
        }
    }, [app]);

    const captureSnapshot = useCallback(() => {
        if (app) {
            app.onCaptureSnapshot = (image: string) => {
                setIsThumbnailSrc(image);
                setIsThumbnailModalOpen(true);
            };
            app.shouldCaptureSnapshot = true;
        }
    }, [app, setIsThumbnailModalOpen, setIsThumbnailSrc]);

    const resetPlayersPosition = useCallback(() => {
        if (app) {
            app.resetPlayersPosition();
        }
    }, [app]);

    const switchPlayer = useCallback(() => {
        if (app) {
            const nextSide =
                app.mainPlayerSide === Side.SHADOW ? Side.LIGHT : Side.SHADOW;
            app.mainPlayerSide = nextSide;
            app.secondPlayerSide =
                nextSide === Side.SHADOW ? Side.LIGHT : Side.SHADOW;
            app.setGameCamera();
        }
    }, [app]);

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
                    setApp: setApp,
                    onTransformControlsObjectChange: handleControlObjectChange,
                }}
                tabIsHidden={false}
                stats={statsRef}
                inputsManager={inputsManager.current}
            />
        </main>
    );
};
