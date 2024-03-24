import { Level } from '@benjaminbours/composite-api-client';
import IconButton from '@mui/material/IconButton';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React from 'react';
import Link from 'next/link';
import { Route } from '../../../types';
import { LevelPortal } from '../../../Menu/scenes/LevelPortal';

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
                <LevelPortal
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/thumbnails/level_${level.id}_thumbnail.png`}
                    name={level.name}
                />
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
                                disabled={disabled}
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
                            disabled={disabled}
                            onClick={() => onDelete(level.id, level.name)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </li>
                </ul>
            </div>
        </li>
    );
};
