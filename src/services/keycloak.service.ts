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
        const timeToExpiry = keycloakService.tokenParsed?.exp 
            ? (keycloakService.tokenParsed.exp * 1000 - Date.now()) / 1000 
            : 'unknown';
        console.log(`[KEYCLOAK] Token expires in ${timeToExpiry} s`);
        console.log('[Keycloak] Token expired, attempting refresh...');
    };
}

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
        // Calculate time until expiry
        expiresIn: tokenParsed.exp ? (tokenParsed.exp * 1000 - Date.now()) / 1000 : null
    };
};

export const logTokenInfo = () => {
    if (import.meta.env.DEV && keycloakService.authenticated) {
        const tokenInfo = getTokenInfo();
        console.log('[Keycloak] Token info:', tokenInfo);
    }
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

/**
 * Logout user - revoke Keycloak access token and refresh token
 */
export const logoutUser = async (accessToken?: string, refreshToken?: string): Promise<void> => {
    const keycloakUrl = keycloakConfig.url;
    const realm = keycloakConfig.realm;
    const clientId = keycloakConfig.clientId;
    
    // Use tokens from keycloak service if not provided
    const tokenToRevoke = accessToken || keycloakService.token;
    const refreshTokenToRevoke = refreshToken || keycloakService.refreshToken;
    
    if (!keycloakUrl || !realm || !clientId) {
        console.warn('[Keycloak] Configuration missing, skipping token revocation');
        return;
    }

    if (!tokenToRevoke) {
        console.warn('[Keycloak] No access token available for revocation');
        return;
    }

    const revokeUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/revoke`;
    
    try {
        // Revoke access token
        const accessFormData = new URLSearchParams();
        accessFormData.append('token', tokenToRevoke);
        accessFormData.append('token_type_hint', 'access_token');
        accessFormData.append('client_id', clientId);

        const accessResponse = await fetch(revokeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: accessFormData
        });

        if (!accessResponse.ok) {
            console.warn('[Keycloak] Access token revocation failed:', accessResponse.status, accessResponse.statusText);
        } else {
            console.log('[Keycloak] Access token revoked successfully');
        }

        // Revoke refresh token if available
        if (refreshTokenToRevoke) {
            const refreshFormData = new URLSearchParams();
            refreshFormData.append('token', refreshTokenToRevoke);
            refreshFormData.append('token_type_hint', 'refresh_token');
            refreshFormData.append('client_id', clientId);

            const refreshResponse = await fetch(revokeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: refreshFormData
            });

            if (!refreshResponse.ok) {
                console.warn('[Keycloak] Refresh token revocation failed:', refreshResponse.status, refreshResponse.statusText);
            } else {
                console.log('[Keycloak] Refresh token revoked successfully');
            }
        }

        // Logout from Keycloak service
        if (keycloakService.authenticated) {
            await keycloakService.logout();
        }
    } catch (error) {
        console.warn('[Keycloak] Token revocation request failed:', error);
    }
};

export const keycloakInitOptions: AuthInitOptions = KEYCLOAK_INIT_OPTIONS;

export default keycloakService;