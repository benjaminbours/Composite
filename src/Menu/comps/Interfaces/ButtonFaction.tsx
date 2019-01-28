import React from "react";
import { Context } from "../../context";

interface IProps {
    faction: "light" | "shadow";
}

export default function ButtonFaction(props: IProps) {
    const { faction } = props;
    return (
        <Context.Consumer>
            {({ handleClickOnFaction }) => (
                <div
                    className={`buttonCircle factionButton ${faction}`}
                    onClick={() => handleClickOnFaction(faction)}
                >
                    {faction}
                </div>
            )}
        </Context.Consumer>
    );
}
