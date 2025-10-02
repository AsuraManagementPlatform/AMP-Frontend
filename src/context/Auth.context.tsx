import {createContext, ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {AuthContextType, AuthState, User} from '@/types/index.types';
import * as React from "react";
import keycloakService, {keycloakInitOptions} from "@/services/keycloak.service";
import userService from "@/services/user.service";

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
        const userData = await userService.getCurrentUser();
        const newUserData = {
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
            groups: userData.groups,
            status: userData.status,
            organization_id: userData.organization_id,
            is_active: userData.is_active || true
        };

        setUser(newUserData);
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
                    console.error(refreshError);
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
        const finalRedirectUri = redirectUri || `${window.location.origin}/`;
        await keycloakService.login({ redirectUri: finalRedirectUri });
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        try {
            if (tokenRefreshIntervalRef.current) {
                clearInterval(tokenRefreshIntervalRef.current);
                tokenRefreshIntervalRef.current = null;
            }
            if (keycloakService.authenticated) {
                await keycloakService.logout({ 
                    redirectUri: window.location.origin + '/' 
                });
            } else {
                setUser(null);
                setAuthState(AuthState.UNAUTHENTICATED);
                setError(null);
                initializingRef.current = false;
            }
        } catch (error) {
            console.error('[Auth] Logout error:', error);
            setUser(null);
            setAuthState(AuthState.UNAUTHENTICATED);
            setError(null);
            initializingRef.current = false;
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/';
        }
    }, []);

    const refreshToken = useCallback(async (): Promise<boolean> => {
        if (!keycloakService.authenticated) return false;

        try {
            return await keycloakService.updateToken(30);
        } catch (error) {
            console.error(error);
            return false;
        }
    }, []);

    const getAccessToken = useCallback((): string | null => {
        return keycloakService.authenticated ? keycloakService.token || null : null;
    }, []);

    const hasAnyUserGroup = useCallback((userGroups: string[]): boolean => {
        if (authState !== AuthState.AUTHENTICATED || !user?.groups) {
            return false;
        }

        return userGroups.some(userGroup => user.groups.includes(userGroup));
    }, [authState, user]);

    const hasAllUserGroups = useCallback((userGroups: string[]): boolean => {
        if (authState !== AuthState.AUTHENTICATED || !user?.groups) {
            return false;
        }

        return userGroups.every(userGroup => user.groups.includes(userGroup));
    }, [authState, user]);

    const contextValue: AuthContextType = {
        authState,
        user,
        error,
        login,
        logout,
        refreshToken,
        fetchUserData,
        hasAnyUserGroup,
        hasAllUserGroups,
        isAuthenticated: authState === AuthState.AUTHENTICATED,
        isLoading: authState === AuthState.LOADING,
        hasError: authState === AuthState.ERROR,
        getAccessToken
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

