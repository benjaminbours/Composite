import { QueueInfo } from '@benjaminbours/composite-core';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import GroupsIcon from '@mui/icons-material/Groups';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import Badge from '@mui/material/Badge';

const YingYang: React.FC = () => (
    <svg className="ying-yang" viewBox="0 0 800 800">
        <g transform="translate(-491 -193)">
            <path
                className="black"
                d="M-466,32c0-220.8,179.2-400,400-400,110.4,0,200,89.6,200,200S44.4,32-66,32s-200,89.6-200,200,89.6,200,200,200C-286.8,432-466,252.8-466,32Z"
                transform="translate(859 527) rotate(-90)"
                fill="#000"
            />
            <path
                className="white"
                d="M-266,432c0-110.4,89.6-200,200-200S134,142.4,134,32,44.4-168-66-168c220.8,0,400,179.2,400,400S154.8,632-66,632C-176.4,632-266,542.4-266,432Z"
                transform="translate(659 527) rotate(-90)"
                fill="#fff"
            />
        </g>
    </svg>
);

function loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject();
        img.src = url;
    });
}

interface Props {
    name: string;
    src: string;
    isSelectedByTeamMate?: boolean;
    isSelectedByYou?: boolean;
    queueInfo?: QueueInfo;
}

const defaultImageUrl = '/images/crack_the_door.png';

export const LevelPortal: React.FC<Props> = ({
    name,
    src,
    isSelectedByTeamMate,
    isSelectedByYou,
    queueInfo,
}) => {
    const [imageUrl, setImageUrl] = useState(defaultImageUrl);

    useEffect(() => {
        loadImage(src)
            .catch(() => defaultImageUrl)
            .then((url) => {
                setImageUrl(url);
            });
    }, [src]);

    const cssClass = classNames({
        'level-portal': true,
        'level-portal--selected-by-team-mate': isSelectedByTeamMate,
        'level-portal--selected-by-you': isSelectedByYou,
    });

    return (
        <div className={cssClass}>
            <div className="level-portal__graphic-wrapper">
                <div
                    className="level-portal__image-container"
                    style={{ backgroundImage: `url("${imageUrl}")` }}
                />
                <div className="level-portal__border-container">
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                </div>
                <YingYang />
            </div>
            <p>{name}</p>
            {queueInfo !== undefined && (
                <div className="level-portal__queue-info">
                    <Badge badgeContent={String(queueInfo.all)}>
                        <GroupsIcon />
                    </Badge>
                    <Badge badgeContent={String(queueInfo.light)}>
                        <Brightness7Icon />
                    </Badge>
                    <Badge badgeContent={String(queueInfo.shadow)}>
                        <ModeNightIcon />
                    </Badge>
                </div>
            )}
        </div>
    );
};
