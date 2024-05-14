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
import { useWindowSize } from '../../../hooks/useWindowSize';

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

function loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject();
        img.src = url;
    });
}

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
}

const defaultImageUrl = '/images/crack_the_door.png';

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
}) => {
    const { width } = useWindowSize();
    const isMobile = width !== undefined && width <= 768;
    const ref = useRef<HTMLButtonElement>(null);
    const [imageUrl, setImageUrl] = useState(defaultImageUrl);

    useEffect(() => {
        loadImage(src)
            .catch(() => defaultImageUrl)
            .then((url) => {
                setImageUrl(url);
            });
    }, [src]);

    const cssClass = classNames({
        'level-grid-item': true,
        'level-grid-item--hovered': isHovered,
        'level-grid-item--selected': you.level === id,
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

        return <TeamMateHelper levelName={name} you={you} mate={mate} />;
    }, [mate, you, name, id]);

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
