import classNames from 'classnames';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { TeamMateHelper } from './TeamMateHelper';
import { Side } from '@benjaminbours/composite-core';
import { PlayerState } from '../../../useMainController';
import { YingYang } from './YingYang';
import { loadImage } from '../../../utils';
import { defaultLevelImageUrl } from '../../../constants';

interface Props {
    id: number;
    name: string;
    isHovered: boolean;
    src: string;
    you: PlayerState;
    mate?: PlayerState;
    handleMouseEnterSide: (side: Side) => (e: React.MouseEvent) => void;
    handleMouseLeaveSide: (side: Side) => (e: React.MouseEvent) => void;
    handleClick: (id: number) => (e: React.MouseEvent) => void;
    setHoveredLevel: React.Dispatch<React.SetStateAction<number | undefined>>;
    isLightWaiting: boolean;
    isShadowWaiting: boolean;
    isMobile: boolean;
    isSoloMode: boolean;
}

export const LevelGridItem: React.FC<Props> = ({
    name,
    id,
    src,
    you,
    mate,
    handleClick,
    handleMouseEnterSide,
    handleMouseLeaveSide,
    setHoveredLevel,
    isHovered,
    isLightWaiting,
    isShadowWaiting,
    isMobile,
    isSoloMode,
}) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [imageUrl, setImageUrl] = useState(defaultLevelImageUrl);

    useEffect(() => {
        loadImage(src)
            .catch(() => defaultLevelImageUrl)
            .then((url) => {
                setImageUrl(url);
            });
    }, [src]);

    const cssClass = classNames({
        'level-grid-item': true,
        'level-grid-item--hovered': isHovered,
        'level-grid-item--hovered-solo': isHovered && isSoloMode,
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

    const handleMouseEnter = useCallback(() => {
        setHoveredLevel(id);
    }, [id, setHoveredLevel]);

    const handleMouseLeave = useCallback(() => {
        setHoveredLevel(undefined);
    }, [setHoveredLevel]);

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
        <button
            ref={ref}
            onMouseEnter={isMobile ? undefined : handleMouseEnter}
            onMouseLeave={isMobile ? undefined : handleMouseLeave}
            onClick={handleClick(id)}
            className={cssClass}
        >
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
        </button>
    );
};
