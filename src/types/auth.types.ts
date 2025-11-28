import {User} from "@/types/index.types.ts";

export const UserGroup = {
    ADMIN: 'admin',
    ORGANIZATION_ADMIN: 'organization_admin',
    MANAGER: 'manager',
    EMPLOYEE: 'employee',
    MEMBER: 'member',
    VOLUNTEER: 'volunteer'
}

export type UserGroup = typeof UserGroup[keyof typeof UserGroup];

export const AuthState = {
    LOADING: 'loading',
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated',
    ERROR: 'error'
}

export type AuthState = typeof AuthState[keyof typeof AuthState];

export interface AuthContextType {
    authState: AuthState;
    user: User | null;
    error: string | null;

    login: (redirectUri?: string) => void;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    fetchUserData: (useCache?: boolean) => Promise<void>;

    hasAnyUserGroup: (userGroup: string[]) => boolean;
    hasAllUserGroups: (userGroup: string[]) => boolean;

    isAuthenticated: boolean;
    isLoading: boolean;
    hasError: boolean;

    getAccessToken: () => string | null;

    hasERP: boolean;
    hasCRM: boolean;
    refreshOrganizationModules: () => Promise<void>;
}

export interface KeycloakConfig {
    url: string;
    realm: string;
    clientId: string;
}

export interface AuthInitOptions {
    onLoad?: 'login-required' | 'check-sso';
    silentCheckSsoRedirectUri?: string;
    pkceMethod?: 'S256';
    checkLoginIframe?: boolean;
    responseMode?: 'fragment' | 'query';
    enableLogging?: boolean;
}