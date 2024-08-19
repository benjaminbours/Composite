// vendors
import classNames from 'classnames';
import React, { useCallback, useMemo, useRef } from 'react';
// project
import Link from 'next/link';
import { MenuScene, Route } from '../../types';
import { useMenuTransitionContext } from '../../contexts/menuTransitionContext';

export const HomeScene: React.FC = () => {
    // contexts
    const {
        menuScene,
        nextMenuScene,
        homeRef,
        setLightIsPulsingFast,
        setShadowRotationSpeed,
        setCurveIsFast,
        goToLobby,
        moveAllGraphicsToElement,
    } = useMenuTransitionContext();

    const isMobile = window.innerWidth <= 768 || window.innerHeight <= 500;
    const playButtonRef = useRef<HTMLButtonElement>(null);

    const cssClass = useMemo(() => {
        const isMount =
            menuScene === MenuScene.HOME || nextMenuScene === MenuScene.HOME;

        return classNames({
            'home-scene': true,
            unmount: !isMount,
        });
    }, [menuScene, nextMenuScene]);

    const handleMouseLeavePlay = useCallback(() => {
        setCurveIsFast(false);
        setLightIsPulsingFast(false);
        setShadowRotationSpeed(0.005);
        // disable on purpose, I want this not to change after mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMouseEnterPlay = useCallback(() => {
        setCurveIsFast(true);
        setLightIsPulsingFast(true);
        setShadowRotationSpeed(0.02);
        // disable on purpose, I want this not to change after mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMouseEnterButton = useCallback(
        (e: React.MouseEvent) => {
            const bbox = e.currentTarget.getBoundingClientRect();
            moveAllGraphicsToElement(bbox);
        },
        // disable on purpose, I want this not to change after mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const handleMouseLeaveButton = useCallback(() => {
        if (!playButtonRef.current) {
            return;
        }
        const bbox = playButtonRef.current.getBoundingClientRect();
        moveAllGraphicsToElement(bbox);
        // disable on purpose, I want this not to change after mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={homeRef} className={cssClass}>
            <h1 className="main-title-intro">Composite</h1>
            <h2 className="main-subtitle">Think both ways</h2>
            <div className="home-scene__buttons-container">
                <Link href={Route.ROADMAP}>
                    <button
                        className="composite-button home-scene__timeline-button"
                        id="buttonPath"
                        onMouseEnter={
                            isMobile ? undefined : handleMouseEnterButton
                        }
                        onMouseLeave={
                            isMobile ? undefined : handleMouseLeaveButton
                        }
                    >
                        The timeline
                    </button>
                </Link>
                <button
                    ref={playButtonRef}
                    className="button-play home-scene__button-play"
                    onMouseEnter={isMobile ? undefined : handleMouseEnterPlay}
                    onMouseLeave={isMobile ? undefined : handleMouseLeavePlay}
                    onClick={goToLobby}
                >
                    Play
                </button>
                <Link href={Route.COMMUNITY}>
                    <button
                        className="composite-button home-scene__community-button"
                        id="buttonBuild"
                        onMouseEnter={
                            isMobile ? undefined : handleMouseEnterButton
                        }
                        onMouseLeave={
                            isMobile ? undefined : handleMouseLeaveButton
                        }
                    >
                        The community
                    </button>
                </Link>
            </div>
            {/* TODO: Add socials at the bottom of the page */}
        </div>
    );
};
