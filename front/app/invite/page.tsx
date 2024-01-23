import type { Metadata } from 'next';
import { Suspense } from 'react';
import { InvitePage } from './InvitePage';

export const metadata: Metadata = {
    title: 'Composite - The game - Invite',
    description:
        'You can invite a friend to play with you or play with a random person.',
};

export default function Invite() {
    return (
        <>
            <Suspense>
                <InvitePage />
            </Suspense>
        </>
    );
}
