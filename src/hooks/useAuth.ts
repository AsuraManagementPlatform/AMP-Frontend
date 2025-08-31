import { useContext } from 'react';
import { AuthContextType, User, UserGroup } from '@/types/index.types';
import {AuthContextContext} from "@/context/AuthContext.context.tsx";

/**
 * Custom hook for accessing authentication context
 * @throws Error if used outside AuthProvider
 * @returns Authentication context with user data, actions, and utilities
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContextContext);

    if (!context) {
        throw new Error(
            'useAuthHook must be used within an AuthProvider. ' +
            'Make sure your component is wrapped with <AuthProvider>.'
        );
    }

    return context;
};

/**
 * Hook for checking if user has specific group
 * @param userGroup - Required user group
 * @returns Whether user has the specified group
 */
export const useRequiredUserGroup = (userGroup: UserGroup): boolean => {
    const { checkUserGroup } = useAuth();
    return checkUserGroup(userGroup);
};

/**
 * Hook that returns authentication loading state
 * @returns Whether authentication is currently loading
 */
export const useAuthLoading = (): boolean => {
    const { isLoading } = useAuth();
    return isLoading;
};

/**
 * Hook for getting user profile information
 * @returns User profile data or null if not authenticated
 */
export const useUserProfile = (): User | null => {
    const { user, isAuthenticated } = useAuth();
    return isAuthenticated ? user : null;
};

/**
 * Hook for getting authentication error state
 * @returns Current error message or null if no error
 */
export const useAuthError = (): string | null => {
    const { error } = useAuth();
    return error;
};

/**
 * Hook for group-based conditional rendering
 * @param userGroups - Array of acceptable user groups
 * @returns Whether user has any of the specified user groups
 */
export const useHasAnyGroup = (userGroups: UserGroup[]): boolean => {
    const { hasAnyUserGroup } = useAuth();
    return hasAnyUserGroup(userGroups);
};

/**
 * Hook for checking if user has all specified user groups
 * @param userGroups - Array of required user groups
 * @returns Whether user has all specified user groups
 */
export const useHasAllGroups = (userGroups: UserGroup[]): boolean => {
    const { hasAllUserGroups } = useAuth();
    return hasAllUserGroups(userGroups);
};

/**
 * Hook for getting access token for API calls
 * @returns Current access token or null
 */
export const useAccessToken = (): string | null => {
    const { getAccessToken } = useAuth();
    return getAccessToken();
};