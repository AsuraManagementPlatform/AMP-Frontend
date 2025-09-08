import {createContext, ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {AuthContextType, AuthState, User} from '@/types/index.types';
import * as React from "react";
import keycloakService, {keycloakInitOptions} from "@/services/keycloak.service";
import userService from "@/services/user.service.ts";

interface AuthProviderProps {
    children: ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContextContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children } : AuthProviderProps) => {
    const [authState, setAuthState] = useState<AuthState>(AuthState.LOADING);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    const initializingRef = useRef<boolean>(false);
    const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchUserData = useCallback(async (): Promise<void> => {
        console.log('[Auth] Fetching user data from backend');
        try {
            const userData = await userService.getCurrentUser();
            setUser({
                id: userData.id,
                username: userData.username,
                fullName: userData.fullName,
                userGroups: userData.userGroups
            });
        } catch (apiError) {
            console.error('[Auth] Failed to fetch user data:', apiError);
            throw new Error('Failed to fetch user data from backend');
        }
    }, []);

    const initializeAuth = useCallback(async (): Promise<void> => {
        if (initializingRef.current) return;
        initializingRef.current = true;

        try {
            setError(null);

            const authenticated = await keycloakService.init(keycloakInitOptions);

            if (authenticated) {
                await fetchUserData();
                setAuthState(AuthState.AUTHENTICATED);
                setupTokenRefresh();
            } else {
                setUser(null);
                setAuthState(AuthState.UNAUTHENTICATED);
            }
        } catch (initError) {
            console.error('[Auth] Initialization failed:', initError);
            const errorMessage = initError instanceof Error
                ? initError.message
                : 'Authentication initialization failed';
            setError(errorMessage);
            setAuthState(AuthState.ERROR);
            setUser(null);
        } finally {
            initializingRef.current = false;
        }
    }, [fetchUserData]);

    const setupTokenRefresh = useCallback((): void => {
        if (tokenRefreshIntervalRef.current) {
            clearInterval(tokenRefreshIntervalRef.current);
        }

        tokenRefreshIntervalRef.current = setInterval(async () => {
            if (keycloakService.authenticated && keycloakService.isTokenExpired(30)) {
                try {
                    await keycloakService.updateToken(30);
                } catch (refreshError) {
                    console.error('[Auth] Token refresh failed:', refreshError);
                    logout();
                }
            }
        }, 30000);
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            await initializeAuth();
        };

        initAuth();

        return () => {
            if (tokenRefreshIntervalRef.current) {
                clearInterval(tokenRefreshIntervalRef.current);
            }
        };
    }, [initializeAuth]);

    const login = useCallback(async (redirectUri?: string): Promise<void> => {
        const finalRedirectUri = redirectUri || `${window.location.origin}/dashboard`;
        await keycloakService.login({ redirectUri: finalRedirectUri });
    }, []);

    const logout = useCallback(async (redirectUri?: string): Promise<void> => {
        if (tokenRefreshIntervalRef.current) {
            clearInterval(tokenRefreshIntervalRef.current);
            tokenRefreshIntervalRef.current = null;
        }

        setUser(null);
        setAuthState(AuthState.UNAUTHENTICATED);
        setError(null);

        const finalRedirectUri = redirectUri || window.location.origin;
        await keycloakService.logout({ redirectUri: finalRedirectUri });
    }, []);

    const refreshToken = useCallback(async (): Promise<boolean> => {
        if (!keycloakService.authenticated) return false;

        try {
            return await keycloakService.updateToken(30);
        } catch (error) {
            console.error('[Auth] Manual token refresh failed:', error);
            return false;
        }
    }, []);

    const getAccessToken = useCallback((): string | null => {
        return keycloakService.authenticated ? keycloakService.token || null : null;
    }, []);

    const checkUserGroup = useCallback((userGroup: string): boolean => {
        if (authState !== AuthState.AUTHENTICATED || !user?.userGroups) {
            return false;
        }

        return user.userGroups.includes(userGroup);
    }, [authState, user]);

    const hasAnyUserGroup = useCallback((userGroups: string[]): boolean => {
        if (authState !== AuthState.AUTHENTICATED || !user?.userGroups) {
            return false;
        }

        return userGroups.some(userGroup => user.userGroups.includes(userGroup));
    }, [authState, user]);

    const hasAllUserGroups = useCallback((userGroups: string[]): boolean => {
        if (authState !== AuthState.AUTHENTICATED || !user?.userGroups) {
            return false;
        }

        return userGroups.every(userGroup => user.userGroups.includes(userGroup));
    }, [authState, user]);

    const contextValue: AuthContextType = {
        authState,
        user,
        error,
        login,
        logout,
        refreshToken,
        fetchUserData,
        checkUserGroup,
        hasAnyUserGroup,
        hasAllUserGroups,
        isAuthenticated: authState === AuthState.AUTHENTICATED,
        isLoading: authState === AuthState.LOADING,
        hasError: authState === AuthState.ERROR,
        getAccessToken
    };

    return <AuthContextContext.Provider value={contextValue}>{children}</AuthContextContext.Provider>;
};
