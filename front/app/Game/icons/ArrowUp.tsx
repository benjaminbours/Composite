import React from 'react';

interface Props {}

export const ArrowUp: React.FC<Props> = ({}) => {
    return (
        <svg viewBox="0 0 32 32">
            <path d="M16 0a16 16 0 1 0 16 16A16 16 0 0 0 16 0zm0 30a14 14 0 1 1 14-14 14 14 0 0 1-14 14z" />
            <path d="m15.29 10.29-8 8L8.7 19.7l7.3-7.29 7.29 7.29 1.41-1.41-8-8a1 1 0 0 0-1.41 0z" />
        </svg>
    );
};
