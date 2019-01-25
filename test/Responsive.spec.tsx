import { MainTitle, SubtitleHome } from "../src/comps/Canvases/comps";
import Curve from "../src/comps/Canvases/comps/Curve";

const breakpoint = {
    tablet: 768,
};

describe("Responsive", () => {
    test("Text on home page should not render in black, bellow tablet breakpoint", () => {
        const ctxDom = document.createElement("canvas");
        const ctx = ctxDom.getContext("2d") as CanvasRenderingContext2D;
        ctxDom.width = breakpoint.tablet; // tablet breakpoint
        // ctxDom.height = 580;
        const mainTitle = new MainTitle();
        const subtitleHome = new SubtitleHome("THINK BOTH WAYS", true);

        const result = [
            mainTitle.render(ctx, "black"),
            subtitleHome.render(ctx, "black"),
        ];

        expect(result).toEqual([
            false,
            false,
        ]);
    });

    test("Curve should be positioned horizontaly", () => {
        // return true;
        //
    });
    // it("should be positionned at x:1500, y:150", () => {
    //     const ctxDom = document.createElement("canvas");
    //     const ctx = ctxDom.getContext("2d") as CanvasRenderingContext2D;

    //     ctx.canvas.width = 100;
    //     const mainTitle = new MainTitle();

    //     // console.log(ctx.canvas.width);
    //     console.log(mainTitle.startX);

    //     // window.resizeTo(100, 100);
    //     // console.log(window.innerHeight);
    //     // console.log(window.innerWidth);

    //     // expect MainTitle.startX and MainTitle.startY to be positonned at ...
    //     // expect();

    // });
});

// import MainTitle from "../src/comps/Canvases/comps/MainTitle";
// import CanvasWhite from "../src/comps/Canvases/layers/CanvasWhite";

// describe("CanvasWhite", () => {
//     it("should not render bothComponents home below tablet breakpoint", () => {
//         const ctxDom = document.createElement("canvas");
//         ctxDom.width = 768; // tablet breakpoint
//         ctxDom.height = 580;
//         const canvasWhite = new CanvasWhite(ctxDom);

//         // console.log(canvasWhite);

//         // const scenes = {
//         //     home: {},
//         // };
//         // console.log(canvasWhite.scenes);
//         // console.log(homeScene);
//         // expect(canvasWhite.scenes).not.toHaveProperty("home");

//         // expect(canvasWhite.scenes.home)
//         //     .toEqual(expect.not.objectContaining(homeScene));
//         // expect({bar: 'baz'}).toEqual(expect.not.objectContaining(expected));

//     });
// });
