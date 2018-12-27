import { TweenMax } from "gsap";
import Menu from "./Menu";
import OnTop from "./OnTop";
import UnderMenu from "./UnderMenu";

const menu = new Menu();
const underMenu = new UnderMenu();
const onTop = new OnTop();

TweenMax.ticker.addEventListener("tick", () => {
    underMenu.render();
    menu.render();
    onTop.render();
});
// TweenMax.ticker.fps();
