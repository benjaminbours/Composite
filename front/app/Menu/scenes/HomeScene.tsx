// vendors
import classNames from 'classnames';
import { gsap } from 'gsap';
import React, { useCallback, useRef } from 'react';
// our libs
// project
import Curve, { defaultWaveOptions } from '../canvas/Curve';
import { RefHashMap } from '../../useMenuTransition';
import Link from 'next/link';
import { Route } from '../../types';

interface Props {
    refHashMap: RefHashMap;
    homeRef: React.RefObject<HTMLDivElement>;
    handleClickPlay: () => void;
    isMount: boolean;
    setLightIsPulsingFast: (isPulsingFast: boolean) => void;
    setShadowRotationSpeed: (speed: number) => void;
}

export const HomeScene: React.FC<Props> = ({
    homeRef,
    refHashMap,
    handleClickPlay,
    isMount,
    setLightIsPulsingFast,
    setShadowRotationSpeed,
}) => {
    const playButtonRef = useRef<HTMLButtonElement>(null);
    const cssClass = classNames({
        'home-container': true,
        unmount: !isMount,
    });

    const handleMouseLeavePlay = useCallback(() => {
        if (
            !refHashMap.canvasBlack.current ||
            !refHashMap.canvasWhite.current
        ) {
            return;
        }
        // curve
        refHashMap.canvasBlack.current.curve.mouseIsHoverButton = false;
        Curve.setWaveOptions({
            ...defaultWaveOptions,
        });
        // light
        setLightIsPulsingFast(false);
        // shadow
        setShadowRotationSpeed(0.005);
    }, [setLightIsPulsingFast, setShadowRotationSpeed, refHashMap]);

    const handleMouseEnterPlay = useCallback(() => {
        if (
            !refHashMap.canvasBlack.current ||
            !refHashMap.canvasWhite.current
        ) {
            return;
        }
        // curve
        refHashMap.canvasBlack.current.curve.mouseIsHoverButton = true;
        // TODO: refactor to avoid this kind of static method
        Curve.setWaveOptions({
            randomRange: 300,
            amplitudeRange: 50,
            speed: 0.1,
        });
        // light
        setLightIsPulsingFast(true);
        // shadow
        setShadowRotationSpeed(0.02);
    }, [setLightIsPulsingFast, setShadowRotationSpeed, refHashMap]);

    const moveGraphicToElement = useCallback(
        (bbox: DOMRect) => {
            if (
                !refHashMap.canvasBlack.current ||
                !refHashMap.canvasWhite.current
            ) {
                return;
            }
            Curve.setWaveOptions({
                viscosity: 40,
                damping: 0.2,
            });
            gsap.to(refHashMap.canvasBlack.current.curve, {
                duration: 0.5,
                delay: 0.1,
                origin: bbox.x + bbox.width / 2,
                onComplete: () => {
                    Curve.setWaveOptions({
                        ...defaultWaveOptions,
                    });
                },
            });
            gsap.to(refHashMap.canvasBlack.current.light, {
                duration: 0.5,
                delay: 0.1,
                startX: bbox.x + bbox.width / 2,
                startY: bbox.y + bbox.height / 2,
            });
            gsap.to(refHashMap.canvasWhite.current.shadow, {
                duration: 0.5,
                delay: 0.1,
                startX: bbox.x + bbox.width / 2,
                startY: bbox.y + bbox.height / 2,
            });
        },
        [refHashMap],
    );

    const handleMouseEnterButton = useCallback(
        (e: React.MouseEvent) => {
            const bbox = e.currentTarget.getBoundingClientRect();
            moveGraphicToElement(bbox);
        },
        [moveGraphicToElement],
    );

    const handleMouseLeaveButton = useCallback(() => {
        if (!playButtonRef.current) {
            return;
        }
        const bbox = playButtonRef.current.getBoundingClientRect();
        moveGraphicToElement(bbox);
    }, [moveGraphicToElement]);

    return (
        <div ref={homeRef} className={cssClass}>
            <h1 className="title-h1">Composite</h1>
            <h2 className="main-subtitle">Think both ways</h2>
            <button
                ref={playButtonRef}
                className="buttonCircle home-container__button"
                id="buttonPlay"
                onMouseEnter={handleMouseEnterPlay}
                onMouseLeave={handleMouseLeavePlay}
                onClick={handleClickPlay}
            >
                Play
            </button>
            <Link href={Route.ROADMAP}>
                <button
                    className="buttonCircle home-container__button"
                    id="buttonPath"
                    onMouseEnter={handleMouseEnterButton}
                    onMouseLeave={handleMouseLeaveButton}
                >
                    The path
                </button>
            </Link>

            <Link href={Route.LEVEL_EDITOR_ROOT}>
                <button
                    className="buttonCircle home-container__button"
                    id="buttonBuild"
                    onMouseEnter={handleMouseEnterButton}
                    onMouseLeave={handleMouseLeaveButton}
                >
                    Build
                </button>
            </Link>
            {/* 
            <button
                className="buttonCircle home-container__button"
                id="buttonJoin"
            >
                Join
                <br />
                us
            </button> */}
        </div>
    );
};
