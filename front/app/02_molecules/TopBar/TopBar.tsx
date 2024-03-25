// vendors
import React from 'react';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import HandymanIcon from '@mui/icons-material/Handyman';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
// import PeopleIcon from '@mui/icons-material/People';
import { Route } from '../../types';
import { UserMenu } from './UserMenu';
import { getDictionary } from '../../../getDictionary';
// import { SideMenu } from '../../03_organisms/SideMenu';

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
}

export const TopBar: React.FC<Props> = ({ dictionary }) => {
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
                        {dictionary.nav.play}
                    </Button>
                </Link>
                <Link
                    href={Route.LEVEL_EDITOR_ROOT}
                    legacyBehavior
                    passHref
                    className="top-bar__logo"
                >
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<HandymanIcon />}
                    >
                        {dictionary.nav.editor}
                    </Button>
                </Link>
                {/* <Link
                    href={Route.LEVEL_EDITOR_ROOT}
                    legacyBehavior
                    passHref
                    className="top-bar__logo"
                >
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<PeopleIcon />}
                    >
                        {dictionary.nav.community}
                    </Button>
                </Link> */}
                <UserMenu dictionary={dictionary} />
                {/* <SideMenu dictionary={dictionary} /> */}
            </Toolbar>
        </AppBar>
    );
};
