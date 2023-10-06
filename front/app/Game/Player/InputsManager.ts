import { Inputs } from '@benjaminbours/composite-core';

export default class InputsManager {
    public inputsActive: Inputs = {
        left: false,
        right: false,
        jump: false,
    };

    // TODO: Implements a destroy method
    public registerEventListeners = () => {
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));
    };

    public reset() {
        this.inputsActive.left = false;
        this.inputsActive.right = false;
        this.inputsActive.jump = false;
    }

    private keydownOptions = {
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
        const key = code as 'KeyA' | 'KeyD' | 'Space';
        if (this.keydownOptions[key]) {
            this.keydownOptions[key]();
        }
    }

    private handleKeyup(e: KeyboardEvent) {
        const { code } = e;
        const key = code as 'KeyA' | 'KeyD' | 'Space';
        if (this.keyupOptions[key]) {
            this.keyupOptions[key]();
        }
    }
}
