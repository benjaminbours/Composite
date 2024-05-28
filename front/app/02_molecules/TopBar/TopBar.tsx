'use client';
// vendors
import React from 'react';
import Link from 'next/link';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';
import { getDictionary } from '../../../getDictionary';
import { SideMenu } from '../../03_organisms/SideMenu';
import { useWindowSize } from '../../hooks/useWindowSize';
import { YingYang } from '../../Menu/scenes/TeamLobbyScene/YingYang';

interface HideOnScrollProps {
    children: React.ReactElement;
}

function HideOnScroll(props: HideOnScrollProps) {
    const { children } = props;
    const trigger = useScrollTrigger();

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
}

export const TopBar: React.FC<Props> = ({ dictionary }) => {
    const { width, height } = useWindowSize();
    const isMobile =
        width !== undefined &&
        height !== undefined &&
        (width <= 768 || height <= 500);

    return (
        <HideOnScroll>
            <header className="top-bar">
                <Link href="/" className="top-bar__logo">
                    <YingYang />
                    <h3>Composite</h3>
                </Link>
                <SideMenu
                    buttonClassName="top-bar__hamburger-button"
                    dictionary={dictionary}
                />
            </header>
        </HideOnScroll>
    );
};
