import React from 'react';
import { Context } from '../../context';
import ButtonBack from './ButtonBack';

const text = {
    white: 'No shadow here',
    black: 'No light here',
};

interface Props {
    queueRef: React.RefObject<HTMLDivElement>;
}

function Queue({ queueRef }: Props) {
    return (
        <Context.Consumer>
            {({ side: faction, currentScene }) => (
                <div
                    ref={queueRef}
                    className={`queue-container ${
                        currentScene !== 'queue' ? 'unmount' : ''
                    }`}
                >
                    <ButtonBack color={faction} />
                    <h2 className={faction}>{text[faction]}</h2>
                </div>
            )}
        </Context.Consumer>
    );
}

export default Queue;
