import React from 'react';
import { getDictionary } from '../../../getDictionary';
import Rating from '@mui/material/Rating';
import CircularProgress from '@mui/material/CircularProgress';
import classNames from 'classnames';

interface Props {
    className?: string;
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
    labels: { [index: string]: string };
    icon?: React.ReactNode;
    hover: number;
    rating: number | null;
    onHover: (value: number) => void;
    onChange: (value: number) => void;
    isUpdating: boolean;
}

export const LevelRating: React.FC<Props> = ({
    className,
    dictionary,
    labels,
    icon,
    hover,
    rating,
    onHover,
    onChange,
    isUpdating,
}) => {
    const cssClass = classNames({
        'end-level-scene__rating': true,
        ...(className ? { [className]: true } : {}),
    });

    return (
        <div className="end-level-scene__rating-container">
            <Rating
                className={cssClass}
                value={rating}
                precision={0.5}
                onChange={(_event, newValue) => {
                    if (newValue) {
                        onChange(newValue);
                    }
                }}
                getLabelText={(value: number) => {
                    return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
                }}
                onChangeActive={(_event, newHover) => {
                    onHover(newHover);
                }}
                emptyIcon={icon}
                icon={icon}
            />
            {rating !== null && (
                <div style={{ mixBlendMode: 'difference', color: 'white' }}>
                    {labels[hover !== -1 ? hover : rating]}
                </div>
            )}
            {isUpdating && (
                <CircularProgress
                    className="end-level-scene__rating-loader"
                    size={20}
                />
            )}
        </div>
    );
};
