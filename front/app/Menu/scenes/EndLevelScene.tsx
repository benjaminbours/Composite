// vendors
import classNames from 'classnames';
import React, { useEffect } from 'react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { CopyToClipBoardButton } from '../CopyToClipboardButton';
import { Route } from '../../types';
import { Level } from '@benjaminbours/composite-api-client';
import GamesIcon from '@mui/icons-material/Games';
import { PlayerState } from '../../useMainController';
import { DiscordButton } from '../../02_molecules/DiscordButton';

interface Props {
    endLevelRef: React.RefObject<HTMLDivElement>;
    level?: Level;
    side?: Side;
    mate?: PlayerState;
    handleClickOnPlay: () => void;
    handleClickOnExit: () => void;
    isMount: boolean;
    setLightIsPulsingFast: (isPulsingFast: boolean) => void;
    setShadowRotationSpeed: (speed: number) => void;
}

// TODO: If this view have a scroll, the layout with the shadow / light center on the button is broken
export const EndLevelScene: React.FC<Props> = ({
    endLevelRef,
    side,
    mate,
    level,
    handleClickOnPlay,
    handleClickOnExit,
    isMount,
    setLightIsPulsingFast,
    setShadowRotationSpeed,
}) => {
    const color = side === Side.SHADOW ? 'black' : 'white';
    const cssClass = classNames({
        'end-level-scene': true,
        [`end-level-scene--${color}`]: side !== undefined ? true : false,
        unmount: !isMount,
    });

    useEffect(() => {
        if (!isMount) {
            return;
        }

        (window as any).twttr = (function (d, s, id) {
            var js: any,
                fjs: any = d.getElementsByTagName(s)[0],
                t = (window as any).twttr || {};
            if (d.getElementById(id)) return t;
            js = d.createElement(s);
            js.id = id;
            js.src = 'https://platform.twitter.com/widgets.js';
            fjs.parentNode.insertBefore(js, fjs);

            t._e = [];
            t.ready = function (f: any) {
                t._e.push(f);
            };

            return t;
        })(document, 'script', 'twitter-wjs');
    }, [isMount]);

    return (
        <div ref={endLevelRef} className={cssClass}>
            <div className="end-level-scene__header">
                <button
                    className="composite-button white"
                    onClick={handleClickOnExit}
                >
                    Exit
                </button>
            </div>
            <h2 className="title-h2">Well done!</h2>
            <div className="end-level-scene__text-container">
                <p>
                    You just finished the level:{` `}
                    <b>{level?.name}</b>, made by <b>{level?.author?.name}</b>
                </p>
                {mate && (
                    <p>
                        You made it with your mate:{` `}
                        <b>{mate.account?.name || 'Guest'}</b>
                    </p>
                )}
            </div>
            <div className="end-level-scene__like-container end-level-scene__text-container">
                <h3 className="title-h3">Did you like it?</h3>
                <p>{`If you did, consider giving a like to this level.`}</p>
                {/* Add helper such as: Discover why it's important */}
                {/* TODO: Add auth + request to like the level */}
                <br />
                <button className="composite-button white">
                    Give a like <ThumbUpIcon />
                </button>
            </div>
            <div className="end-level-scene__play-button-container">
                <button
                    className="composite-button end-level-scene__play-button main-action"
                    onMouseEnter={() => {
                        if (side === Side.LIGHT) {
                            setLightIsPulsingFast(true);
                        } else {
                            setShadowRotationSpeed(0.02);
                        }
                    }}
                    onMouseLeave={() => {
                        if (side === Side.LIGHT) {
                            setLightIsPulsingFast(false);
                        } else {
                            setShadowRotationSpeed(0.005);
                        }
                    }}
                    onClick={() => {
                        if (side === Side.LIGHT) {
                            setLightIsPulsingFast(false);
                        } else {
                            setShadowRotationSpeed(0.005);
                        }
                        handleClickOnPlay();
                    }}
                >
                    Play again <GamesIcon />
                </button>
            </div>
            <div className="end-level-scene__text-container">
                <p>
                    If you liked the experience and you want it to reach its{' '}
                    <a
                        className="inline-link"
                        href={Route.ROADMAP}
                        target="_blank"
                    >
                        full&nbsp;potential
                    </a>
                    , the best thing you can do is to talk about it.
                </p>
            </div>
            <div className="end-level-scene__share">
                <div>
                    <a
                        className="twitter-share-button"
                        target="_blank"
                        data-size="large"
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            `I just finished the level ${level?.name} playing ${
                                side === Side.LIGHT ? 'Light' : 'Shadow'
                            } on Composite the game! Did you try it? ${process.env.NEXT_PUBLIC_URL}${Route.SHARE(level?.id)}`,
                        )}`}
                    >
                        Tweet
                    </a>
                </div>
                <div>
                    <CopyToClipBoardButton
                        text={'Share the project'}
                        textToCopy={
                            process.env.NEXT_PUBLIC_URL ||
                            'Missing env variable'
                        }
                    />
                </div>
                <div>
                    <a
                        className="composite-button end-level-scene__patreon-button"
                        href="https://patreon.com/benjaminbours"
                        target="_blank"
                    >
                        Support me
                        <svg viewBox="0 0 1080 1080">
                            <path
                                d="M1033.05,324.45c-0.19-137.9-107.59-250.92-233.6-291.7c-156.48-50.64-362.86-43.3-512.28,27.2
	C106.07,145.41,49.18,332.61,47.06,519.31c-1.74,153.5,13.58,557.79,241.62,560.67c169.44,2.15,194.67-216.18,273.07-321.33
	c55.78-74.81,127.6-95.94,216.01-117.82C929.71,603.22,1033.27,483.3,1033.05,324.45z"
                            />
                        </svg>
                    </a>
                </div>
                <div>
                    <DiscordButton className="composite-button" />
                </div>
            </div>
            <div className="thank-you">
                <h2 className="title-h2">Thank you</h2>
                <span className="thank-emoji">🙏</span>
            </div>
        </div>
    );
};
