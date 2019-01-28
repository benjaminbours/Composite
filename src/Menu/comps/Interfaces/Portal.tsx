import React from "react";
import { Context } from "../../context";

interface IProps {
    name: string;
    img: string;
}

export default function Portal(props: IProps) {
    const { name, img } = props;
    return (
        <Context.Consumer>
            {({ handleClickOnLevel }) => (
                <div
                    className="portal"
                    onClick={() => handleClickOnLevel(name)}
                >
                    <div className="image-container">
                        <img src={img} alt={`screenshot of the level ${name}`} />
                        <h3>{name}</h3>
                    </div>
                </div>
            )}
        </Context.Consumer>
    );
}
