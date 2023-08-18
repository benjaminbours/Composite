import React from 'react';

interface IProps {
    color: 'black' | 'white';
    onClick: () => void;
}

export default function ButtonBack({ color, onClick }: IProps) {
    return (
        <div className={`buttonRect back ${color}`} onClick={onClick}>
            Back
        </div>
    );
}
