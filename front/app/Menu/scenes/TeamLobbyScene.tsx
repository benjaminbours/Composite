// vendors
import classNames from 'classnames';
import React, { useEffect, useMemo } from 'react';
import Slider, { Settings } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Levels, Side } from '@benjaminbours/composite-core';

const YingYang: React.FC = () => (
    <svg className="ying-yang" viewBox="0 0 800 800">
        <g transform="translate(-491 -193)">
            <path
                className="black"
                d="M-466,32c0-220.8,179.2-400,400-400,110.4,0,200,89.6,200,200S44.4,32-66,32s-200,89.6-200,200,89.6,200,200,200C-286.8,432-466,252.8-466,32Z"
                transform="translate(859 527) rotate(-90)"
                fill="#000"
            />
            <path
                className="white"
                d="M-266,432c0-110.4,89.6-200,200-200S134,142.4,134,32,44.4-168-66-168c220.8,0,400,179.2,400,400S154.8,632-66,632C-176.4,632-266,542.4-266,432Z"
                transform="translate(659 527) rotate(-90)"
                fill="#fff"
            />
        </g>
    </svg>
);

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
    selectedSide: Side | undefined;
    sideSelectedByTeamMate: Side | undefined;
    setLightIsPulsingFast: (isPulsingFast: boolean) => void;
    setShadowRotationSpeed: (speed: number) => void;
}

// TODO: Wrap all scenes with react.memo to prevent useless re-render
export const TeamLobbyScene: React.FC<Props> = React.memo(
    ({
        teamLobbyRef,
        actions,
        isMount,
        levels,
        selectedSide,
        sideSelectedByTeamMate,
        handleSelectLevel,
        handleSelectSide,
        setLightIsPulsingFast,
        setShadowRotationSpeed,
    }) => {
        const cssClass = classNames({
            'content-container': true,
            'team-lobby-container': true,
            unmount: !isMount,
        });

        const levelDuplicates = useMemo(() => [...levels, ...levels], [levels]);

        const settings: Settings = useMemo(
            () => ({
                className: 'center level-slider',
                centerMode: true,
                infinite: true,
                centerPadding: '10px',
                slidesToShow: 3,
                speed: 500,
                beforeChange: (_currentSlide: number, nextSlide: number) => {
                    handleSelectLevel(levelDuplicates[nextSlide].id);
                },
            }),
            [levelDuplicates, handleSelectLevel],
        );

        useEffect(() => {
            handleSelectLevel(levels[0].id);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return (
            <div ref={teamLobbyRef} className={cssClass}>
                {actions}
                <h3 className="title-h2 title-h2--white">Select a level</h3>
                <Slider {...settings}>
                    {levelDuplicates.map(
                        ({ id, img, name, selectedByTeamMate, disabled }) => {
                            const slideCssClass = classNames({
                                'level-slider__item': true,
                                'level-slider__item--disabled': disabled,
                                'level-slider__item--selected-by-team-mate':
                                    selectedByTeamMate,
                            });
                            return (
                                <div className={slideCssClass} key={id}>
                                    <button className="level-portal-container">
                                        <div
                                            className="background"
                                            style={{
                                                backgroundImage: `url(${img})`,
                                            }}
                                        />
                                        <YingYang />
                                        <p>{name}</p>
                                        {disabled && <span className='coming-soon'>Coming soong</span>}
                                    </button>
                                </div>
                            );
                        },
                    )}
                </Slider>

                {sideSelectedByTeamMate !== Side.LIGHT &&
                    selectedSide !== Side.LIGHT && (
                        <button
                            className="buttonCircle white team-lobby-container__side-button"
                            onMouseEnter={() => setLightIsPulsingFast(true)}
                            onMouseLeave={() => setLightIsPulsingFast(false)}
                            onClick={() => {
                                setLightIsPulsingFast(false);
                                handleSelectSide(Side.LIGHT);
                            }}
                        >
                            light
                        </button>
                    )}
                {sideSelectedByTeamMate !== Side.SHADOW &&
                    selectedSide !== Side.SHADOW && (
                        <button
                            className="buttonCircle black team-lobby-container__side-button"
                            onMouseEnter={() => setShadowRotationSpeed(0.02)}
                            onMouseLeave={() => setShadowRotationSpeed(0.005)}
                            onClick={() => {
                                setShadowRotationSpeed(0.005);
                                handleSelectSide(Side.SHADOW);
                            }}
                        >
                            shadow
                        </button>
                    )}
            </div>
        );
    },
);
TeamLobbyScene.displayName = 'TeamLobbyScene';
