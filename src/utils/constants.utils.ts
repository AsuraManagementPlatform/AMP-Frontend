import {AuthInitOptions} from '@/types/index.types';

export const ROUTES = {
    HOME: '/',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    CREATE_ORGANIZATION: '/organizations/create',
    ORGANIZATIONS: '/organizations',
    ADMIN_ORGANIZATIONS: '/admin/organizations',
    ORGANIZATION_DETAILS: '/organization-details',
    PROJECTS: '/projects',
    ACTIVITIES: '/activities',
    CALENDAR: '/calendar',
    ADMIN_PANEL: '/admin',
    SETTINGS: '/settings',
    NOT_FOUND: '/404',
    REPORTS: '/reports',
} as const;

export const KEYCLOAK_INIT_OPTIONS: AuthInitOptions = {
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    pkceMethod: 'S256',
    checkLoginIframe: false,
    responseMode: 'fragment',
    enableLogging: false,
};
