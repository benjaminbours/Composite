import React from 'react';

interface Props {}

export const ArrowRight: React.FC<Props> = ({}) => {
    return (
        <svg viewBox="0 0 32 32">
            <path d="M16 32a16 16 0 1 1 16-16 16 16 0 0 1-16 16zm0-30a14 14 0 1 0 14 14A14 14 0 0 0 16 2z" />
            <path d="M13.71 24.71 12.3 23.3l7.29-7.3-7.3-7.29L13.7 7.3l8 8a1 1 0 0 1 0 1.41z" />
        </svg>
    );
};
