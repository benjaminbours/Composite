import React, { useCallback } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { getDictionary } from '../../../getDictionary';
import { useStoreActions } from '../../hooks/store';
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import { Route } from '../../types';

interface Props {
    isAuthenticated: boolean;
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
}

export const UserMenu: React.FC<Props> = ({ isAuthenticated, dictionary }) => {
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
                <Link href={Route.LOGIN} legacyBehavior passHref>
                    <Button className="top-bar__login-button" size="small">
                        Login
                    </Button>
                </Link>
            )}
        </div>
    );
};
