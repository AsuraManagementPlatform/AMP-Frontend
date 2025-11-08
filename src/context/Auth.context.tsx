import {createContext, ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {AuthContextType, AuthState, User} from '@/types/index.types';
import * as React from "react";
import keycloakService, {keycloakInitOptions} from "@/services/keycloak.service";
import userService from "@/services/user.service";
import { organizationService } from "@/services/organization.service";

interface AuthProviderProps {
    children: ReactNode;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

let authInitialized = false;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children } : AuthProviderProps) => {
    const [authState, setAuthState] = useState<AuthState>(AuthState.LOADING);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [organizationModules, setOrganizationModules] = useState<string[]>([]);

    const initializingRef = useRef<boolean>(false);
    const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchUserData = useCallback(async (): Promise<void> => {
        try {
            const userData = await userService.getCurrentUser();
            
            const newUserData = {
                id: userData.id,
                email: userData.email,
                fullName: userData.fullName,
                groups: userData.groups,
                status: userData.status,
                organizationId: userData.organizationId,
                organizationName: userData.organizationName,
                isActive: userData.isActive || true,
                isContributor: userData.isContributor
            };

            setUser(newUserData);

            if (userData.organizationId) {
                try {
                    const response = await organizationService.getById(userData.organizationId);
                    const organization = (response as any).organization || response;
                    setOrganizationModules(organization.activeModules || []);
                } catch {
                    setOrganizationModules([]);
                }
            } else {
                setOrganizationModules([]);
            }
        } catch (error: any) {
            if (error?.response?.status === 401 || 
                (error?.message && error.message.includes('Utilizatorul este dezactivat'))) {
                setError('Contul dvs. a fost dezactivat. Contactați administratorul pentru mai multe informații.');
                setAuthState(AuthState.ERROR);
                setUser(null);
                if (keycloakService.authenticated) {
                    await keycloakService.logout({ 
                        redirectUri: window.location.origin + '/' 
                    });
                }
                throw error;
            }
            throw error;
        }
    }, []);

    const initializeAuth = useCallback(async (): Promise<void> => {
        if (initializingRef.current || authInitialized) {
            return;
        }
        initializingRef.current = true;
        authInitialized = true;

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
        initializeAuth();

        return () => {
            if (tokenRefreshIntervalRef.current) {
                clearInterval(tokenRefreshIntervalRef.current);
            }
        };
    }, []);

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

    const refreshOrganizationModules = useCallback(async (): Promise<void> => {
        if (!user?.organizationId) {
            setOrganizationModules([]);
            return;
        }

        try {
            const response = await organizationService.getById(user.organizationId);
            const organization = (response as any).organization || response;
            setOrganizationModules(organization.activeModules || []);
        } catch {
            setOrganizationModules([]);
        }
    }, [user?.organizationId]);

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
        getAccessToken,
        hasERP: organizationModules.includes('ERP'),
        hasCRM: organizationModules.includes('CRM'),
        refreshOrganizationModules
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

