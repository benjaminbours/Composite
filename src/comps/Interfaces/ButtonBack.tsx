import React from "react";
import { Context } from "../../context";

interface IProps {
    color: "black" | "white";
}

export default function ButtonBack(props: IProps) {
    return (
        <Context.Consumer>
            {({ handleClickOnBack }) => (
                <div
                    className={`buttonRect back ${props.color}`}
                    onClick={handleClickOnBack}
                >
                    Back
                </div>
            )}
        </Context.Consumer>
    );
}
