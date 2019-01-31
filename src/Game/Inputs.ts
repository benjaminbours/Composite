export default class Inputs {
    public static leftIsPressed = false;
    public static leftIsActive = false;

    public static rightIsPressed = false;
    public static rightIsActive = false;

    public static jumpIsPressed = false;
    public static jumpIsActive = false;

    public static init() {
        window.addEventListener("keydown", this.handleKeydown.bind(this));
        window.addEventListener("keyup", this.handleKeyup.bind(this));
    }

    private static keydownOptions = {
        // left
        37() {
            if (!Inputs.leftIsActive) {
                Inputs.leftIsPressed = true;
                Inputs.leftIsActive = true;
            } else {
                Inputs.leftIsPressed = false;
            }
        },
        // right
        39() {
            if (!Inputs.rightIsActive) {
                Inputs.rightIsPressed = true;
                Inputs.rightIsActive = true;
            } else {
                Inputs.rightIsPressed = false;
            }
        },
        // space
        32() {
            if (!Inputs.jumpIsActive) {
                Inputs.jumpIsPressed = true;
                Inputs.jumpIsActive = true;
            } else {
                Inputs.jumpIsPressed = false;
            }
        },
    };

    private static keyupOptions = {
        37() {
            Inputs.leftIsActive = false;
        },
        39() {
            Inputs.rightIsActive = false;
        },
        32() {
            Inputs.jumpIsActive = false;
        },
    };

    private static handleKeydown(e: KeyboardEvent) {
        const { keyCode } = e;
        if (this.keydownOptions[keyCode]) {
            this.keydownOptions[keyCode]();
        }
    }

    private static handleKeyup(e: KeyboardEvent) {
        const { keyCode } = e;
        if (this.keyupOptions[keyCode]) {
            this.keyupOptions[keyCode]();
        }
    }
}
