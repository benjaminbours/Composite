import { TweenMax } from "gsap";
import * as STATS from "stats.js";
import Menu from "./layers/Menu";
import OnTop from "./layers/OnTop";
import UnderMenu from "./layers/UnderMenu";

const menu = new Menu();
const underMenu = new UnderMenu();
const onTop = new OnTop();

const stats = new STATS.default();
stats.showPanel( 1 );
document.body.appendChild( stats.dom );

TweenMax.ticker.addEventListener("tick", () => {
    stats.begin();
    underMenu.render();
    menu.render();
    onTop.render();
    stats.end();
});
