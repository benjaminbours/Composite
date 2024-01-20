import classNames from 'classnames';
import React from 'react';

interface Props {
    isMount: boolean;
    onHomeClick: () => void;
    notFoundRef: React.RefObject<HTMLDivElement>;
}

export const NotFoundScene: React.FC<Props> = ({
    isMount,
    onHomeClick,
    notFoundRef,
}) => {
    const cssClass = classNames({
        'not-found': true,
        unmount: !isMount,
    });

    return (
        <div ref={notFoundRef} className={cssClass}>
            <div className="content-container">
                <h2 className="title-h2">{`Oops! It seems like you're lost in the shadows.`}</h2>
                <h3>Find your light</h3>
                <button onClick={onHomeClick} className="buttonCircle white">
                    Home
                </button>
            </div>
        </div>
    );
};
