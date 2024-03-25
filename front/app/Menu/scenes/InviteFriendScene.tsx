// vendors
import classNames from 'classnames';
import React from 'react';
// project
import { CopyToClipBoardButton } from '../CopyToClipboardButton';

interface Props {
    inviteFriendRef: React.RefObject<HTMLDivElement>;
    actions: React.ReactNode;
    isMount: boolean;
    handleClickOnRandom: () => void;
    inviteFriendToken: string | undefined;
}

export const InviteFriendScene: React.FC<Props> = ({
    inviteFriendRef,
    actions,
    isMount,
    handleClickOnRandom,
    inviteFriendToken,
}) => {
    const cssClass = classNames({
        'content-container': true,
        'invite-friend-container': true,
        unmount: !isMount,
    });

    return (
        <div ref={inviteFriendRef} className={cssClass}>
            {actions}
            <h2 className="title-h1">Invite a friend</h2>
            <p>Send this link to your friend to automatically match with him</p>
            {/* <CopyToClipBoardButton
                color="white"
                text={`${process.env.NEXT_PUBLIC_URL}/invite?token=${
                    inviteFriendToken || 'incoming'
                }`}
            /> */}
            <p>Waiting for your friend to hit the link...</p>
            <div className="loader" />
            <p>
                Your friend is not showing up? There are currently X persons in
                the queue.
            </p>
            <button className="buttonRect white" onClick={handleClickOnRandom}>
                {`Let's play with a random person`}
            </button>
        </div>
    );
};
