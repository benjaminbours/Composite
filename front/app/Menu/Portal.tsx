import React from 'react';

interface IProps {
    name: string;
    img: string;
    onClick: (level: string) => void;
}

export default function Portal({ name, img, onClick }: IProps) {
    return (
        <div className="portal" onClick={() => onClick(name)}>
            <div className="image-container">
                <img src={img} alt={`screenshot of the level ${name}`} />
                <h3>{name}</h3>
            </div>
        </div>
    );
}
