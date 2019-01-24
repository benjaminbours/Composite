import MainTitle from "../src/comps/Canvases/comps/MainTitle";
import CanvasWhite from "../src/comps/Canvases/layers/CanvasWhite";

describe("CanvasBlack", () => {
    it("should not have home scene on mobile and tablet", () => {
        const ctxDom = document.createElement("canvas");
        ctxDom.width = 768; // tablet breakpoint
        ctxDom.height = 580;
        const canvasWhite = new CanvasWhite(ctxDom);

        // const scenes = {
        //     home: {},
        // };
        // console.log(canvasWhite.scenes);
        // console.log(homeScene);
        expect(canvasWhite.scenes).not.toHaveProperty("home");

        // expect(canvasWhite.scenes.home)
        //     .toEqual(expect.not.objectContaining(homeScene));
        // expect({bar: 'baz'}).toEqual(expect.not.objectContaining(expected));

    });
});
