// vendors
import { gsap } from 'gsap';
import classNames from 'classnames';
import React, { useCallback, useRef } from 'react';
// our libs
import { AllQueueInfo } from '@benjaminbours/composite-core';
// project
import { QueueInfoText } from '../QueueInfo';
import Curve, { defaultWaveOptions } from '../canvas/Curve';
import CanvasWhite from '../canvas/CanvasWhite';
import CanvasBlack from '../canvas/CanvasBlack';

interface Props {
    canvasBlack: React.MutableRefObject<CanvasBlack | undefined>;
    canvasWhite: React.MutableRefObject<CanvasWhite | undefined>;
    homeRef: React.RefObject<HTMLDivElement>;
    handleClickOnRandom: () => void;
    handleClickOnFriend: () => void;
    allQueueInfo?: AllQueueInfo;
    isMount: boolean;
    setLightIsPulsingFast: (isPulsingFast: boolean) => void;
    setShadowRotationSpeed: (speed: number) => void;
}

export const HomeScene: React.FC<Props> = ({
    homeRef,
    canvasBlack,
    canvasWhite,
    allQueueInfo,
    handleClickOnRandom,
    handleClickOnFriend,
    isMount,
    setLightIsPulsingFast,
    setShadowRotationSpeed,
}) => {
    const buttonFriendRef = useRef<HTMLButtonElement>(null);
    const buttonRandomRef = useRef<HTMLButtonElement>(null);
    const informationFriendRef = useRef<HTMLParagraphElement>(null);
    const informationRandomRef = useRef<HTMLParagraphElement>(null);

    const cssClass = classNames({
        'home-container': true,
        unmount: !isMount,
    });

    const handleClickOnPlay = useCallback(() => {
        const visibleCssClass = 'visible';
        if (buttonFriendRef.current?.classList.contains(visibleCssClass)) {
            buttonFriendRef.current?.classList.remove(visibleCssClass);
            buttonRandomRef.current?.classList.remove(visibleCssClass);
            informationFriendRef.current?.classList.remove(visibleCssClass);
            informationRandomRef.current?.classList.remove(visibleCssClass);
        } else {
            buttonFriendRef.current?.classList.add(visibleCssClass);
            buttonRandomRef.current?.classList.add(visibleCssClass);
            informationFriendRef.current?.classList.add(visibleCssClass);
            informationRandomRef.current?.classList.add(visibleCssClass);
        }
    }, []);

    const handleMouseLeavePlay = useCallback(() => {
        if (!canvasBlack.current || !canvasWhite.current) {
            return;
        }
        // curve
        canvasBlack.current.curve.mouseIsHoverButton = false;
        Curve.setWaveOptions({
            ...defaultWaveOptions,
        });
        // light
        setLightIsPulsingFast(false);
        // shadow
        setShadowRotationSpeed(0.005);
    }, [
        setLightIsPulsingFast,
        setShadowRotationSpeed,
        canvasBlack,
        canvasWhite,
    ]);

    const handleMouseEnterPlay = useCallback(() => {
        if (!canvasBlack.current || !canvasWhite.current) {
            return;
        }
        // curve
        canvasBlack.current.curve.mouseIsHoverButton = true;
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
    }, [
        setLightIsPulsingFast,
        setShadowRotationSpeed,
        canvasBlack,
        canvasWhite,
    ]);

    return (
        <div ref={homeRef} className={cssClass}>
            <h1 className="title-h1">Composite</h1>
            <h2 className="main-subtitle">Think both ways</h2>
            {allQueueInfo && (
                <>
                    <QueueInfoText side="light" value={allQueueInfo.light} />
                    <QueueInfoText side="shadow" value={allQueueInfo.shadow} />
                </>
            )}
            <div className="home-container__play-container play-container">
                <p
                    ref={informationRandomRef}
                    className="information information-random"
                >
                    Play a game with a random person
                </p>
                <button
                    ref={buttonRandomRef}
                    onClick={handleClickOnRandom}
                    onMouseEnter={() => setLightIsPulsingFast(true)}
                    onMouseLeave={() => setLightIsPulsingFast(false)}
                    className="buttonCircle button-hidden button-random"
                >
                    Random
                </button>
                <p
                    ref={informationFriendRef}
                    className="information information-friend"
                >
                    Generate a link to invite a friend
                </p>
                <button
                    ref={buttonFriendRef}
                    onClick={handleClickOnFriend}
                    onMouseEnter={() => setShadowRotationSpeed(0.02)}
                    onMouseLeave={() => setShadowRotationSpeed(0.005)}
                    className="buttonCircle button-hidden button-friend"
                >
                    Friend
                </button>
            </div>
            <button
                className="buttonCircle"
                id="buttonPlay"
                onMouseEnter={handleMouseEnterPlay}
                onMouseLeave={handleMouseLeavePlay}
                onClick={handleClickOnPlay}
            >
                Play
            </button>
        </div>
    );
};
