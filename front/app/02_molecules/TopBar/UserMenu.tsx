'use client';
import React, { useCallback, useMemo } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { getDictionary } from '../../../getDictionary';
import { useStoreActions, useStoreState } from '../../hooks/store';
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import { Route } from '../../types';

interface Props {
    disabled?: boolean;
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
    onLoginClick?: () => void;
}

export const UserMenu: React.FC<Props> = ({
    dictionary,
    disabled,
    onLoginClick,
}) => {
    const isAuthenticated = useStoreState(
        (state) => state.user.isAuthenticated,
    );
    const { enqueueSnackbar } = useSnackbar();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const signOut = useStoreActions((store) => store.user.signOut);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
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
        setAnchorEl(null);
    }, [signOut, enqueueSnackbar, dictionary.notification]);

    const loginButton = useMemo(() => {
        const button = (
            <button
                disabled={disabled}
                className="buttonRect"
                onClick={onLoginClick}
            >
                {dictionary.form.button.login}
            </button>
        );

        if (onLoginClick) {
            return button;
        }

        return (
            <Link href={Route.LOGIN} legacyBehavior passHref>
                {button}
            </Link>
        );
    }, [disabled, dictionary, onLoginClick]);

    return (
        <div className="top-bar__account-container">
            {isAuthenticated ? (
                <>
                    <IconButton
                        size="small"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleClick}
                        color="inherit"
                        disabled={disabled}
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="demo-positioned-menu"
                        aria-labelledby="demo-positioned-button"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <MenuItem onClick={handleClose}>
                            {dictionary.nav.profile}
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            {dictionary.nav.logout}
                        </MenuItem>
                    </Menu>
                </>
            ) : (
                loginButton
            )}
        </div>
    );
};
