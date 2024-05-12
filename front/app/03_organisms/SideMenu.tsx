'use client';
// vendors
import React, { useMemo, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CloseIcon from '@mui/icons-material/Close';
import HandymanIcon from '@mui/icons-material/Handyman';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { getDictionary } from '../../getDictionary';
import { Divider } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { Route } from '../types';
import Link from 'next/link';

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
}

export const SideMenu: React.FC<Props> = ({ dictionary }) => {
    const [isOpen, setIsOpen] = useState(false);

    const items = useMemo(
        () => [
            {
                text: dictionary.nav.close,
                icon: <CloseIcon />,
                onClick: () => setIsOpen(false),
            },
            {
                isDivider: true,
            },
            {
                text: dictionary.nav.play,
                icon: <SportsEsportsIcon />,
                href: Route.HOME,
            },
            {
                text: dictionary.nav.editor,
                icon: <HandymanIcon />,
                href: Route.LEVEL_EDITOR_ROOT,
            },
            {
                text: dictionary.nav.community,
                icon: <PeopleIcon />,
            },
        ],
        [dictionary],
    );

    return (
        <>
            <IconButton
                // size="small"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={() => setIsOpen(true)}
                color="inherit"
            >
                <MenuIcon />
            </IconButton>
            <Drawer
                anchor="right"
                open={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <div className="side-menu">
                    <List>
                        {items.map(
                            (
                                { text, icon, onClick, isDivider, href },
                                index,
                            ) => {
                                if (isDivider) {
                                    return <Divider key={index} />;
                                }

                                const Wrapper: React.FC<{
                                    children: React.ReactNode;
                                }> = ({ children }) => {
                                    if (href) {
                                        return (
                                            <Link
                                                href={href}
                                                legacyBehavior
                                                passHref
                                            >
                                                {children}
                                            </Link>
                                        );
                                    }

                                    return children;
                                };

                                return (
                                    <ListItem key={text} disablePadding>
                                        <Wrapper>
                                            <ListItemButton onClick={onClick}>
                                                <ListItemIcon>
                                                    {icon}
                                                </ListItemIcon>
                                                <ListItemText primary={text} />
                                            </ListItemButton>
                                        </Wrapper>
                                    </ListItem>
                                );
                            },
                        )}
                    </List>
                </div>
            </Drawer>
        </>
    );
};
