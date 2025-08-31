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

export interface User {
    id: string;
    username: string;
    fullName: string;
    userGroups: UserGroup[];
}

export interface AuthContextType {
    authState: AuthState;
    user: User | null;
    error: string | null;

    login: (redirectUri?: string) => void;
    logout: (redirectUri?: string) => void;
    refreshToken: () => Promise<boolean>;
    fetchUserData: () => Promise<void>;

    checkUserGroup: (userGroup: UserGroup) => boolean;
    hasAnyUserGroup: (userGroup: string[]) => boolean;
    hasAllUserGroups: (userGroup: string[]) => boolean;

    isAuthenticated: boolean;
    isLoading: boolean;
    hasError: boolean;

    getAccessToken: () => string | null;
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