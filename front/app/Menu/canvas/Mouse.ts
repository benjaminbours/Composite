export default class Mouse {
    public static x: number = 0;
    public static y: number = 0;
    public static lastX: number = 0;
    public static lastY: number = 0;
    public static directionX: number = 0;
    public static directionY: number = 0;
    public static speedX: number = 0;
    public static speedY: number = 0;
    public static timeoutId: number | undefined = undefined;

    public static init() {
        document.addEventListener('mousemove', Mouse.handleMouseMove);
        Mouse.detectMouseSpeed();
    }

    public static destroy() {
        document.removeEventListener('mousemove', Mouse.handleMouseMove);
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    private static handleMouseMove(e: MouseEvent) {
        Mouse.detectMouseDirection(e);
    }

    private static detectMouseSpeed() {
        Mouse.speedX = Mouse.x - Mouse.lastX;
        Mouse.speedY = Mouse.y - Mouse.lastY;
        Mouse.lastX = Mouse.x;
        Mouse.lastY = Mouse.y;
        this.timeoutId = setTimeout(
            Mouse.detectMouseSpeed,
            50,
        ) as unknown as number;
    }

    private static detectMouseDirection(e: MouseEvent) {
        if (Mouse.x < e.x) {
            Mouse.directionX = 1;
        } else if (Mouse.x > e.x) {
            Mouse.directionX = -1;
        } else {
            Mouse.directionX = 0;
        }

        if (Mouse.y < e.y) {
            Mouse.directionY = 1;
        } else if (Mouse.y > e.y) {
            Mouse.directionY = -1;
        } else {
            Mouse.directionY = 0;
        }

        Mouse.x = e.x;
        Mouse.y = e.y;
    }
}
