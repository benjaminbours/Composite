import React, { Component } from "react";
import { Context } from "../../context";

interface IProps {
    refPlay;
}

export default class ButtonPlay extends Component<IProps> {
    public render() {
        return (
            <Context.Consumer>
                {({
                    handleMouseEnterPlay,
                    handleMouseLeavePlay,
                    handleClickOnPlay,
                }) => (
                    <button
                        ref={this.props.refPlay}
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
