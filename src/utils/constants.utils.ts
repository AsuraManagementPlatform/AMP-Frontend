import {AuthInitOptions} from '@/types/index.types';

export const ROUTES = {
    // Pagina Principală
    HOME: '/',
    DASHBOARD: '/dashboard',
    
    // ERP Module (Projects & Activities)
    ERP_PROJECTS: '/erp/projects',
    ERP_ACTIVITIES: '/erp/activities',
    
    // CRM Module (Users & Organization Management)
    CRM_ADMIN_PANEL: '/crm/admin',
    CRM_ORGANIZATIONS: '/crm/organizations', 
    CRM_ORGANIZATION_DETAILS: '/crm/organization-details',
    CRM_CREATE_ORGANIZATION: '/crm/organizations/create',
    
    // Calendar (Standalone)
    CALENDAR: '/calendar',
    
    // User Profile
    PROFILE: '/profile',
    SETTINGS: '/settings',
    
    // Legacy routes (for compatibility - redirects)
    PROJECTS: '/erp/projects',
    ACTIVITIES: '/erp/activities',
    ADMIN_PANEL: '/crm/admin',
    ORGANIZATIONS: '/crm/organizations',
    CREATE_ORGANIZATION: '/crm/organizations/create',
    ORGANIZATION_DETAILS: '/crm/organization-details',
    ADMIN_ORGANIZATIONS: '/crm/organizations',
    
    // Error pages
    NOT_FOUND: '/404',
    REPORTS: '/reports',
} as const;

export const KEYCLOAK_INIT_OPTIONS: AuthInitOptions = {
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false,
    responseMode: 'fragment',
    enableLogging: true,
};
