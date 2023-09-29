import { Inputs } from '@benjaminbours/composite-core';

export default class InputsManager {
    public inputs: Inputs = {
        left: false,
        right: false,
        jump: false,
    };

    constructor() {
        // TODO: Implements a destroy method
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));
    }

    public reset() {
        this.inputs.left = false;
        this.inputs.right = false;
        this.inputs.jump = false;
    }

    private keydownOptions = {
        // left
        KeyA: () => {
            this.inputs.left = true;
        },
        // right
        KeyD: () => {
            this.inputs.right = true;
        },
        // space
        Space: () => {
            this.inputs.jump = true;
        },
    };

    private keyupOptions = {
        KeyA: () => {
            this.inputs.left = false;
        },
        KeyD: () => {
            this.inputs.right = false;
        },
        Space: () => {
            this.inputs.jump = false;
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
