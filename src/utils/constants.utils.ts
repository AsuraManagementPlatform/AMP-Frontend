import {UserGroup, AuthInitOptions} from '@/types/index.types';

export const USER_GROUPS = UserGroup;

export const ROUTES = {
    HOME: '/',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    CREATE_ORGANIZATION: '/organizations/create',
    ORGANIZATIONS: '/organizations',
    PROJECTS: '/projects',
    NOT_FOUND: '/404',
} as const;

export const API_ENDPOINTS = {
    USERS: '/api/user',
    ORGANIZATIONS: '/api/organization',
    PROJECTS: '/api/project',
} as const;

export const DEFAULTS = {
    TOKEN_REFRESH_INTERVAL: 60000,
    API_TIMEOUT: 10000,
    ITEMS_PER_PAGE: 20,
} as const;

export const KEYCLOAK_INIT_OPTIONS: AuthInitOptions = {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    pkceMethod: 'S256',
    checkLoginIframe: false,
    responseMode: 'fragment',
    enableLogging: import.meta.env.DEV,
};

export const REQUIRED_ENV_VARS = [
    'VITE_KEYCLOAK_URL',
    'VITE_KEYCLOAK_REALM',
    'VITE_KEYCLOAK_CLIENT_ID',
    'VITE_API_BASE_URL'
] as const;

export const TOAST_CONFIG = {
    position: 'top-right' as const,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};