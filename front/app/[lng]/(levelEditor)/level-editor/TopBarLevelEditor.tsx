// vendors
import React, { useMemo } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HandymanIcon from '@mui/icons-material/Handyman';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SaveIcon from '@mui/icons-material/Save';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CameraIcon from '@mui/icons-material/Camera';
import TextField from '@mui/material/TextField';
import { DropDownMenu } from './DropDownMenu';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { getDictionary } from '../../../../getDictionary';
import { UserMenu } from '../../../02_molecules/TopBar/UserMenu';
import { CircularProgress } from '@mui/material';
import { Route } from '../../../types';

interface Props {
    level_id: string;
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
    isSaving: boolean;
    onResetCamera: () => void;
    onToggleCollisionArea: () => void;
    onStartTestMode: () => void;
    onResetPlayersPosition: () => void;
    onSwitchPlayer: () => void;
    levelName: string;
    hasErrorWithLevelName: boolean;
    onLevelNameChange: (e: any) => void;
    onSave: (isFork?: boolean) => void;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TopBarLevelEditor: React.FC<Props> = ({
    dictionary,
    levelName,
    onSwitchPlayer,
    onLevelNameChange,
    onResetCamera,
    onToggleCollisionArea,
    onStartTestMode,
    onResetPlayersPosition,
    onSave,
    hasErrorWithLevelName,
    isSaving,
    setIsModalOpen,
    level_id,
}) => {
    const actionItems = useMemo(() => {
        return [
            {
                icon: <VisibilityIcon fontSize="small" />,
                text: 'Display collision area',
                onClick: onToggleCollisionArea,
            },
            {
                icon: <CameraIcon fontSize="small" />,
                text: 'Reset camera',
                onClick: onResetCamera,
            },
            {
                icon: <SportsEsportsIcon fontSize="small" />,
                text: 'Test / Play',
                onClick: onStartTestMode,
            },
            {
                icon: <SwitchAccountIcon fontSize="small" />,
                text: 'Switch player',
                onClick: onSwitchPlayer,
            },
            {
                icon: <RestartAltIcon fontSize="small" />,
                text: 'Reset players position',
                onClick: onResetPlayersPosition,
            },
        ];
    }, [
        onResetCamera,
        onToggleCollisionArea,
        onStartTestMode,
        onResetPlayersPosition,
        onSwitchPlayer,
    ]);

    return (
        <AppBar className="level-editor__app-bar top-bar" position="static">
            <Toolbar className="top-bar__tool-bar">
                <Link href="/" className="top-bar__logo">
                    <h2>Composite</h2>
                </Link>
                <Divider orientation="vertical" flexItem />
                <HandymanIcon />
                <h4>Level&nbsp;editor</h4>
                <Divider orientation="vertical" flexItem />
                <Link href={Route.LEVEL_EDITOR_ROOT} legacyBehavior passHref>
                    <Button size="small" startIcon={<KeyboardArrowLeftIcon />}>
                        Back
                    </Button>
                </Link>
                <Divider orientation="vertical" flexItem />
                <TextField
                    variant="standard"
                    placeholder="Level name"
                    value={levelName.toUpperCase()}
                    onChange={onLevelNameChange}
                    error={hasErrorWithLevelName}
                    disabled={isSaving}
                />
                <Divider orientation="vertical" flexItem />
                <DropDownMenu
                    buttonText="Actions"
                    items={actionItems}
                    icon={<KeyboardArrowDownIcon />}
                    disabled={isSaving}
                />
                {isSaving ? (
                    <CircularProgress size={30} />
                ) : (
                    <Button
                        size="small"
                        variant="contained"
                        endIcon={<SaveIcon />}
                        onClick={() => onSave()}
                    >
                        Save
                    </Button>
                )}
                {level_id !== 'new' && (
                    <>
                        {isSaving ? (
                            <CircularProgress size={30} />
                        ) : (
                            <Button
                                size="small"
                                variant="contained"
                                endIcon={<ForkRightIcon />}
                                onClick={() => onSave(true)}
                            >
                                Fork
                            </Button>
                        )}
                    </>
                )}
                <UserMenu
                    dictionary={dictionary}
                    disabled={isSaving}
                    onLoginClick={() => setIsModalOpen(true)}
                />
            </Toolbar>
        </AppBar>
    );
};
