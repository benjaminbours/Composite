import React, { useMemo } from 'react';
import { ElementType, LevelElement } from './types';
import classNames from 'classnames';

interface Props {
    elements: LevelElement[];
    currentEditingIndex: number | undefined;
    onElementClick: (index: number) => void;
}

export const SceneContentPanel: React.FC<Props> = ({
    elements,
    currentEditingIndex,
    onElementClick,
}) => {
    return (
        <div className="panel scene-content-panel">
            <h3>Scene</h3>
            <div className="separator" />
            <ul>
                {elements.map(({ name }, index) => {
                    const cssClass = classNames({
                        'scene-content-panel__item': true,
                        'scene-content-panel__item--active':
                            index === currentEditingIndex,
                    });
                    return (
                        <li className={cssClass} key={name}>
                            <button onClick={() => onElementClick(index)}>
                                <div className="img-placeholder" />
                                {/* <img src={img} alt="coming soon" /> */}
                                <p className="item-name">{name}</p>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
