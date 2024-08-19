import React, { useCallback, useMemo, useState } from 'react';
import DoorSlidingIcon from '@mui/icons-material/DoorSliding';
import classNames from 'classnames';
import { BounceIcon } from '../[lng]/(levelEditor)/level-editor/icons/BounceIcon';
import SportsScoreIcon from '@mui/icons-material/SportsScore';

const mechanics = [
    {
        title: 'End level',
        description: (
            <p>
                The end level element react to the presence of each player. When
                the two players stand stand at the same time, they will complete
                the ying-yang symbol and therefor, finish the level.
            </p>
        ),
        icon: <SportsScoreIcon className="game-mechanics__icon" />,
        video: '/videos/composite_end_level_mechanic.mp4',
    },
    {
        title: 'Bounce',
        description: (
            <>
                <p>
                    Light and shadow are complementary and opposed. Therefore,
                    if a player enter in contact with an opposite element, the
                    entity get projected accordingly with the platform angle.
                </p>
                <p>
                    Some bounce are interactive and allow a similar player to
                    enter inside and to influence the rotation of the platform.
                </p>
            </>
        ),
        icon: <BounceIcon className="game-mechanics__icon bounce-icon" />,
        video: '/videos/composite_bounce_mechanic.mp4',
    },
    {
        title: 'Door',
        description: (
            <p>
                Each door has at least one door opener linked. While a player
                stand on the door opener, the door stay open.
            </p>
        ),
        icon: <DoorSlidingIcon className="game-mechanics__icon" />,
        video: '/videos/composite_door_mechanic.mp4',
    },
];

interface Props {}

export const Mechanics: React.FC<Props> = ({}) => {
    const [selectedMechanic, setSelectedMechanic] = useState(0);
    const currentMechanic = useMemo(
        () => mechanics[selectedMechanic],
        [selectedMechanic],
    );

    const handleSelectMechanic = useCallback((index: number) => {
        setSelectedMechanic(index);
    }, []);

    return (
        <div className="game-mechanics">
            <ul className="game-mechanics__selector">
                {mechanics.map((mechanic, index) => {
                    const cssClass = classNames({
                        'game-mechanics__selector-item': true,
                        'game-mechanics__selector-item--active':
                            selectedMechanic === index,
                    });
                    return (
                        <li key={index}>
                            <button
                                onClick={() => handleSelectMechanic(index)}
                                className={cssClass}
                            >
                                {mechanic.icon}
                                <h5 className="title-h5">{mechanic.title}</h5>
                            </button>
                        </li>
                    );
                })}
            </ul>
            <div className="game-mechanics__content">
                <h3 className="title-h3 text-important">
                    {currentMechanic.title}
                </h3>
                {currentMechanic.description}
                <video
                    controls
                    autoPlay
                    loop
                    src={currentMechanic.video}
                    className="game-mechanics__video"
                />
            </div>
        </div>
    );
};
