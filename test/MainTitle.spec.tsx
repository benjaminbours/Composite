// import React from "react";
// import ReactDOM from "react-dom";
import MainTitle from "../src/comps/Canvases/comps/MainTitle";

describe("MainTitle", () => {
    it("should be positionned at x:1500, y:150", () => {
        const ctxDom = document.createElement("canvas");
        const ctx = ctxDom.getContext("2d") as CanvasRenderingContext2D;

        ctx.canvas.width = 100;
        const mainTitle = new MainTitle(ctx, "white");

        // console.log(ctx.canvas.width);
        console.log(mainTitle.startX);

        // window.resizeTo(100, 100);
        // console.log(window.innerHeight);
        // console.log(window.innerWidth);

        // expect MainTitle.startX and MainTitle.startY to be positonned at ...
        // expect();

    });
});
