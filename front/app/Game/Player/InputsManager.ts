import {
    InputsSync,
    InputsClient,
    KeyBindings,
    ACTIONS,
    Action,
    UIKeyBindings,
} from '@benjaminbours/composite-core';

export function parseToUIKeyBindings(keyBindings: KeyBindings) {
    const uiKeyBindings = {} as { [key: string]: (string | undefined)[] };
    ACTIONS.forEach((action) => {
        const keys: (string | undefined)[] = Object.keys(keyBindings).filter(
            (key) => keyBindings[key] === action,
        );
        if (keys.length === 0) {
            keys.push(undefined, undefined);
        }
        if (keys.length === 1) {
            keys.push(undefined);
        }
        uiKeyBindings[action] = keys;
    });
    return Object.entries(uiKeyBindings) as UIKeyBindings;
}

export function parseToKeyBindings(uiKeyBindings: UIKeyBindings) {
    const keyBindings: KeyBindings = {};
    uiKeyBindings.forEach(([movement, keys]) => {
        keys.forEach((key) => {
            if (!key) {
                return;
            }
            keyBindings[key] = movement;
        });
    });
    return keyBindings;
}

// deepcode ignore HardcodedNonCryptoSecret: this is not a secret, it's a storage key for local storage
export const KEY_BINDINGS_LOCAL_STORAGE_KEY = 'composite-key-bindings';

export default class InputsManager {
    public keyBindings: KeyBindings;
    constructor(
        keyBindings: KeyBindings = {
            KeyA: 'left',
            KeyD: 'right',
            Space: 'jump',
            KeyW: 'top',
            KeyS: 'bottom',
            ArrowLeft: 'left',
            ArrowRight: 'right',
            ArrowUp: 'top',
            ArrowDown: 'bottom',
            KeyF: 'interact',
            Backspace: 'resetPosition',
        },
    ) {
        if (typeof window === 'undefined') {
            this.keyBindings = keyBindings;
            return;
        }

        const savedBindings = window.localStorage.getItem(
            KEY_BINDINGS_LOCAL_STORAGE_KEY,
        );

        if (savedBindings) {
            try {
                const savedBindingsParsed = JSON.parse(
                    savedBindings,
                ) as KeyBindings;
                this.keyBindings = savedBindingsParsed;
            } catch (error) {
                console.error('Failed to parse saved key bindings', error);
                this.keyBindings = keyBindings;
            }
        } else {
            this.keyBindings = keyBindings;
        }
    }

    public inputsActive: InputsSync & InputsClient = {
        left: false,
        right: false,
        jump: false,
        top: false,
        bottom: false,
        interact: false,
        resetPosition: false,
    };

    public updateKeyBindings(keyBindings: KeyBindings) {
        window.localStorage.setItem(
            KEY_BINDINGS_LOCAL_STORAGE_KEY,
            JSON.stringify(keyBindings),
        );
        this.keyBindings = keyBindings;
    }

    public registerEventListeners = () => {
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));
    };

    public destroyEventListeners = () => {
        window.removeEventListener('keydown', this.handleKeydown.bind(this));
        window.removeEventListener('keyup', this.handleKeyup.bind(this));
        this.reset();
    };

    public reset() {
        this.inputsActive.top = false;
        this.inputsActive.bottom = false;
        this.inputsActive.left = false;
        this.inputsActive.right = false;
        this.inputsActive.jump = false;
        this.inputsActive.interact = false;
    }

    private updateAction(action: Action, value: boolean) {
        this.inputsActive[action] = value;
    }

    private handleKeydown(e: KeyboardEvent) {
        const { code } = e;
        if (this.keyBindings[code]) {
            const movement = this.keyBindings[code];
            this.updateAction(movement, true);
        }
    }

    private handleKeyup(e: KeyboardEvent) {
        const { code } = e;
        if (this.keyBindings[code]) {
            const movement = this.keyBindings[code];
            this.updateAction(movement, false);
        }
    }
}
