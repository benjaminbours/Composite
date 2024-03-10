'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { servicesContainer } from '../../../core/frameworks';
import { ApiClient } from '../../../core/services';
import { useStoreState } from '../../../hooks';
import Link from 'next/link';
import { Route } from '../../../types';
import Button from '@mui/material/Button';
import { getDictionary } from '../../../../getDictionary';
import { usePathname } from 'next/navigation';
import { Level } from '@benjaminbours/composite-api-client';
import { LevelListItem } from './LevelListItem';
import CircularProgress from '@mui/material/CircularProgress';
import {
    ConfirmDialogContextProvider,
    useConfirmDialogContext,
} from '../../../contexts';
import { useSnackbar } from 'notistack';
import { generateErrorNotification } from '../../../utils/errors/generateErrorNotification';

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
    isCurrentUserList?: boolean;
    authorId?: number;
}

const withConfirmDialogProvider = (Component: React.FC<Props>) => {
    const Wrapper = (props: Props) => {
        return (
            <ConfirmDialogContextProvider>
                <Component {...props} />
            </ConfirmDialogContextProvider>
        );
    };
    return Wrapper;
};

export const LevelList: React.FC<Props> = withConfirmDialogProvider(
    ({ authorId, isCurrentUserList, dictionary }) => {
        const { enqueueSnackbar } = useSnackbar();
        const [levels, setLevels] = useState<Level[]>([]);
        const [isLoading, setIsLoading] = useState(false);
        const [isDeleting, setIsDeleting] = useState(false);
        const confirmDialogContext = useConfirmDialogContext();
        const currentUser = useStoreState((state) => state.user.currentUser);
        const isRetrievingSession = useStoreState(
            (state) => state.user.isRetrievingSession,
        );
        const path = usePathname();

        useEffect(() => {
            const apiClient = servicesContainer.get(ApiClient);

            if (isCurrentUserList && currentUser) {
                apiClient.defaultApi
                    .levelsControllerFindAll({ author: String(currentUser.id) })
                    .then((levels) => {
                        console.log('levels', levels);
                        setLevels(levels);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
                return;
            } else if (authorId && !isCurrentUserList) {
                // TODO:
                // apiClient.defaultApi
                //     .levelsControllerFindAll({ author: String(authorId) })
                //     .then((levels) => {
                //         console.log('levels', levels);
                //     });
            }
        }, [isCurrentUserList, currentUser, authorId]);

        const handleDeleteLevel = useCallback(
            (levelId: number, levelName: string) => {
                console.log(confirmDialogContext);

                confirmDialogContext
                    .showConfirmation({
                        title: dictionary['level-editor-dashboard'][
                            'delete-confirmation'
                        ].title,
                        // TODO: investigate a way to translate string and to add html tags such as bold inside
                        message: dictionary['level-editor-dashboard'][
                            'delete-confirmation'
                        ].description.replace('{{levelName}}', `${levelName}`),
                        cancelText: dictionary.common['cancel-text'],
                        confirmText: dictionary.common['confirm-text'],
                    })
                    .then((hasConfirmed) => {
                        if (!hasConfirmed) {
                            return;
                        }
                        setIsDeleting(true);
                        const apiClient = servicesContainer.get(ApiClient);
                        apiClient.defaultApi
                            .levelsControllerRemove({ id: String(levelId) })
                            .then((_level) => {
                                setLevels((prev) => {
                                    const next = [...prev];
                                    const index = next.findIndex(
                                        (level) => level.id === levelId,
                                    );
                                    next.splice(index, 1);
                                    return next;
                                });
                                enqueueSnackbar(
                                    dictionary.common.notification[
                                        'success-level-deleted'
                                    ],
                                    {
                                        variant: 'success',
                                    },
                                );
                            })
                            .catch(async (error) => {
                                console.error(error);
                                const errorData = await error.response.json();
                                enqueueSnackbar(
                                    generateErrorNotification(
                                        errorData,
                                        dictionary.common,
                                    ),
                                    {
                                        variant: 'error',
                                    },
                                );
                            })
                            .finally(() => {
                                setIsDeleting(false);
                                confirmDialogContext.closeConfirmation();
                            });
                    });
            },
            [dictionary, confirmDialogContext, enqueueSnackbar],
        );

        if (isLoading || isRetrievingSession) {
            return (
                <div className="level-list__not-logged">
                    <CircularProgress />
                </div>
            );
        }

        if (isCurrentUserList && !currentUser) {
            return (
                <div className="level-list__not-logged">
                    <p>Login to load your levels</p>
                    <Link
                        href={`${Route.LOGIN}?from=${path}`}
                        legacyBehavior
                        passHref
                    >
                        <Button
                            className="top-bar__login-button"
                            variant="contained"
                            size="large"
                        >
                            {dictionary.common.form.button.login}
                        </Button>
                    </Link>
                    <p>Or create a new one from scratch</p>
                    <Link
                        href={Route.LEVEL_EDITOR('new')}
                        legacyBehavior
                        passHref
                    >
                        <Button variant="contained" size="large">
                            {dictionary.common.nav['create-level']}
                        </Button>
                    </Link>
                </div>
            );
        }

        return (
            <>
                <Link href={Route.LEVEL_EDITOR('new')} legacyBehavior passHref>
                    <Button variant="contained" size="large">
                        {dictionary.common.nav['create-level']}
                    </Button>
                </Link>
                <ul className="level-list">
                    {levels.map((level) => (
                        <LevelListItem
                            key={level.id}
                            level={level}
                            onDelete={handleDeleteLevel}
                            disabled={isDeleting}
                        />
                    ))}
                </ul>
            </>
        );
    },
);
