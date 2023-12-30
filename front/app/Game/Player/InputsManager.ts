import { Inputs } from '@benjaminbours/composite-core';

export default class InputsManager {
    public inputsActive: Inputs = {
        left: false,
        right: false,
        jump: false,
        top: false,
        bottom: false,
    };

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
        this.inputsActive.left = false;
        this.inputsActive.right = false;
        this.inputsActive.jump = false;
    }

    private keydownOptions = {
        // top
        KeyW: () => {
            this.inputsActive.top = true;
        },
        // bottom
        KeyS: () => {
            this.inputsActive.bottom = true;
        },
        // left
        KeyA: () => {
            this.inputsActive.left = true;
        },
        // right
        KeyD: () => {
            this.inputsActive.right = true;
        },
        // space
        Space: () => {
            this.inputsActive.jump = true;
        },
    };

    private keyupOptions = {
        // top
        KeyW: () => {
            this.inputsActive.top = false;
        },
        // bottom
        KeyS: () => {
            this.inputsActive.bottom = false;
        },
        KeyA: () => {
            this.inputsActive.left = false;
        },
        KeyD: () => {
            this.inputsActive.right = false;
        },
        Space: () => {
            this.inputsActive.jump = false;
        },
    };

    private handleKeydown(e: KeyboardEvent) {
        const { code } = e;
        const key = code as 'KeyA' | 'KeyD' | 'Space' | 'KeyW' | 'KeyS';
        if (this.keydownOptions[key]) {
            this.keydownOptions[key]();
        }
    }

    private handleKeyup(e: KeyboardEvent) {
        const { code } = e;
        const key = code as 'KeyA' | 'KeyD' | 'Space' | 'KeyW' | 'KeyS';
        if (this.keyupOptions[key]) {
            this.keyupOptions[key]();
        }
    }
}
