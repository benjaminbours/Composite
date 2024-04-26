import React from 'react';

interface Props {
    className?: string;
}

export const ArchIcon: React.FC<Props> = ({ className }) => {
    return (
        <svg className={className} fill="#ffffff" viewBox="0 0 24 24">
            <path d="M21 8V6H3v14H2v2h6v-7c0-.163.046-4 4-4 3.821 0 3.993 3.602 4 4v7h6v-2h-1V8zM2 2h20v2H2z" />
        </svg>
    );
};
