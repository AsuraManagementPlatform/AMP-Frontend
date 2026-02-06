import { AuthInitOptions } from '@/types/index.types';

export const ROUTES = {
    // Pagina Principală
    HOME: '/',
    DASHBOARD: '/dashboard',

    // ERP Module (Projects & Activities)
    ERP_PROJECTS: '/erp/projects',
    ERP_PROJECT_DETAILS: '/erp/project/:projectId',
    ERP_ACTIVITIES: '/erp/activities',
    ERP_MEMBERSHIP_FEES: '/erp/membership-fees',
    ERP_VATS: '/erp/vats',

    // CRM Module (Users & Organization Management)
    CRM_ADMIN_PANEL: '/crm/admin',
    CRM_ORGANIZATIONS: '/crm/organizations',
    CRM_ORGANIZATION_DETAILS: '/crm/organization-details',
    CRM_ORGANIZATION_TEAM_MANAGEMENT: '/crm/organization/:organizationId/team',
    CRM_ORGANIZATION_MEMBER_PROFILE: '/crm/organization/:organizationId/team/member/:userId',
    CRM_CREATE_ORGANIZATION: '/crm/organizations/create',

    // CRM Module - Entity Management
    CRM_ENTITIES: '/crm/entities',
    CRM_ENTITY_CREATE: '/crm/entities/create',
    CRM_ENTITY_DETAILS: '/crm/entity/:entityId',
    CRM_DONATIONS: '/crm/donations',
    CRM_COMMUNICATIONS: '/crm/communications',
    CRM_VOTING_SESSIONS: '/crm/voting-sessions',
    CRM_GENERAL_ASSEMBLY: '/crm/general-assembly',
    CRM_GENERAL_ASSEMBLY_MEMBER_VIEW: '/crm/general-assembly/:id/vote',

    // Calendar (Standalone)
    CALENDAR: '/calendar',

    // Sondaje
    SONDAJE: '/sondaje',
    SONDAJ_DETAIL: '/sondaje/:id',
    SONDAJ_RESULTS: '/sondaje/:id/results',

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