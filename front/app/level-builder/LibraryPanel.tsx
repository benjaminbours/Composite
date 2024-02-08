import React, { useMemo } from 'react';
import { ElementType, LevelElement } from './types';

interface ElementListItem {
    type: ElementType;
    /**
     * src of the image
     */
    img: string;
    name: string;
}

interface Props {
    onElementClick: (type: ElementType) => (clickEvent: any) => void;
}

export const LibraryPanel: React.FC<Props> = ({ onElementClick }) => {
    const elements: ElementListItem[] = useMemo(() => {
        return [
            {
                type: ElementType.WALL,
                img: '/images/elements/wall.png',
                name: 'Wall',
            },
            {
                type: ElementType.WALL_DOOR,
                img: '/images/elements/wall_door.png',
                name: 'Door',
            },
            {
                type: ElementType.ARCH,
                img: '/images/elements/arch.png',
                name: 'Arch',
            },
            {
                type: ElementType.BOUNCE,
                img: '/images/elements/bounce.png',
                name: 'Bounce',
            },
            {
                type: ElementType.END_LEVEL,
                img: '/images/elements/end_level.png',
                name: 'End level',
            },
            {
                type: ElementType.FAT_COLUMN,
                img: '/images/elements/fat_column.png',
                name: 'Fat column',
            },
        ];
    }, []);

    return (
        <div className="panel elements-panel">
            <h3>Library</h3>
            <div className="separator" />
            <ul>
                {elements.map(({ img, type, name }) => (
                    <li className="elements-panel__item" key={type}>
                        <button onClick={onElementClick(type)}>
                            <div className="img-placeholder" />
                            {/* <img src={img} alt="coming soon" /> */}
                            <p className="item-name">{name}</p>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
