'use client';
import React, { useContext, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import { AppContext } from '../MainApp';
import { MenuScene } from '../Menu/types';

/**
 * This page is only here to "please" next router, it's in fact just a redirect.
 * Should I better use a middleware? Don't know if with middleware I could catch
 * and manage the 404 in the MainApp.
 */
export const InvitePage: React.FC = ({}) => {
    const context = useContext(AppContext);
    const [isTokenValid, setIsTokenValid] = React.useState<boolean>(false);
    const [isChecking, setIsChecking] = React.useState<boolean>(true);
    const router = useRouter();
    const urlSearchParams = useSearchParams();
    const token = useMemo(
        () => urlSearchParams.get('token'),
        [urlSearchParams],
    );

    useEffect(() => {
        if (!token) {
            return;
        }
        setIsChecking(true);
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/check-invite/${token}`, {
            method: 'POST',
        })
            .then((res) => res.json())
            .then((isValid: boolean) => {
                setIsTokenValid(isValid);
                setIsChecking(false);
            });
    }, [token, router]);

    const shouldRedirectNotFound = useMemo(() => {
        return !token || (!isChecking && !isTokenValid);
    }, [token, isChecking, isTokenValid]);

    const shouldRedirectLobby = useMemo(() => {
        return isTokenValid && !isChecking;
    }, [isChecking, isTokenValid]);

    useEffect(() => {
        if (shouldRedirectNotFound) {
            context.setMenuScene(MenuScene.NOT_FOUND);
            notFound();
        }

        if (shouldRedirectLobby) {
            context.setMenuScene(MenuScene.TEAM_LOBBY);
        }
    }, [shouldRedirectNotFound, shouldRedirectLobby, context]);

    return <></>;
};
