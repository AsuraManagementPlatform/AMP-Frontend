import {createContext, ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {AuthContextType, AuthState, User} from '@/types/index.types';
import * as React from "react";
import keycloakService, {keycloakInitOptions, logoutUser} from "@/services/keycloak.service";
import userService from "@/services/user.service.ts";

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children } : AuthProviderProps) => {
    const [authState, setAuthState] = useState<AuthState>(AuthState.LOADING);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    const initializingRef = useRef<boolean>(false);
    const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchUserData = useCallback(async (): Promise<void> => {
        try {
            const userData = await userService.getCurrentUser();
            const newUserData = {
                id: userData.id,
                username: userData.email,
                fullName: userData.full_name,
                userGroups: userData.groups
            };

            setUser(newUserData);
        } catch (apiError) {
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

    const logout = useCallback(async (): Promise<void> => {
        try {
            if (keycloakService.authenticated && keycloakService.token) {
                await logoutUser(keycloakService.token, keycloakService.refreshToken);
            }
        } catch (error) {
            // Continue with local logout even if token revocation fails
        }

        if (tokenRefreshIntervalRef.current) {
            clearInterval(tokenRefreshIntervalRef.current);
            tokenRefreshIntervalRef.current = null;
        }

        // Clear Keycloak tokens completely
        keycloakService.token = undefined;
        keycloakService.refreshToken = undefined;
        keycloakService.idToken = undefined;
        keycloakService.authenticated = false;
        keycloakService.tokenParsed = undefined;
        keycloakService.refreshTokenParsed = undefined;
        keycloakService.idTokenParsed = undefined;

        // Clear browser storage
        localStorage.clear();
        sessionStorage.clear();

        setUser(null);
        setAuthState(AuthState.UNAUTHENTICATED);
        setError(null);
        
        // Prevent re-initialization
        initializingRef.current = false;
        
        window.location.href = '/';
    }, []);

    const refreshToken = useCallback(async (): Promise<boolean> => {
        if (!keycloakService.authenticated) return false;

        try {
            return await keycloakService.updateToken(30);
        } catch (error) {
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

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
