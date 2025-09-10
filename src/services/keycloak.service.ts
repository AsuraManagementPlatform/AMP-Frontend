import Keycloak from 'keycloak-js';
import { KeycloakConfig, AuthInitOptions } from '@/types/index.types';
import { KEYCLOAK_INIT_OPTIONS } from '@/utils/constants.utils';

const keycloakConfig: KeycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'default',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'default'
};

const keycloakService = new Keycloak(keycloakConfig);

export const getTokenInfo = () => {
    if (!keycloakService.authenticated || !keycloakService.tokenParsed) {
        return null;
    }

    const tokenParsed = keycloakService.tokenParsed;
    return {
        sub: tokenParsed.sub,
        email: tokenParsed.email,
        preferred_username: tokenParsed.preferred_username,
        name: tokenParsed.name,
        given_name: tokenParsed.given_name,
        family_name: tokenParsed.family_name,
        realm_access: tokenParsed.realm_access,
        resource_access: tokenParsed.resource_access,
        groups: tokenParsed.groups,
        exp: tokenParsed.exp,
        iat: tokenParsed.iat,
        expiresIn: tokenParsed.exp ? (tokenParsed.exp * 1000 - Date.now()) / 1000 : null
    };
};

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
    return {
        environment: import.meta.env.MODE,
        keycloakUrl: keycloakConfig.url,
        realm: keycloakConfig.realm,
        clientId: keycloakConfig.clientId,
    } as const;
};

/**
 * Logout user - revoke Keycloak access token and refresh token
 */
export const logoutUser = async (accessToken?: string, refreshToken?: string): Promise<void> => {
    const keycloakUrl = keycloakConfig.url;
    const realm = keycloakConfig.realm;
    const clientId = keycloakConfig.clientId;
    
    const tokenToRevoke = accessToken || keycloakService.token;
    const refreshTokenToRevoke = refreshToken || keycloakService.refreshToken;
    
    if (!keycloakUrl || !realm || !clientId || !tokenToRevoke) {
        return;
    }

    const revokeUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/revoke`;
    
    try {
        const accessFormData = new URLSearchParams();
        accessFormData.append('token', tokenToRevoke);
        accessFormData.append('token_type_hint', 'access_token');
        accessFormData.append('client_id', clientId);

        await fetch(revokeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: accessFormData
        });

        if (refreshTokenToRevoke) {
            const refreshFormData = new URLSearchParams();
            refreshFormData.append('token', refreshTokenToRevoke);
            refreshFormData.append('token_type_hint', 'refresh_token');
            refreshFormData.append('client_id', clientId);

            await fetch(revokeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: refreshFormData
            });
        }

        if (keycloakService.authenticated) {
            await keycloakService.logout();
        }
    } catch (error) {
        // Silent fail for logout
    }
};

export const keycloakInitOptions: AuthInitOptions = KEYCLOAK_INIT_OPTIONS;

export default keycloakService;