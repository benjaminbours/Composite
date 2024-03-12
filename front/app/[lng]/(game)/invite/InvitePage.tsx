'use client';
import React, { useContext, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, notFound } from 'next/navigation';
import { MenuScene } from '../../../types';
import { AppContext } from '../../../WithMainApp';

/**
 * This page is only here to "please" next router, it's in fact just a redirect.
 * Should I better use a middleware? Don't know if with middleware I could catch
 * and manage the 404 in the MainApp.
 */
export const InvitePage: React.FC = ({}) => {
    const { mainAppContext } = useContext(AppContext);
    const [isTokenValid, setIsTokenValid] = React.useState<boolean>(false);
    const [isChecking, setIsChecking] = React.useState<boolean>(true);
    const [enteredLobby, setEnteredLobby] = React.useState<boolean>(false);
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

    useEffect(() => {
        if (enteredLobby) {
            return;
        }

        if (!token || (!isChecking && !isTokenValid)) {
            mainAppContext?.setMenuScene(MenuScene.NOT_FOUND);
            notFound();
        }

        if (isTokenValid && !isChecking) {
            setEnteredLobby(true);
            mainAppContext?.enterTeamLobby(token);
        }
    }, [mainAppContext, enteredLobby, router, isChecking, isTokenValid, token]);

    return <></>;
};
