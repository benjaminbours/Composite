export default class Mouse {
    public static x: number = 0;
    public static y: number = 0;
    public static lastX: number = 0;
    public static lastY: number = 0;
    public static directionX: number = 0;
    public static directionY: number = 0;
    public static speedX: number = 0;
    public static speedY: number = 0;

    public static handleMouseMove(e: MouseEvent) {
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

    public static speed() {
        Mouse.speedX = Mouse.x - Mouse.lastX;
        Mouse.speedY = Mouse.y - Mouse.lastY;
        Mouse.lastX = Mouse.x;
        Mouse.lastY = Mouse.y;
        setTimeout(Mouse.speed, 50);
    }
}
