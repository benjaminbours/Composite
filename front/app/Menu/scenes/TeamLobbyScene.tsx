// vendors
import classNames from 'classnames';
import React, { useCallback, useMemo } from 'react';
import { Splide as SplideComponent, SplideSlide } from '@splidejs/react-splide';
import type { Splide } from '@splidejs/splide';
import '@splidejs/react-splide/css';
import { Levels } from '@benjaminbours/composite-core';

interface Props {
    teamLobbyRef: React.RefObject<HTMLDivElement>;
    actions: React.ReactNode;
    isMount: boolean;
    handleClickOnRandom: () => void;
    handleSelectLevel: (levelId: Levels) => void;
}

export const TeamLobbyScene: React.FC<Props> = ({
    teamLobbyRef,
    actions,
    isMount,
    handleClickOnRandom,
    handleSelectLevel,
}) => {
    const cssClass = classNames({
        'content-container': true,
        'team-lobby-container': true,
        unmount: !isMount,
    });

    const levels = useMemo(
        () => [
            {
                id: Levels.CRACK_THE_DOOR,
                name: 'Crack the door',
                img: '/crack_the_door.png',
                disabled: false,
                selectedByTeamMate: false,
            },
            {
                id: Levels.LEARN_TO_FLY,
                name: 'Learn to fly',
                img: '/learn_to_fly.png',
                disabled: false,
                selectedByTeamMate: true,
            },
            {
                id: Levels.THE_HIGH_SPHERES,
                name: 'The high spheres',
                img: '/the_high_spheres.png',
                disabled: true,
                selectedByTeamMate: false,
            },
        ],
        [],
    );

    const handleLevelMoved = useCallback(
        (_splide: Splide, index: number, prev: number, dest: number) => {
            handleSelectLevel(levels[index].id);
        },
        [levels, handleSelectLevel],
    );

    return (
        <div ref={teamLobbyRef} className={cssClass}>
            {actions}
            <h3 className="title-h2 title-h2--white">Select a level</h3>
            <SplideComponent
                options={{
                    perPage: 3,
                    perMove: 1,
                    rewind: true,
                    width: '100%',
                    focus: 'center',
                    type: 'loop',
                    padding: '1em',
                    updateOnMove: true,
                    pagination: false,
                }}
                onMoved={handleLevelMoved}
                aria-label="React Splide Example"
                className="level-slider"
            >
                {levels.map(({ id, img, name, selectedByTeamMate }) => {
                    const slideCssClass = classNames({
                        'level-slider__item': true,
                        'level-slider__item--selected-by-team-mate':
                            selectedByTeamMate,
                    });
                    return (
                        <SplideSlide className={slideCssClass} key={id}>
                            <button className="level-portal-container">
                                <div
                                    className="background"
                                    style={{ backgroundImage: `url(${img})` }}
                                />
                                <p>{name}</p>
                            </button>
                        </SplideSlide>
                    );
                })}
            </SplideComponent>
        </div>
    );
};
