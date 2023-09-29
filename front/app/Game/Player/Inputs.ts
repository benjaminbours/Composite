export default class InputsManager {
    public leftIsActive = false;
    public rightIsActive = false;
    public jumpIsActive = false;

    constructor() {
        // TODO: Implements a destroy method
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));
    }

    public reset() {
        this.leftIsActive = false;
        this.rightIsActive = false;
        this.jumpIsActive = false;
    }

    private keydownOptions = {
        // left
        KeyA: () => {
            this.leftIsActive = true;
        },
        // right
        KeyD: () => {
            this.rightIsActive = true;
        },
        // space
        Space: () => {
            this.jumpIsActive = true;
        },
    };

    private keyupOptions = {
        KeyA: () => {
            this.leftIsActive = false;
        },
        KeyD: () => {
            this.rightIsActive = false;
        },
        Space: () => {
            this.jumpIsActive = false;
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
