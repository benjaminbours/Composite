'use client';
// vendors
import React, { useCallback, useMemo, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import GroupsIcon from '@mui/icons-material/Groups';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import HandymanIcon from '@mui/icons-material/Handyman';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { getDictionary } from '../../getDictionary';
import { Divider } from '@mui/material';
import { Route } from '../types';
import Link from 'next/link';
import classNames from 'classnames';
import { useStoreActions, useStoreState } from '../hooks/store';
import { Socials } from '../02_molecules/Socials';
import { useSnackbar } from 'notistack';

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
    buttonClassName?: string;
}

export const SideMenu: React.FC<Props> = ({ dictionary, buttonClassName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const isAuthenticated = useStoreState(
        (state) => state.user.isAuthenticated,
    );
    const signOut = useStoreActions((store) => store.user.signOut);
    const handleLogout = useCallback(() => {
        signOut()
            .then(() => {
                enqueueSnackbar(dictionary.notification['success-logout'], {
                    variant: 'success',
                });
            })
            .catch((error: any) => {
                console.error(error);
                enqueueSnackbar(dictionary.notification['error-logout'], {
                    variant: 'error',
                });
            });
    }, [signOut, enqueueSnackbar, dictionary.notification]);

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
                text: isAuthenticated
                    ? dictionary.nav.account
                    : dictionary.form.button.login,
                icon: <AccountCircle />,
                href: isAuthenticated ? undefined : Route.LOGIN,
            },
            ...(isAuthenticated
                ? [
                      {
                          text: dictionary.nav.logout,
                          icon: <LogoutIcon />,
                          onClick: handleLogout,
                      },
                  ]
                : []),
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
                icon: <GroupsIcon />,
                href: Route.COMMUNITY,
            },
            {
                text: dictionary.nav.timeline,
                icon: <TimelineIcon />,
                href: Route.TIMELINE,
            },
            {
                isDivider: true,
            },
        ],
        [dictionary, isAuthenticated, handleLogout],
    );

    const buttonCssClass = classNames({
        'hamburger-button': true,
        ...(buttonClassName ? { [buttonClassName]: true } : {}),
    });

    return (
        <>
            <IconButton
                className={buttonCssClass}
                onClick={() => setIsOpen(true)}
            >
                <MenuIcon />
            </IconButton>
            <Drawer
                anchor="right"
                open={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <div className="side-menu">
                    <List style={{ padding: 0 }}>
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
                    <Socials className="side-menu__socials" />
                    <Divider />
                    <h2>Composite</h2>
                    <p className="version">{`Version ${process.env.APP_VERSION}`}</p>
                </div>
            </Drawer>
        </>
    );
};
