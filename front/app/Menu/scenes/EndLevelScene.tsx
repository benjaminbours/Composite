// vendors
import Script from 'next/script';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { CopyToClipBoardButton } from '../CopyToClipboardButton';
import { Route } from '../../types';
import { Level } from '@benjaminbours/composite-api-client';
import { PlayerState } from '../../useMainController';

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
        'content-container': true,
        'end-level-container': true,
        [`end-level-container--${color}`]: side !== undefined ? true : false,
        unmount: !isMount,
    });

    // effect to trigger script coming with buttons
    useEffect(() => {
        if ((window as any).twttr?.widgets) {
            (window as any).twttr.widgets.load();
        }
        let scriptElement: HTMLElement | undefined;
        fetch('https://c6.patreon.com/becomePatronButton.bundle.js').then(
            async (res) => {
                const b = await res.blob();
                let ou = URL.createObjectURL(b),
                    scriptElement = document.createElement('script');
                scriptElement.setAttribute('src', ou);
                scriptElement.setAttribute('type', 'text/javascript');
                document.body.appendChild(scriptElement);
            },
        );

        return () => {
            if (scriptElement) {
                document.body.removeChild(scriptElement);
            }
        };
    }, []);

    return (
        <div ref={endLevelRef} className={cssClass}>
            <div className="end-level-container__header">
                <button
                    className="buttonRect white"
                    onClick={handleClickOnExit}
                >
                    Exit
                </button>
                <h2 className="title-h2">Well done!</h2>
                <div />
            </div>
            <div className="end-level-container__text-container">
                <p>
                    You just finished the level:{` `}
                    <b>{level?.name}</b>, made by <b>{level?.author?.name}</b>
                </p>
                <p>
                    You made it with your mate:{` `}
                    <b>{mate?.account?.name || 'Guest'}</b>
                </p>
            </div>
            <div className="end-level-container__like-container end-level-container__text-container">
                <h3 className="title-h3">Did you like it?</h3>
                <p>{`If you did, consider giving a like to this level.`}</p>
                {/* Discover why it's important */}
                {/* TODO: Add auth + request to like the level */}
                <button className="buttonRect white">
                    Give a like <ThumbUpIcon />
                </button>
            </div>
            <div className="end-level-container__play-button-container">
                <button
                    className="buttonCircle end-level-container__play-button"
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
                    Play again
                </button>
            </div>
            <div className="end-level-container__text-container">
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
            <div className="end-level-container__share">
                <div>
                    <a
                        className="twitter-share-button"
                        target="_blank"
                        data-size="large"
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            `I just finished the level ${level?.name} playing ${
                                side === Side.LIGHT ? 'Light' : 'Shadow'
                            } on Composite the game! Can you do it?`,
                        )}`}
                    >
                        Tweet
                    </a>
                    <Script id="twitter-post-button-script">{`
    window.twttr = (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0],
          t = window.twttr || {};
        if (d.getElementById(id)) return t;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);
      
        t._e = [];
        t.ready = function(f) {
          t._e.push(f);
        };
      
        return t;
      }(document, "script", "twitter-wjs"));
    `}</Script>
                </div>
                <div>
                    <CopyToClipBoardButton
                        // color="black"
                        text={
                            process.env.NEXT_PUBLIC_URL ||
                            'Missing env variable'
                        }
                        textToCopy={
                            process.env.NEXT_PUBLIC_URL ||
                            'Missing env variable'
                        }
                    />
                </div>
                <div className="patreon-container">
                    <a
                        href="https://www.patreon.com/bePatron?u=62398377"
                        data-patreon-widget-type="become-patron-button"
                    >
                        Support me!
                    </a>
                </div>
            </div>
            <div className="thank-you">
                <h2 className="title-h2">Thank you</h2>
                <span className="thank-emoji">🙏</span>
            </div>
        </div>
    );
};
