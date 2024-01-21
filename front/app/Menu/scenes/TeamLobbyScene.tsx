// vendors
import classNames from 'classnames';
import React, { useCallback } from 'react';
import { Splide as SplideComponent, SplideSlide } from '@splidejs/react-splide';
import type { Splide } from '@splidejs/splide';
import '@splidejs/react-splide/css';
import { Levels, Side } from '@benjaminbours/composite-core';

interface Props {
    teamLobbyRef: React.RefObject<HTMLDivElement>;
    actions: React.ReactNode;
    isMount: boolean;
    handleSelectLevel: (levelId: Levels) => void;
    handleSelectSide: (side: Side) => void;
    levels: {
        id: Levels;
        name: string;
        img: string;
        disabled: boolean;
        selectedByTeamMate: boolean;
    }[];
}

export const TeamLobbyScene: React.FC<Props> = ({
    teamLobbyRef,
    actions,
    isMount,
    levels,
    handleSelectLevel,
    handleSelectSide,
}) => {
    const cssClass = classNames({
        'content-container': true,
        'team-lobby-container': true,
        unmount: !isMount,
    });

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
                    width: '100%',
                    start: 0,
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
                                    style={{
                                        backgroundImage: `url(${img})`,
                                    }}
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
