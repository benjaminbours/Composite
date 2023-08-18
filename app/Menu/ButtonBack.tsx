import React from 'react';
import type { Side } from '../types';

interface IProps {
    color: Side;
    onClick: () => void;
}

export default function ButtonBack({ color, onClick }: IProps) {
    return (
        <div className={`buttonRect back ${color}`} onClick={onClick}>
            Back
        </div>
    );
}
