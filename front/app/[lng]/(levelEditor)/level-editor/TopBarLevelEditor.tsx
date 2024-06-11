// vendors
import React, { useMemo } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import HandymanIcon from '@mui/icons-material/Handyman';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VerifiedIcon from '@mui/icons-material/Verified';
import SaveIcon from '@mui/icons-material/Save';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import TextField from '@mui/material/TextField';
import { DropDownMenu } from './DropDownMenu';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { getDictionary } from '../../../../getDictionary';
import { CircularProgress } from '@mui/material';
import { Route } from '../../../types';
import { LevelStatusEnum } from '@benjaminbours/composite-api-client';
import { YingYang } from '../../../Menu/scenes/TeamLobbyScene/YingYang';
import { SideMenu } from '../../../03_organisms/SideMenu';

interface Props {
    level_id: string;
    levelStatus: LevelStatusEnum;
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
    isPlaying: boolean;
    isSaving: boolean;
    levelName: string;
    hasErrorWithLevelName: boolean;
    onLevelNameChange: (e: any) => void;
    handleClickOnPublish: () => void;
    onSave: (isFork?: boolean, status?: LevelStatusEnum) => void;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TopBarLevelEditor: React.FC<Props> = ({
    dictionary,
    levelStatus,
    levelName,
    onLevelNameChange,
    onSave,
    hasErrorWithLevelName,
    isSaving,
    isPlaying,
    setIsModalOpen,
    handleClickOnPublish,
    level_id,
}) => {
    const actionItems = useMemo(() => {
        return [
            {
                icon: <SaveIcon fontSize="small" />,
                text: level_id === 'new' ? 'Create' : 'Update',
                onClick: () => onSave(),
                disabled: levelStatus === LevelStatusEnum.Published,
            },
            {
                icon: <ForkRightIcon fontSize="small" />,
                text: 'Fork (Save as new)',
                onClick: () => onSave(true),
                disabled: level_id === 'new',
            },
            {
                icon: <VerifiedIcon fontSize="small" />,
                text: 'Publish',
                disabled:
                    level_id === 'new' ||
                    levelStatus === LevelStatusEnum.Published,
                onClick: handleClickOnPublish,
            },
        ];
    }, [onSave, level_id, levelStatus, handleClickOnPublish]);

    return (
        <AppBar className="level-editor__app-bar top-bar" position="static">
            <Toolbar className="top-bar__tool-bar">
                <Link href="/" className="top-bar__logo">
                    <YingYang />
                    <h3>Composite</h3>
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
                    disabled={
                        isSaving || levelStatus === LevelStatusEnum.Published
                    }
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
                    disabled={isSaving || isPlaying}
                />
                {levelStatus === LevelStatusEnum.Published && (
                    <Chip
                        icon={<VerifiedIcon />}
                        color="primary"
                        label="Published level"
                    />
                )}
                <SideMenu
                    buttonClassName="top-bar__hamburger-button"
                    dictionary={dictionary}
                />
            </Toolbar>
        </AppBar>
    );
};
