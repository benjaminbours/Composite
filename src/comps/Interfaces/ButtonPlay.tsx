import React, { Component } from "react";
import Animation from "../../Animation";
import { Context } from "../../context";

export default class ButtonPlay extends Component {
    public render() {
        return (
            <Context.Consumer>
                {({
                    handleMouseEnterPlay,
                    handleMouseLeavePlay,
                    handleClickOnPlay,
                }) => (
                        <button
                            ref={Animation.components.buttonPlay}
                            id="buttonPlay"
                            onMouseEnter={handleMouseEnterPlay}
                            onMouseLeave={handleMouseLeavePlay}
                            onClick={handleClickOnPlay}
                        >
                            Play
                    </button>
                    )}
            </Context.Consumer>
        );
    }
}
