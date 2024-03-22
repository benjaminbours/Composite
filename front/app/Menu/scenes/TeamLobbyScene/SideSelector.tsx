import { Side } from '@benjaminbours/composite-core';
import React, { useMemo } from 'react';
import { CopyToClipBoardButton } from '../../CopyToClipboardButton';
import { PlayerState } from '../../../useMainController';
import styles from './SideSelector.module.scss';

interface Props {
    you: PlayerState;
    mate?: PlayerState;
    setLightIsPulsingFast: (isPulsingFast: boolean) => void;
    setShadowRotationSpeed: (speed: number) => void;
    handleSelectSide: (side: Side) => void;
    setSideSize: (side: Side, size: number) => void;
    handleClickReadyToPlay: () => void;
    inviteFriend: () => Promise<string>;
}

export const SideSelector: React.FC<Props> = ({
    you,
    mate,
    setLightIsPulsingFast,
    setShadowRotationSpeed,
    handleSelectSide,
    handleClickReadyToPlay,
    setSideSize,
    inviteFriend,
}) => {
    const light = {
        isReady:
            (you.side === Side.LIGHT && you.isReady) ||
            (mate?.side === Side.LIGHT && mate.isReady),
        isSelected: mate?.side !== Side.LIGHT && you.side !== Side.LIGHT,
    };
    const shadow = {
        isReady:
            (you.side === Side.SHADOW && you.isReady) ||
            (mate?.side === Side.SHADOW && mate.isReady),
        isSelected: mate?.side !== Side.SHADOW && you.side !== Side.SHADOW,
    };
    const shouldDisplayChoicesLight =
        you.side === Side.LIGHT && mate === undefined;
    const shouldDisplayChoicesShadow =
        you.side === Side.SHADOW && mate === undefined;

    const shouldDisplayStart = useMemo(() => {
        return (
            mate !== undefined &&
            you.level !== undefined &&
            you.side !== undefined
        );
    }, [you, mate]);

    const choices = useMemo(() => {
        return (
            <>
                <CopyToClipBoardButton
                    className={styles['invite-button']}
                    text="Invite link"
                    asyncAction={inviteFriend}
                />
                <button
                    className={`${styles['rect-button']} ${styles['enter-queue-button']}`}
                    // onClick={handleClickReadyToPlay}
                >
                    Enter matchmaking queue
                </button>
            </>
        );
    }, [inviteFriend]);

    return (
        <div className={styles.root}>
            <h2 className="title-h3 title-h3--white">Select your side</h2>
            <div className={styles['side-container']}>
                {light.isSelected ? (
                    <button
                        className={styles['side-button']}
                        onMouseEnter={() => {
                            setLightIsPulsingFast(true);
                            setSideSize(Side.LIGHT, 400);
                        }}
                        onMouseLeave={() => {
                            setLightIsPulsingFast(false);
                            setSideSize(Side.LIGHT, 350);
                        }}
                        onClick={() => {
                            setLightIsPulsingFast(false);
                            handleSelectSide(Side.LIGHT);
                        }}
                    >
                        <h3 className="title-h4 title-h4--white">Light</h3>
                    </button>
                ) : (
                    <h3 className="title-h4 title-h4--white">
                        {light.isReady ? 'Light is ready' : 'Light'}
                    </h3>
                )}
                {shouldDisplayChoicesLight && choices}
            </div>
            <div className={styles['side-container']}>
                {shadow.isSelected ? (
                    <button
                        className={styles['side-button']}
                        onMouseEnter={() => {
                            setShadowRotationSpeed(0.02);
                            setSideSize(Side.SHADOW, 500);
                        }}
                        onMouseLeave={() => {
                            setShadowRotationSpeed(0.005);
                            setSideSize(Side.SHADOW, 450);
                        }}
                        onClick={() => {
                            setShadowRotationSpeed(0.005);
                            handleSelectSide(Side.SHADOW);
                        }}
                    >
                        <h3 className="title-h4 title-h4--white">Shadow</h3>
                    </button>
                ) : (
                    <h3 className="title-h4 title-h4--white">
                        {shadow.isReady ? 'Shadow is ready' : 'Shadow'}
                    </h3>
                )}
                {shouldDisplayChoicesShadow && choices}
            </div>
            {shouldDisplayStart && (
                <button
                    className={`${styles['ready-button']} ${styles['rect-button']}`}
                    onClick={handleClickReadyToPlay}
                >
                    {you.isReady ? 'I am not ready' : 'I am ready'}
                </button>
            )}
        </div>
    );
};
