import React, { Component } from 'react';
import Animation from '../../Animation';
import { Context } from '../../context';
import ButtonBack from './ButtonBack';

const text = {
    white: 'No shadow here',
    black: 'No light here',
};

export default class Queue extends Component {
    public render() {
        return (
            <Context.Consumer>
                {({ side: faction, currentScene }) => (
                    <div
                        ref={Animation.components.queueInterface}
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
}
