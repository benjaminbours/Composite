import {
    Level,
    LevelStatusEnum,
} from '@benjaminbours/composite-core-api-client';
import IconButton from '@mui/material/IconButton';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React from 'react';
import Link from 'next/link';
import { Route } from '../../../types';
import { LevelPortal } from '../../../Menu/scenes/LevelPortal';
import VerifiedIcon from '@mui/icons-material/Verified';

interface Props {
    level: Level;
    onDelete: (levelId: number, levelName: string) => void;
    disabled?: boolean;
}

export const LevelListItem: React.FC<Props> = ({
    level,
    onDelete,
    disabled,
}) => {
    return (
        <li className="level-list-item">
            <div className="level-list-item__image-container">
                <LevelPortal name={level.name} thumbnail={level.thumbnail} />
                <ul className="level-list-item__actions">
                    <li>
                        <Link
                            href={Route.LOBBY_LEVEL(level.id)}
                            passHref
                            legacyBehavior
                        >
                            <IconButton
                                size="small"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                color="inherit"
                                disabled={
                                    disabled ||
                                    level.status === LevelStatusEnum.Draft
                                }
                                title="Play level"
                            >
                                <SportsEsportsIcon />
                            </IconButton>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={Route.LEVEL_EDITOR(level.id)}
                            passHref
                            legacyBehavior
                        >
                            <IconButton
                                size="small"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                color="inherit"
                                disabled={disabled}
                                title="Edit level"
                            >
                                <EditIcon />
                            </IconButton>
                        </Link>
                    </li>
                    <li>
                        <IconButton
                            size="small"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            color="inherit"
                            disabled={
                                disabled ||
                                level.status === LevelStatusEnum.Published
                            }
                            title="Delete level"
                            onClick={() => onDelete(level.id, level.name)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </li>
                    {level.status === LevelStatusEnum.Published && (
                        <li>
                            <VerifiedIcon
                                style={{ padding: 5 }}
                                className="icon-important"
                                titleAccess="Published level"
                            />
                        </li>
                    )}
                </ul>
            </div>
        </li>
    );
};
