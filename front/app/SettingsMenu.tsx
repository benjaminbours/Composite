import React, { useCallback, useMemo, useState } from 'react';
import { Cross } from './Game/icons/Cross';
import InputsManager, {
    parseToKeyBindings,
    parseToUIKeyBindings,
} from './Game/Player/InputsManager';

interface Props {
    inputsManager: InputsManager;
    onClose: () => void;
}

export const SettingsMenu: React.FC<Props> = ({ inputsManager, onClose }) => {
    const [currentlyEditing, setCurrentlyEditing] = useState<
        [number, number] | undefined
    >(undefined);
    const uiKeyBindings = useMemo(
        () => parseToUIKeyBindings(inputsManager.keyBindings),
        [inputsManager.keyBindings],
    );

    const handleClickOnKey = useCallback(
        (movementIndex: number, keyIndex: number) => (clickEvent: any) => {
            setCurrentlyEditing([movementIndex, keyIndex]);

            const handleNewKey = (e: KeyboardEvent) => {
                const nextUIKeyBindings = [...uiKeyBindings];

                nextUIKeyBindings[movementIndex][1][keyIndex] = e.code;
                const nextKeyBindings = parseToKeyBindings(nextUIKeyBindings);
                inputsManager.updateKeyBindings(nextKeyBindings);

                setCurrentlyEditing(undefined);
                clickEvent.target.blur();
                window.removeEventListener('keydown', handleNewKey);
            };

            window.addEventListener('keydown', handleNewKey);
        },
        [],
    );

    return (
        <div className="settings-menu">
            <div className="settings-menu__header">
                <h2>Key bindings</h2>
                <button
                    className="settings-menu__close-button"
                    onClick={onClose}
                >
                    <Cross />
                </button>
            </div>

            <ul className="settings-menu__key-bindings-list key-bindings-list">
                {uiKeyBindings.map(([movement, keys], movementIndex) => {
                    return (
                        <li
                            key={movementIndex}
                            className="key-bindings-list__item"
                        >
                            <span className="key-bindings-list__movement">
                                {movement}
                            </span>

                            {keys.map((key, keyIndex) => {
                                const isEditing = (() => {
                                    if (!currentlyEditing) {
                                        return false;
                                    }

                                    return (
                                        currentlyEditing[0] === movementIndex &&
                                        currentlyEditing[1] === keyIndex
                                    );
                                })();

                                const keyText = (() => {
                                    if (isEditing) {
                                        return 'Press a key';
                                    }

                                    if (key.includes('Key')) {
                                        return key.replace('Key', '');
                                    } else if (key.includes('Arrow')) {
                                        return key.replace('Arrow', '');
                                    } else {
                                        return key;
                                    }
                                })();

                                return (
                                    <button
                                        key={keyIndex}
                                        className="key-bindings-list__key"
                                        onClick={handleClickOnKey(
                                            movementIndex,
                                            keyIndex,
                                        )}
                                    >
                                        {keyText}
                                    </button>
                                );
                            })}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
