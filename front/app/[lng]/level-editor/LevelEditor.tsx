'use client';
// vendors
import React, { useCallback } from 'react';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
// our libs
import {
    GameState,
    MovableComponentState,
    Side,
} from '@benjaminbours/composite-core';
// project
import InputsManager from '../../Game/Player/InputsManager';
import { EmptyLevel } from '../../Game/levels/EmptyLevel';
import { AppMode } from '../../Game/App';
import { SceneContentPanel } from './SceneContentPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { TopBarLevelEditor } from './TopBarLevelEditor';
import type { getDictionary } from '../../../getDictionary';
import { AuthModal } from './AuthModal';
import { useController } from './useController';

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
    level_id: string;
    initialLevel: {
        name: string;
        data: any;
    };
}

export const LevelEditor: React.FC<Props> = ({
    dictionary,
    level_id,
    initialLevel,
}) => {
    const {
        levelName,
        elements,
        isMissingLevelName,
        currentEditingIndex,
        currentEditingElement,
        app,
        isModalOpen,
        isSaving,
        handleLevelNameChange,
        handleClickOnSave,
        handleControlObjectChange,
        handleUpdateElementProperty,
        updateElementName,
        addElement,
        removeElement,
        setApp,
        selectElement,
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

    const resetPlayersPosition = useCallback(() => {
        if (app) {
            app.resetPlayersPosition();
        }
    }, [app]);

    return (
        <main className="level-editor">
            <AuthModal isModalOpen={isModalOpen} dictionary={dictionary} />
            <TopBarLevelEditor
                isSaving={isSaving}
                dictionary={dictionary}
                onResetCamera={resetCamera}
                onToggleCollisionArea={toggleCollisionArea}
                onStartTestMode={toggleTestMode}
                onResetPlayersPosition={resetPlayersPosition}
                levelName={levelName}
                onLevelNameChange={handleLevelNameChange}
                onSave={handleClickOnSave}
                isMissingLevelName={isMissingLevelName}
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
                initialGameState={initialGameState}
                tabIsHidden={false}
                stats={statsRef}
                inputsManager={inputsManager.current}
                setApp={setApp}
                onTransformControlsObjectChange={handleControlObjectChange}
            />
        </main>
    );
};
