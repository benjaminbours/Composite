export default class Inputs {
    public static leftIsPressed = false;
    public static leftIsActive = false;

    public static rightIsPressed = false;
    public static rightIsActive = false;

    public static jumpIsPressed = false;
    public static jumpIsActive = false;

    public static init() {
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));
    }

    public static reset() {
        this.leftIsPressed = false;
        this.leftIsActive = false;
        this.rightIsPressed = false;
        this.rightIsActive = false;
        this.jumpIsPressed = false;
        this.jumpIsActive = false;
    }

    private static keydownOptions = {
        // left
        KeyA() {
            if (!Inputs.leftIsActive) {
                Inputs.leftIsPressed = true;
                Inputs.leftIsActive = true;
            } else {
                Inputs.leftIsPressed = false;
            }
        },
        // right
        KeyD() {
            if (!Inputs.rightIsActive) {
                Inputs.rightIsPressed = true;
                Inputs.rightIsActive = true;
            } else {
                Inputs.rightIsPressed = false;
            }
        },
        // space
        Space() {
            if (!Inputs.jumpIsActive) {
                Inputs.jumpIsPressed = true;
                Inputs.jumpIsActive = true;
            } else {
                Inputs.jumpIsPressed = false;
            }
        },
    };

    private static keyupOptions = {
        KeyA() {
            Inputs.leftIsActive = false;
        },
        KeyD() {
            Inputs.rightIsActive = false;
        },
        Space() {
            Inputs.jumpIsActive = false;
        },
    };

    private static handleKeydown(e: KeyboardEvent) {
        const { code } = e;
        const key = code as 'KeyA' | 'KeyD' | 'Space';
        if (this.keydownOptions[key]) {
            this.keydownOptions[key]();
        }
    }

    private static handleKeyup(e: KeyboardEvent) {
        const { code } = e;
        const key = code as 'KeyA' | 'KeyD' | 'Space';
        if (this.keyupOptions[key]) {
            this.keyupOptions[key]();
        }
    }
}
