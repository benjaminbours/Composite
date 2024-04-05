// vendors
import React, { useMemo } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import HandymanIcon from '@mui/icons-material/Handyman';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SaveIcon from '@mui/icons-material/Save';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import CameraIcon from '@mui/icons-material/Camera';
import PublishIcon from '@mui/icons-material/Publish';
import TextField from '@mui/material/TextField';
import { DropDownMenu } from './DropDownMenu';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { getDictionary } from '../../../../getDictionary';
import { UserMenu } from '../../../02_molecules/TopBar/UserMenu';
import { CircularProgress } from '@mui/material';
import { Route } from '../../../types';
import { LevelStatusEnum } from '@benjaminbours/composite-api-client';

interface Props {
    level_id: string;
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
    isSaving: boolean;
    levelName: string;
    levelStatus: LevelStatusEnum;
    hasErrorWithLevelName: boolean;
    onLevelNameChange: (e: any) => void;
    onSave: (isFork?: boolean, status?: LevelStatusEnum) => void;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TopBarLevelEditor: React.FC<Props> = ({
    dictionary,
    levelName,
    levelStatus,
    onLevelNameChange,
    onSave,
    hasErrorWithLevelName,
    isSaving,
    setIsModalOpen,
    level_id,
}) => {
    const actionItems = useMemo(() => {
        return [
            {
                icon: <SaveIcon fontSize="small" />,
                text: level_id === 'new' ? 'Create' : 'Update',
                onClick: () => onSave(),
            },
            {
                icon: <ForkRightIcon fontSize="small" />,
                text: 'Fork (Save as new)',
                onClick: () => onSave(true),
                disabled: level_id === 'new',
            },
            {
                icon: <PublishIcon fontSize="small" />,
                text:
                    levelStatus === LevelStatusEnum.Published
                        ? 'Unpublish'
                        : 'Publish',
                disabled: level_id === 'new',
                onClick: () =>
                    onSave(
                        false,
                        levelStatus === LevelStatusEnum.Published
                            ? LevelStatusEnum.Draft
                            : LevelStatusEnum.Published,
                    ),
            },
        ];
    }, [onSave, levelStatus, level_id]);

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
                    value={levelName}
                    onChange={onLevelNameChange}
                    error={hasErrorWithLevelName}
                    disabled={isSaving}
                />
                <Divider orientation="vertical" flexItem />
                <DropDownMenu
                    buttonText="Save"
                    items={actionItems}
                    icon={
                        isSaving ? (
                            <CircularProgress size={20} />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )
                    }
                    disabled={isSaving}
                />
                <UserMenu
                    dictionary={dictionary}
                    disabled={isSaving}
                    onLoginClick={() => setIsModalOpen(true)}
                />
            </Toolbar>
        </AppBar>
    );
};
