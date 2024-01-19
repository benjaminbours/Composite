'use client';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import CanvasBlack from './Menu/canvas/CanvasBlack';
import { MenuScene } from './Menu/types';
import { Side } from '@benjaminbours/composite-core';
import Link from 'next/link';

interface Props {}

export const NotFoundPage: React.FC<Props> = ({}) => {
    const blackCanvas = useRef<CanvasBlack>();
    const blackCanvasDomElement = useRef<HTMLCanvasElement>(null);

    const isMobileDevice = useMemo(() => {
        if (!window) {
            return true;
        }
        return window.innerWidth <= 768;
    }, []);

    const resize = useCallback(() => {
        if (!blackCanvas.current) {
            return;
        }
        blackCanvas.current.resize({
            isMobileDevice,
            currentScene: MenuScene.QUEUE,
            side: Side.LIGHT,
        });
    }, [isMobileDevice]);

    const canvasLoop = useCallback(() => {
        blackCanvas.current?.render();
    }, []);

    // effect to start to render the menu animation
    useEffect(() => {
        blackCanvas.current = new CanvasBlack(
            blackCanvasDomElement.current as HTMLCanvasElement,
        );
        resize();
        gsap.ticker.add(canvasLoop);
        return () => {
            gsap.ticker.remove(canvasLoop);
        };
        // disable on purpose, I want this not to change after mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // on resize
    useEffect(() => {
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [resize]);

    return (
        <main className="not-found">
            <div className="content-container">
                <h2 className="title-h2">{`Oops! It seems like you're lost in the shadows.`}</h2>
                <h3>Find your light</h3>
                <Link href="/" className="buttonCircle white">
                    Home
                </Link>
            </div>
            <canvas id="black" ref={blackCanvasDomElement} />
        </main>
    );
};
