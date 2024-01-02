import {
    Inputs,
    KeyBindings,
    MOVEMENTS,
    Movement,
    UIKeyBindings,
} from '@benjaminbours/composite-core';

export function parseToUIKeyBindings(keyBindings: KeyBindings) {
    const uiKeyBindings = {} as { [key: string]: string[] };
    MOVEMENTS.forEach((movement) => {
        const keys = Object.keys(keyBindings).filter(
            (key) => keyBindings[key] === movement,
        );
        uiKeyBindings[movement] = keys;
    });
    return Object.entries(uiKeyBindings) as UIKeyBindings;
}

export function parseToKeyBindings(uiKeyBindings: UIKeyBindings) {
    const keyBindings: KeyBindings = {};
    uiKeyBindings.forEach(([movement, keys]) => {
        keys.forEach((key) => {
            keyBindings[key] = movement;
        });
    });
    return keyBindings;
}

export default class InputsManager {
    constructor(
        public keyBindings: KeyBindings = {
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
    ) {}

    public inputsActive: Inputs = {
        left: false,
        right: false,
        jump: false,
        top: false,
        bottom: false,
    };

    public updateKeyBindings(keyBindings: KeyBindings) {
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
