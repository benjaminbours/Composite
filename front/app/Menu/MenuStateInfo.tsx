import { Side } from '@benjaminbours/composite-core';
import classNames from 'classnames';
import React from 'react';

interface Props {
    levelName?: string;
    side?: Side;
}

export const MenuStateInfo: React.FC<Props> = ({ levelName, side }) => {
    const cssClass = classNames({
        'menu-state-info': true,
        'menu-state-info--black': side === Side.SHADOW,
    });
    return (
        <div className={cssClass}>
            <h3>
                <span className="menu-label">Level:</span> {levelName}
            </h3>
            {side !== undefined && (
                <h3>
                    <span className="menu-label">Side:</span>
                    {side === Side.LIGHT ? 'Light' : 'Shadow'}
                </h3>
            )}
        </div>
    );
};
