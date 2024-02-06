// vendors
import Script from 'next/script';
import classNames from 'classnames';
import React, { useEffect } from 'react';
// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { CopyToClipBoardButton } from '../CopyToClipboardButton';
import { RouteStatic } from '../../types';

interface Props {
    endLevelRef: React.RefObject<HTMLDivElement>;
    side?: Side;
    levelName?: string;
    handleClickOnPlay: () => void;
    actions: React.ReactNode;
    isMount: boolean;
    setLightIsPulsingFast: (isPulsingFast: boolean) => void;
    setShadowRotationSpeed: (speed: number) => void;
}

export const EndLevelScene: React.FC<Props> = ({
    endLevelRef,
    side,
    levelName,
    handleClickOnPlay,
    actions,
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
            {actions}
            <h2>Well done!</h2>
            <h3>
                <span className="menu-label">You just finished the level:</span>{' '}
                {levelName}
            </h3>
            <button
                className={`buttonCircle ${color} end-level-container__play-button`}
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
                Play
            </button>
            {/* <p className=''>{`You team mate wants to continue the run!\nJoin him.`}</p> */}
            <div className="end-level-container__share">
                <div className="text-container">
                    <p>
                        If you liked the experience and you want it to reach its{' '}
                        <a
                            className="inline-link"
                            href={RouteStatic.ROADMAP}
                            target="_blank"
                        >
                            full potential
                        </a>
                        , the best thing you can do is to talk about it.
                    </p>
                    <h3>Thank you 🙏</h3>
                </div>
                <div>
                    <a
                        className="twitter-share-button"
                        target="_blank"
                        data-size="large"
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            `I just finished the level ${levelName} playing ${
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
                        color="black"
                        text={
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
        </div>
    );
};
