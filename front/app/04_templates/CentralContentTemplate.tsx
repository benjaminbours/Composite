import React from 'react';
import classNames from 'classnames';
import Paper from '@mui/material/Paper';

interface Props {
    className?: string;
    children?: React.ReactNode;
}

export const CentralContentTemplate: React.FC<Props> = ({
    children,
    className,
}) => {
    const cssClass = classNames({
        'central-content-template': true,
        ...(className ? { [className]: true } : {}),
    });

    return (
        <Paper className={cssClass} elevation={0}>
            <div className="small-container">{children}</div>
        </Paper>
    );
};
