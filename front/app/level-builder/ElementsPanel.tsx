import React, { useMemo } from 'react';

enum ElementType {
    WALL = 'wall',
    WALL_DOOR = 'wall_door',
    ARCH = 'arch',
    BOUNCE = 'bounce',
    END_LEVEL = 'end_level',
    FAT_COLUMN = 'fat_column',
}

interface ElementListItem {
    type: ElementType;
    /**
     * src of the image
     */
    img: string;
    name: string;
}

interface Props {}

export const ElementsPanel: React.FC<Props> = ({}) => {
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
        <div className="elements-panel">
            <h2>Elements</h2>
            <div className="separator" />
            <ul>
                {elements.map(({ img, type, name }) => (
                    <li className="elements-panel__item" key={type}>
                        <button
                            onClick={() => {
                                console.log('just added element of type', type);
                            }}
                        >
                            <div className="img-placeholder" />
                            {/* <img src={img} alt="coming soon" /> */}
                            <p className="elements-panel__item-name">{name}</p>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
