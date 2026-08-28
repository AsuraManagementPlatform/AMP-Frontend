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
    const [userNotFoundInDatabase, setUserNotFoundInDatabase] = useState<boolean>(false);
    const [organizationModules, setOrganizationModules] = useState<string[]>([]);
    const [modulesLoaded, setModulesLoaded] = useState<boolean>(false);

    const initializingRef = useRef<boolean>(false);
    const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const USER_CACHE_KEY = 'auth_user_cache';
    const USER_CACHE_EXPIRY = 'auth_user_cache_expiry';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const getCachedUser = useCallback((): User | null => {
        try {
            const cached = localStorage.getItem(USER_CACHE_KEY);
            const expiry = localStorage.getItem(USER_CACHE_EXPIRY);
            
            if (!cached || !expiry) return null;
            
            if (Date.now() > parseInt(expiry)) {
                localStorage.removeItem(USER_CACHE_KEY);
                localStorage.removeItem(USER_CACHE_EXPIRY);
                return null;
            }
            
            return JSON.parse(cached);
        } catch {
            return null;
        }
    }, []);

    const setCachedUser = useCallback((userData: User): void => {
        try {
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
            localStorage.setItem(USER_CACHE_EXPIRY, (Date.now() + CACHE_DURATION).toString());
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    const clearCachedUser = useCallback((): void => {
        localStorage.removeItem(USER_CACHE_KEY);
        localStorage.removeItem(USER_CACHE_EXPIRY);
    }, []);

    const loadOrganizationModules = useCallback(async (organizationId?: string | null): Promise<void> => {
        if (!organizationId) {
            setOrganizationModules([]);
            setModulesLoaded(true);
            return;
        }

        try {
            const response = await organizationService.getById(organizationId);
            const organization = (response as any).organization || response;
            setOrganizationModules(organization.activeModules || []);
        } catch {
            setOrganizationModules([]);
        } finally {
            setModulesLoaded(true);
        }
    }, []);

    const fetchUserData = useCallback(async (useCache: boolean = true): Promise<void> => {
        try {
            if (useCache) {
                const cachedUser = getCachedUser();
                if (cachedUser) {
                    setUser(cachedUser);
                    void loadOrganizationModules(cachedUser.organizationId);
                    return;
                }
            }

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
            setCachedUser(newUserData);

            void loadOrganizationModules(userData.organizationId);
        } catch (error: any) {
            clearCachedUser();
            if (error?.message && error.message.includes('user_not_found_in_database')) {
                setUserNotFoundInDatabase(true);
                setError('toast.auth.user_not_found_in_database');
                setAuthState(AuthState.ERROR);
                setUser(null);
                throw error;
            }
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
    }, [getCachedUser, setCachedUser, clearCachedUser, loadOrganizationModules]);

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
                try {
                    await keycloakService.updateToken(-1);
                } catch {
                    clearCachedUser();
                    await keycloakService.logout({ 
                        redirectUri: window.location.origin + '/' 
                    });
                    return;
                }
                
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
    }, [fetchUserData, clearCachedUser]);

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
            clearCachedUser();
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
            clearCachedUser();
            setUser(null);
            setAuthState(AuthState.UNAUTHENTICATED);
            setError(null);
            initializingRef.current = false;
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/';
        }
    }, [clearCachedUser]);

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
        await loadOrganizationModules(user?.organizationId);
    }, [user?.organizationId, loadOrganizationModules]);

    const contextValue: AuthContextType = {
        authState,
        user,
        error,
        userNotFoundInDatabase,
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
        modulesLoaded,
        refreshOrganizationModules
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

