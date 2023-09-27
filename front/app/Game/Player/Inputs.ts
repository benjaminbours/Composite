import { Input, Side, SocketEventType } from '@benjaminbours/composite-core';
import { SocketController } from '../../SocketController';

export default class Inputs {
    private static socketController?: SocketController;
    private static playerSide?: Side;
    public static leftIsActive = false;
    public static rightIsActive = false;
    public static jumpIsActive = false;

    public static init(socketController: SocketController, playerSide: Side) {
        this.socketController = socketController;
        this.playerSide = playerSide;
        // TODO: Implements a destroy method
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        window.addEventListener('keyup', this.handleKeyup.bind(this));
    }

    public static reset() {
        this.leftIsActive = false;
        this.rightIsActive = false;
        this.jumpIsActive = false;
    }

    private static keydownOptions = {
        // left
        KeyA: () => {
            Inputs.leftIsActive = true;
            this.socketController?.emit([
                SocketEventType.GAME_PLAYER_INPUT,
                {
                    player: this.playerSide!,
                    input: Input.LEFT,
                },
            ]);
        },
        // right
        KeyD: () => {
            Inputs.rightIsActive = true;
            this.socketController?.emit([
                SocketEventType.GAME_PLAYER_INPUT,
                {
                    player: this.playerSide!,
                    input: Input.RIGHT,
                },
            ]);
        },
        // space
        Space: () => {
            Inputs.jumpIsActive = true;
            this.socketController?.emit([
                SocketEventType.GAME_PLAYER_INPUT,
                {
                    player: this.playerSide!,
                    input: Input.SPACE,
                },
            ]);
        },
    };

    private static keyupOptions = {
        KeyA() {
            Inputs.leftIsActive = false;
        },
        KeyD() {
            Inputs.rightIsActive = false;
        },
        Space() {
            Inputs.jumpIsActive = false;
        },
    };

    private static handleKeydown(e: KeyboardEvent) {
        const { code } = e;
        const key = code as 'KeyA' | 'KeyD' | 'Space';
        if (this.keydownOptions[key]) {
            this.keydownOptions[key]();
        }
    }

    private static handleKeyup(e: KeyboardEvent) {
        const { code } = e;
        const key = code as 'KeyA' | 'KeyD' | 'Space';
        if (this.keyupOptions[key]) {
            this.keyupOptions[key]();
        }
    }
}
