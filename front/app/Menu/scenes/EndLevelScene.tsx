// vendors
import Script from 'next/script';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { MenuScene } from '../types';
import { CopyToClipBoardIcon } from '../CopyToClipboardIcon';

interface Props {
    endLevelRef: React.RefObject<HTMLDivElement>;
    currentScene: string;
    side?: Side;
    levelName?: string;
    handleClickOnPlay: () => void;
    actions: React.ReactNode;
}

export const EndLevelScene: React.FC<Props> = ({
    endLevelRef,
    currentScene,
    side,
    levelName,
    handleClickOnPlay,
    actions,
}) => {
    const [shouldDisplayIsCopied, setShouldDisplayIsCopied] = useState(false);
    const color = side === Side.SHADOW ? 'black' : 'white';
    const cssClass = classNames({
        'content-container': true,
        'end-level-container': true,
        [`end-level-container--${color}`]: side !== undefined ? true : false,
        ...(currentScene !== MenuScene.END_LEVEL ? { unmount: true } : {}),
    });

    const handleClickCopyToClipBoard = useCallback(() => {
        navigator.clipboard.writeText(process.env.NEXT_PUBLIC_URL!);
        setShouldDisplayIsCopied(true);
        setTimeout(() => {
            setShouldDisplayIsCopied(false);
        }, 3000);
    }, []);

    // effect to trigger script coming with buttons
    useEffect(() => {
        if ((window as any).twttr?.widgets) {
            (window as any).twttr.widgets.load();
        }
        let scriptElement: HTMLElement | undefined;
        fetch('https://c6.patreon.com/becomePatronButton.bundle.js').then(
            async (res) => {
                console.log(res);
                console.log('loaded');
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
                // TODO: had same interaction as on home page
                // onMouseEnter={handleMouseEnterPlay}
                // onMouseLeave={handleMouseLeavePlay}
                onClick={handleClickOnPlay}
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
                            href="/about"
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
                    <button
                        className={`buttonRect ${color}`}
                        onClick={handleClickCopyToClipBoard}
                    >
                        <CopyToClipBoardIcon color={color} />
                        <p>
                            {shouldDisplayIsCopied
                                ? 'Copied to clipboard'
                                : process.env.NEXT_PUBLIC_URL}
                        </p>
                    </button>
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
