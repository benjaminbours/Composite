'use client';
// vendors
import React from 'react';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import HandymanIcon from '@mui/icons-material/Handyman';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Route } from '../types';
import IconButton from '@mui/material/IconButton';
import { useStoreState } from '../hooks';

interface Props {}

export const TopBar: React.FC<Props> = () => {
    const isAuthenticated = useStoreState(
        (state) => state.user.isAuthenticated,
    );
    return (
        <AppBar
            elevation={10}
            className="level-editor__app-bar top-bar"
            position="static"
        >
            <Toolbar className="top-bar__tool-bar">
                <Link href="/" className="top-bar__logo">
                    <h2>Composite</h2>
                </Link>
                <Divider orientation="vertical" flexItem />
                <Link
                    href={Route.HOME}
                    legacyBehavior
                    passHref
                    className="top-bar__logo"
                >
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<SportsEsportsIcon />}
                    >
                        Play
                    </Button>
                </Link>
                <Link
                    href={Route.LEVEL_EDITOR}
                    legacyBehavior
                    passHref
                    className="top-bar__logo"
                >
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<HandymanIcon />}
                    >
                        Editor
                    </Button>
                </Link>
                <div className="top-bar__account-container">
                    {isAuthenticated ? (
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            // onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                    ) : (
                        <Link href={Route.LOGIN} legacyBehavior passHref>
                            <Button
                                className="top-bar__login-button"
                                size="small"
                            >
                                Login
                            </Button>
                        </Link>
                    )}
                </div>
            </Toolbar>
        </AppBar>
    );
};
