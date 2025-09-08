import Keycloak from 'keycloak-js';
import { KeycloakConfig, AuthInitOptions } from '@/types/index.types';
import { KEYCLOAK_INIT_OPTIONS } from '@/utils/constants.utils';

const keycloakConfig: KeycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'default',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'default'
};

const keycloakService = new Keycloak(keycloakConfig);

if (import.meta.env.DEV) {
    keycloakService.onReady = (authenticated: boolean) => {
        console.log(`[Keycloak] Ready. Authenticated: ${authenticated}`);
    };

    keycloakService.onAuthSuccess = () => {
        console.log('[Keycloak] Authentication successful');
    };

    keycloakService.onAuthError = (errorData: unknown) => {
        console.error('[Keycloak] Authentication error:', errorData);
    };

    keycloakService.onAuthRefreshSuccess = () => {
        console.log('[Keycloak] Token refresh successful');
    };

    keycloakService.onAuthRefreshError = () => {
        console.warn('[Keycloak] Token refresh failed');
    };

    keycloakService.onTokenExpired = () => {
        console.log('[Keycloak] Token expired, attempting refresh...');
    };
}

export const getAuthHeader = (): Record<string, string> => {
    if (!keycloakService.authenticated || !keycloakService.token) {
        return {};
    }
    return { Authorization: `Bearer ${keycloakService.token}` };
};

export const isTokenValid = (): boolean => {
    return (keycloakService.authenticated ?? false) && !keycloakService.isTokenExpired();
};

export const getEnvironmentInfo = () => {
    if (import.meta.env.PROD) {
        return { environment: 'production' } as const;
    }

    return {
        environment: import.meta.env.MODE,
        keycloakUrl: keycloakConfig.url,
        realm: keycloakConfig.realm,
        clientId: keycloakConfig.clientId,
    } as const;
};

export const keycloakInitOptions: AuthInitOptions = KEYCLOAK_INIT_OPTIONS;

export default keycloakService;