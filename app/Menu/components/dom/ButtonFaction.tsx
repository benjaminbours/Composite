import React from 'react';
import { Context } from '../../context';
import { Side } from '../../types';

interface IProps {
    side: Side;
}

export default function ButtonFaction({ side }: IProps) {
    return (
        <Context.Consumer>
            {({ handleClickOnFaction }) => (
                <div
                    className={`buttonCircle factionButton ${side}`}
                    onClick={() => handleClickOnFaction(side)}
                >
                    {side}
                </div>
            )}
        </Context.Consumer>
    );
}
