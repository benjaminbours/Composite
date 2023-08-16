import React, { Component } from "react";
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
                            className="buttonCircle"
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
