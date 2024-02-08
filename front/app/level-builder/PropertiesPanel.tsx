import React from 'react';
import { LevelElement } from './types';

interface Props {
    element: LevelElement;
}

export const PropertiesPanel: React.FC<Props> = ({ element }) => {
    return (
        <div className="panel properties-panel">
            <h3>{`${element.name} - Properties`}</h3>

            {Object.entries(element.properties).map(([key, value]) => {
                return (
                    <div key={key} className="property">
                        <label>{key}</label>
                        {/* <input type="text" value={value} /> */}
                    </div>
                );
            })}
        </div>
    );
};
