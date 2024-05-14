// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { MenuScene, ResizeOptions } from '../../types';

const shadow = new Image();
shadow.src = '/images/shadow.png';

const DEFAULT_WIDTH = 600;

export default class Shadow {
    public startY: number = 30;
    public startX: number = 0;

    public getParamsForScene = ({
        scene,
        canvasHeight,
        canvasWidth,
        isMobile,
        faction,
    }: {
        scene: MenuScene;
        canvasWidth: number;
        canvasHeight: number;
        isMobile: boolean;
        faction?: Side;
    }) => {
        let width = DEFAULT_WIDTH;
        if (window.innerHeight < 700 || window.innerWidth <= 768) {
            width = 500;
        }
        if (window.innerWidth > 2000) {
            width = 800;
        }

        const marginLeft = canvasWidth * 0.075 + 322;
        switch (scene) {
            case MenuScene.NOT_FOUND:
                return {
                    coordinates: {
                        x: canvasWidth * 1,
                        y: canvasHeight * (isMobile ? 0.85 : 0.5),
                    },
                    width,
                };
            case MenuScene.HOME:
                return {
                    coordinates: {
                        x: canvasWidth * 0.5,
                        y: canvasHeight * 0.75,
                    },
                    width,
                };
            case MenuScene.TEAM_LOBBY:
                let x = 1.1;
                return {
                    coordinates: {
                        x: canvasWidth * x,
                        y: canvasHeight * 0.75,
                    },
                    width,
                };
            case MenuScene.TEAM_LOBBY_SELECTED:
                let xPos = 0.5;
                return {
                    coordinates: {
                        x: canvasWidth * xPos,
                        y: canvasHeight * 0.75,
                    },
                    width,
                };
            case MenuScene.END_LEVEL:
                let y = 0.5;
                return {
                    coordinates: {
                        x: canvasWidth * 1,
                        y: canvasHeight * y,
                    },
                    width: 500,
                };
        }
    };

    private rotation: number = 0;
    private width: number = DEFAULT_WIDTH;

    private img: HTMLImageElement;
    private rotationSpeed: number = 0.005;

    private readonly ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.startX = this.ctx.canvas.width * 0.5;
        this.startY = this.ctx.canvas.height * 0.75;
        this.img = shadow;
    }

    public render = () => {
        this.ctx.save();
        this.ctx.translate(this.startX, this.startY);
        this.ctx.rotate(this.rotation);
        this.rotation -= this.rotationSpeed;
        this.ctx.drawImage(
            this.img,
            -this.width / 2,
            -this.width / 2,
            this.width,
            this.width,
        );
        this.ctx.restore();
    };

    public resize = (options: ResizeOptions) => {
        const { coordinates, width } = this.getParamsForScene({
            scene: options.currentScene,
            canvasWidth: this.ctx.canvas.width,
            canvasHeight: this.ctx.canvas.height,
            isMobile: options.isMobileDevice,
            faction: options.side,
        });
        this.startX = coordinates.x;
        this.startY = coordinates.y;
        this.width = width;
    };
}
