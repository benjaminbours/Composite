import React, { Component } from "react";

interface IProps {
    name: string;
    img: string;
}

export default function Portal(props: IProps) {
    const { name, img } = props;
    return(
        <div className="portal">
            <div className="image-container">
                <img src={img} alt={`screenshot of the level ${name}`}/>
                <h3>{name}</h3>
            </div>
        </div>
    );
}
