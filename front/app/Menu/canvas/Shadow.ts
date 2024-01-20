// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { ResizeOptions } from '../types';

const shadow = new Image();
shadow.src = '/shadow.png';

export default class Shadow {
    public startY: number = 30;
    public startX: number = 0;

    public resizeOptions = {
        not_found(width: number, height: number, isOnMobile: boolean) {
            const positionX = 1;
            const positionY = 0.5;
            if (isOnMobile) {
                return {
                    x: width * 0.5,
                    y: height * 0.85,
                };
            }
            return {
                x: width * positionX,
                y: height * positionY,
            };
        },
        home(width: number, height: number) {
            return {
                x: width * 0.5,
                y: height * 0.75,
            };
        },
        team_lobby(width: number, height: number) {
            return {
                x: width * 0.75,
                y: height * 0.75,
            };
        },
        invite_friend(width: number, height: number, isOnMobile: boolean) {
            if (isOnMobile) {
                return {
                    x: width * 0.15,
                    y: height * 0.5,
                };
            }
            return {
                x: width * 0.15,
                y: height * 0.5,
            };
        },
        level(width: number, height: number, isOnMobile: boolean) {
            if (isOnMobile) {
                return {
                    x: width * 0.85,
                    y: height * 0.5,
                };
            }
            return {
                x: width * 0.85,
                y: height * 0.5,
            };
        },
        faction(width: number, height: number, isOnMobile: boolean) {
            if (isOnMobile) {
                return {
                    x: width * 0.5,
                    y: height * 0.65,
                };
            }
            return {
                x: width * 0.75,
                y: height * 0.5,
            };
        },
        queue(
            width: number,
            height: number,
            isOnMobile: boolean,
            faction?: Side,
        ) {
            const positionX = faction === Side.SHADOW ? 0.5 : 1;
            const positionY = 0.5;
            if (isOnMobile) {
                return {
                    x: width * 0.5,
                    y: height * 0.85,
                };
            }
            return {
                x: width * positionX,
                y: height * positionY,
            };
        },
        end_level(
            width: number,
            height: number,
            isOnMobile: boolean,
            faction?: Side,
        ) {
            const positionX = faction === Side.SHADOW ? 0.5 : 1;
            const positionY = 0.5;
            if (isOnMobile) {
                return {
                    x: width * 0.5,
                    y: height * 0.85,
                };
            }
            return {
                x: width * positionX,
                y: height * positionY,
            };
        },
    };

    private rotation: number = 0;
    private width: number = 600;

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
        const coordinate = this.resizeOptions[options.currentScene](
            this.ctx.canvas.width,
            this.ctx.canvas.height,
            options.isMobileDevice,
            options.side,
        );
        this.startX = coordinate.x;
        this.startY = coordinate.y;
        this.width = 600;
        if (window.innerHeight < 700 || window.innerWidth <= 768) {
            this.width = 500;
        }
        if (window.innerWidth > 2000) {
            this.width = 800;
        }
    };
}
