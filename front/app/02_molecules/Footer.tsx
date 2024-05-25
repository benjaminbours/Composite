'use client';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { Route } from '../types';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';
import { Locale } from '../../i18n-config';
import { Socials } from './Socials';

interface Props {
    lng: Locale;
}

export const Footer: React.FC<Props> = ({ lng }) => {
    const pathName = usePathname();
    const path = useMemo(
        () => pathName.replace(`/${lng}`, ''),
        [lng, pathName],
    );

    const siteMapItems = useMemo(
        () => [
            {
                url: Route.HOME,
                text: 'Home',
            },
            {
                url: Route.LEVEL_EDITOR_ROOT,
                text: 'Editor',
            },
            {
                url: Route.TIMELINE,
                text: 'Timeline',
            },
            {
                url: Route.COMMUNITY,
                text: 'Community',
            },
        ],
        [],
    );
    return (
        <footer className="footer">
            <div className="main-container">
                <ul className="footer__site-map">
                    {siteMapItems.map(({ url, text }) => {
                        const cssClass = classNames({
                            'footer__site-map-item': true,
                            'footer__site-map-item--active': path === url,
                        });
                        return (
                            <li key={url} className={cssClass}>
                                <Link href={url}>{text}</Link>
                            </li>
                        );
                    })}
                </ul>

                <Socials className="footer__socials" />
                <h2>Composite</h2>
                <small>© Composite 2024</small>
            </div>
        </footer>
    );
};
