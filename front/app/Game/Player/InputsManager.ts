import {
    Inputs,
    KeyBindings,
    MOVEMENTS,
    Movement,
    UIKeyBindings,
} from '@benjaminbours/composite-core';

export function parseToUIKeyBindings(keyBindings: KeyBindings) {
    const uiKeyBindings = {} as { [key: string]: (string | undefined)[] };
    MOVEMENTS.forEach((movement) => {
        const keys: (string | undefined)[] = Object.keys(keyBindings).filter(
            (key) => keyBindings[key] === movement,
        );
        if (keys.length === 0) {
            keys.push(undefined, undefined);
        }
        if (keys.length === 1) {
            keys.push(undefined);
        }
        uiKeyBindings[movement] = keys;
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

    public inputsActive: Inputs = {
        left: false,
        right: false,
        jump: false,
        top: false,
        bottom: false,
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
    }

    private updateMovement(movement: Movement, value: boolean) {
        this.inputsActive[movement] = value;
    }

    private handleKeydown(e: KeyboardEvent) {
        const { code } = e;
        if (this.keyBindings[code]) {
            const movement = this.keyBindings[code];
            this.updateMovement(movement, true);
        }
    }

    private handleKeyup(e: KeyboardEvent) {
        const { code } = e;
        if (this.keyBindings[code]) {
            const movement = this.keyBindings[code];
            this.updateMovement(movement, false);
        }
    }
}
