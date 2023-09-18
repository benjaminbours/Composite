// vendors
import React from 'react';

interface IProps {
    color: string;
    onClick: () => void;
}

export default function ButtonBack({ color, onClick }: IProps) {
    return (
        <div className={`buttonRect back ${color}`} onClick={onClick}>
            Back
        </div>
    );
}
