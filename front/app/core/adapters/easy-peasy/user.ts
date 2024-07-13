// vendors
import { Thunk, thunk, Action, action, computed, Computed } from 'easy-peasy';
// our libs
import type {
    LoginDto,
    TokensDto,
    User,
    RegisterDto,
    AuthControllerUpdatePasswordRequest,
} from '@benjaminbours/composite-api-client';
import { servicesContainer } from '../../frameworks';
import { ApiClient } from '../../services';

import type { StoreModel } from '../../frameworks/easy-peasy';
// import { Role } from '../../entities';
// import { setCookie } from '../../utils';

/**
 * Store responsible to manage user specific logic / behavior shared between applications
 * So far:
 * - Session
 * - Sign in
 * - Sign out
 * - Sign up (client only, maybe its doesn't belong here)
 */

export interface UserModel {
    // properties
    currentUser: User | undefined;
    isGuest: boolean;
    isRetrievingSession: boolean;
    isAuthenticated: Computed<UserModel, boolean>;
    // actions
    setIsGuest: Action<UserModel, boolean>;
    setCurrentUser: Action<UserModel, User | undefined>;
    setIsRetrievingSession: Action<UserModel, boolean>;
    // thunks
    retrieveSession: Thunk<UserModel, void, any, StoreModel, Promise<boolean>>; // return if a session has been retrieved or not
    signIn: Thunk<UserModel, LoginDto, any, StoreModel, Promise<User>>;
    signOut: Thunk<UserModel, void, any, StoreModel, Promise<boolean>>;
    updatePassword: Thunk<
        UserModel,
        AuthControllerUpdatePasswordRequest,
        any,
        StoreModel,
        Promise<boolean>
    >;
    resetPassword: Thunk<UserModel, string, any, StoreModel, Promise<boolean>>;
    resendEmailValidation: Thunk<
        UserModel,
        string,
        any,
        StoreModel,
        Promise<boolean>
    >;
    signUp: Thunk<UserModel, RegisterDto, any, StoreModel, Promise<void>>;
    getProfile: Thunk<UserModel, void, any, StoreModel, Promise<User>>;
}

let refreshSessionTimeOutId: any;

// deepcode ignore HardcodedNonCryptoSecret: this is not a secret, it's a storage key for local storage
const SESSION_KEY = 'composite-session';

function setupSession(session: TokensDto) {
    const apiClient = servicesContainer.get(ApiClient);

    // save token into service
    apiClient.token = session.accessToken;
    // save token into session
    if (session) {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
        console.error('No session provided');
    }
    // setCookie('composite-session', JSON.stringify(session), 7);

    // initiate refresh token
    refreshSessionTimeOutId = setTimeout(
        async () => {
            const newSession =
                await apiClient.defaultApi.authControllerRefreshToken({
                    headers: {
                        Authorization: `Bearer ${session.refreshToken}`,
                    },
                });
            setupSession(newSession);
        },
        14 * 60 * 1000,
    ); // 14 min
}

function clearSession() {
    const apiClient = servicesContainer.get(ApiClient);

    // clear client token
    apiClient.token = undefined;
    // setCookie('composite-session', '', -1);
    // clear session
    window.localStorage.removeItem(SESSION_KEY);

    if (refreshSessionTimeOutId) {
        clearTimeout(refreshSessionTimeOutId);
    }
}

export const userModel: UserModel = {
    // properties
    isAuthenticated: computed((state) => Boolean(state.currentUser)),
    isRetrievingSession: true,
    isGuest: false,
    currentUser: undefined,
    // actions
    setCurrentUser: action((state, payload) => {
        state.currentUser = payload;
    }),
    setIsRetrievingSession: action((state, payload) => {
        state.isRetrievingSession = payload;
    }),
    setIsGuest: action((state, payload) => {
        state.isGuest = payload;
    }),
    // thunks
    retrieveSession: thunk(async (actions) => {
        actions.setIsRetrievingSession(true);
        // inject services
        const apiClient = servicesContainer.get(ApiClient);

        // 1. Retrieve an eventual previous token in session
        console.debug('retrieve session');
        const session: TokensDto = (() => {
            try {
                const session = window.localStorage.getItem(SESSION_KEY);
                if (session) {
                    return JSON.parse(session);
                }
            } catch (error) {
                console.error(
                    'Error retrieving session or parsing session',
                    error,
                );
                throw error;
            }
        })();

        // 2a. If there is try to refresh the session
        if (session && session.accessToken && session.refreshToken) {
            try {
                const newSession =
                    await apiClient.defaultApi.authControllerRefreshToken({
                        headers: {
                            Authorization: `Bearer ${session.refreshToken}`,
                        },
                    });

                setupSession(newSession);

                const profile = await actions.getProfile();

                // save user
                actions.setCurrentUser(profile);

                return true;
            } catch (error) {
                // clear session
                window.localStorage.removeItem(SESSION_KEY);
                console.error(error);
                return false;
            } finally {
                actions.setIsRetrievingSession(false);
            }
        }
        // 2b. If there is not, do nothing and return no session retrieved
        console.debug('no session to be retrieved');
        actions.setIsRetrievingSession(false);
        return false;
    }),

    signIn: thunk(async (actions, loginDto) => {
        // inject services
        const apiClient = servicesContainer.get(ApiClient);

        // authenticate
        const session = await apiClient.defaultApi.authControllerLogin({
            loginDto,
        });

        // if authenticate successful, save session into local storage and JWT to api client
        setupSession(session);

        // call user profile
        const profile = await actions.getProfile();

        // save user
        actions.setCurrentUser(profile);

        return profile;
    }),

    signOut: thunk(async (actions, _) => {
        // inject services
        const apiClient = servicesContainer.get(ApiClient);

        const response = await apiClient.defaultApi.authControllerLogout();

        clearSession();
        // clear currentUser
        actions.setCurrentUser(undefined);

        return response;
    }),

    resetPassword: thunk(async (_actions, userEmail) => {
        // inject services
        const apiClient = servicesContainer.get(ApiClient);

        const response = await apiClient.defaultApi.authControllerResetPassword(
            {
                resetPasswordDto: {
                    email: userEmail,
                },
            },
        );

        return response;
    }),

    updatePassword: thunk(
        async (_actions, { resetPasswordToken, updatePasswordDto }) => {
            // inject services
            const apiClient = servicesContainer.get(ApiClient);

            const response =
                await apiClient.defaultApi.authControllerUpdatePassword({
                    resetPasswordToken,
                    updatePasswordDto,
                });

            return response;
        },
    ),

    resendEmailValidation: thunk(async (_actions, userEmail) => {
        // inject services
        const apiClient = servicesContainer.get(ApiClient);

        const response = await apiClient.defaultApi.authControllerConfirmResend(
            {
                resetPasswordDto: {
                    email: userEmail,
                },
            },
        );

        return response;
    }),

    signUp: thunk(async (_actions, payload) => {
        // inject services
        const apiClient = servicesContainer.get(ApiClient);

        console.log(apiClient);

        await apiClient.defaultApi.authControllerRegister({
            registerDto: payload,
        });
        // .then((res) => res.data);

        // setupSession(session);

        // const profile = await actions.getProfile();
        // return profile;
    }),

    getProfile: thunk(async (actions) => {
        // inject services
        const apiClient = servicesContainer.get(ApiClient);
        const profile = await apiClient.defaultApi.usersControllerGetProfile();
        // save user
        actions.setCurrentUser(profile);

        return profile;
    }),
};
