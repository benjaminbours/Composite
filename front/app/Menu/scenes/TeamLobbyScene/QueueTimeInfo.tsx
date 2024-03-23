import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import styles from './SideSelector.module.scss';

dayjs.extend(duration);

interface Props {}

export const QueueTimeInfo: React.FC<Props> = ({}) => {
    const [queueTime, setQueueTime] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setQueueTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formattedTime = useMemo(() => {
        const durationTime = dayjs.duration(queueTime, 'seconds');
        const minutes = durationTime.minutes().toString().padStart(2, '0');
        const seconds = durationTime.seconds().toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }, [queueTime]);

    // TODO: Add estimated time in queue before match, but I need more data for this
    return (
        <div className={styles['queue-time-info']}>
            <h3>
                <span>Time in queue:</span> {formattedTime}
            </h3>
        </div>
    );
};
