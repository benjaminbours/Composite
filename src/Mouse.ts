import Animation from "./Animation";
import ButtonPlay from "./comps/ButtonPlay";
import App from "./main";

export default class Mouse {
    public static x: number = 0;
    public static y: number = 0;
    public static lastX: number = 0;
    public static lastY: number = 0;
    public static directionX: number = 0;
    public static directionY: number = 0;
    public static speedX: number = 0;
    public static speedY: number = 0;

    public static init() {
        document.addEventListener("mousemove", Mouse.handleMouseMove);
        document.addEventListener("click", Mouse.handleClickButtonPlay);
        Mouse.detectMouseSpeed();
    }

    private static handleMouseMove(e: MouseEvent) {
        Mouse.detectMouseDirection(e);
        if (App.layers.onTop.scenes.home.buttonPlay.isMount) {
            Mouse.detectMouseEventButtonPlay(e);
        }
    }

    private static handleClickButtonPlay(e: MouseEvent) {
        const buttonPlay = App.layers.onTop.scenes.home.buttonPlay;

        if (buttonPlay instanceof ButtonPlay && buttonPlay.isMouseHover) {
            Animation.homeToLevel();
            Animation.mouseExitButtonPlay();
            App.currentScene = "other";
        } else {
            // console.log("click outside");
        }
    }

    private static detectMouseSpeed() {
        Mouse.speedX = Mouse.x - Mouse.lastX;
        Mouse.speedY = Mouse.y - Mouse.lastY;
        Mouse.lastX = Mouse.x;
        Mouse.lastY = Mouse.y;
        setTimeout(Mouse.detectMouseSpeed, 50);
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

    private static detectMouseEventButtonPlay(e: MouseEvent) {
        const buttonPlay = App.layers.onTop.scenes.home.buttonPlay;
        if (buttonPlay instanceof ButtonPlay) {
            if (App.layers.onTop.ctx.isPointInPath(buttonPlay.path, e.clientX, e.clientY)) {
                if (buttonPlay.isMouseHover === false) {
                    buttonPlay.isMouseEnter = true;
                } else {
                    buttonPlay.isMouseEnter = false;
                }
                buttonPlay.isMouseHover = true;
            } else {
                if (buttonPlay.isMouseHover === true || buttonPlay.isMouseEnter) {
                    buttonPlay.isMouseExit = true;
                } else {
                    buttonPlay.isMouseExit = false;
                }
                buttonPlay.isMouseHover = false;
            }

            if (buttonPlay.isMouseEnter) {
                Animation.mouseEnterButtonPlay();
            }

            if (buttonPlay.isMouseExit) {
                Animation.mouseExitButtonPlay();
            }
        }
    }
}
