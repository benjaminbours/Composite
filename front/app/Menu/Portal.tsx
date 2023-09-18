import { Levels } from 'composite-core';
import React from 'react';

interface IProps {
    id: Levels;
    name: string;
    img: string;
    onClick: (level: Levels) => void;
}

export default function Portal({ id, name, img, onClick }: IProps) {
    return (
        <div className="portal" onClick={() => onClick(id)}>
            <div className="image-container">
                <img src={img} alt={`screenshot of the level ${name}`} />
                <h3>{name}</h3>
            </div>
        </div>
    );
}
