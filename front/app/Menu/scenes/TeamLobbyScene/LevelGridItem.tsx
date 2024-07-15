import classNames from 'classnames';
import React, { useMemo, useRef } from 'react';
import { TeamMateHelper } from './TeamMateHelper';
import { Side } from '@benjaminbours/composite-core';
import { PlayerState } from '../../../useMainController';
import { YingYang } from './YingYang';
import { defaultLevelImageUrl } from '../../../constants';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import StarIcon from '@mui/icons-material/Star';
import { DifficultyIcon } from '../../../01_atoms/DifficultyIcon';
import { Level } from '@benjaminbours/composite-api-client';

interface Props {
    level: Level;
    you: PlayerState;
    mate?: PlayerState;
    handleMouseEnterSide: (side: Side) => (e: React.MouseEvent) => void;
    handleMouseLeaveSide: (side: Side) => (e: React.MouseEvent) => void;
    handleClick: (id: number) => (e: React.MouseEvent) => void;
    isLightWaiting: boolean;
    isShadowWaiting: boolean;
    isMobile: boolean;
    isSoloMode: boolean;
}

export const LevelGridItem: React.FC<Props> = ({
    level,
    you,
    mate,
    handleClick,
    handleMouseEnterSide,
    handleMouseLeaveSide,
    isLightWaiting,
    isShadowWaiting,
    isMobile,
    isSoloMode,
}) => {
    const ref = useRef<HTMLButtonElement>(null);
    const { name, id } = level;

    const imageUrl = useMemo(() => {
        if (level.thumbnail) {
            return `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/level_thumbnails/${level.thumbnail}`;
        }
        return defaultLevelImageUrl;
    }, [level.thumbnail]);

    const cssClass = classNames({
        'level-grid-item': true,
        'level-grid-item--solo': isSoloMode,
        'level-grid-item--selected': you.level === id,
        'level-grid-item--selected-solo': you.level === id && isSoloMode,
        'level-grid-item--selected-shadow':
            (you.level === id && you.side === Side.SHADOW) ||
            (mate?.level === id && mate?.side === Side.SHADOW) ||
            isShadowWaiting,
        'level-grid-item--selected-light':
            (you.level === id && you.side === Side.LIGHT) ||
            (mate?.level === id && mate?.side === Side.LIGHT) ||
            isLightWaiting,
    });

    const teamMateHelper = useMemo(() => {
        if (
            !mate ||
            mate?.level !== id ||
            mate?.side === undefined ||
            mate?.side === null
        ) {
            return;
        }

        return (
            <TeamMateHelper levelName={name} mate={mate} isMobile={isMobile} />
        );
    }, [mate, name, id, isMobile]);

    return (
        <button ref={ref} onClick={handleClick(id)} className={cssClass}>
            {teamMateHelper}
            <div
                className="level-grid-item__image"
                style={{
                    backgroundImage: `url("${imageUrl}")`,
                }}
            >
                <div className="level-grid-item__side-buttons-container">
                    <div
                        onMouseEnter={
                            isMobile
                                ? undefined
                                : handleMouseEnterSide(Side.LIGHT)
                        }
                        onMouseLeave={
                            isMobile
                                ? undefined
                                : handleMouseLeaveSide(Side.LIGHT)
                        }
                        className="half-circle half-circle--light"
                    >
                        <div className="background" />
                        <p>Light</p>
                    </div>
                    <div
                        onMouseEnter={
                            isMobile
                                ? undefined
                                : handleMouseEnterSide(Side.SHADOW)
                        }
                        onMouseLeave={
                            isMobile
                                ? undefined
                                : handleMouseLeaveSide(Side.SHADOW)
                        }
                        className="half-circle half-circle--shadow"
                    >
                        <div className="background" />
                        <p>Shadow</p>
                    </div>
                    <YingYang />
                </div>
                <div className="level-grid-item__border-container">
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                </div>
            </div>
            <p className="level-grid-item__name">{name}</p>
            <div className="level-grid-item__counts">
                <div
                    title="Number of time the level has been played in ranked. (Excluding practice mode)"
                    className="level-grid-item__played-icon"
                >
                    <SportsEsportsIcon />{' '}
                    <span>{(level.count as any).games}</span>
                </div>
                <div
                    title="Quality rating"
                    className="level-grid-item__quality-icon"
                >
                    <StarIcon /> <span>{(level as any).qualityRating}</span>
                </div>
                <div
                    title="Difficulty rating"
                    className="level-grid-item__difficulty-icon"
                >
                    <DifficultyIcon />{' '}
                    <span>{(level as any).difficultyRating}</span>
                </div>
            </div>
        </button>
    );
};
