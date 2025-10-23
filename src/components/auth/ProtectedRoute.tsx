import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserGroup } from '@/types/index.types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserGroup[];
    requireModule?: 'ERP' | 'CRM';
    redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    requireModule,
    redirectTo = '/dashboard'
}) => {
    const { user, isAuthenticated, isLoading, hasERP, hasCRM } = useAuth();
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }
    
    if (!isAuthenticated || !user) {
        return <Navigate to="/" replace />;
    }
    
    const userGroups = user.groups || [];
    const hasAllowedRole = allowedRoles.some(role => 
        userGroups.includes(role as string)
    );
    
    if (!hasAllowedRole) {
        return <Navigate to={redirectTo} replace />;
    }

    if (requireModule) {
        const hasModule = requireModule === 'ERP' ? hasERP : hasCRM;
        if (!hasModule) {
            return <Navigate to={redirectTo} replace />;
        }
    }
    
    return <>{children}</>;
};
export const usePermissions = () => {
    const { user } = useAuth();
    
    const userGroups = user?.groups || [];
    
    const isAdmin = userGroups.includes(UserGroup.ADMIN);
    const isOrgAdmin = userGroups.includes(UserGroup.ORGANIZATION_ADMIN);
    const isMember = userGroups.includes(UserGroup.MEMBER);
    
    return {
        isAdmin,
        isOrgAdmin,
        isMember,
        userGroups,
        canCreateOrganizations: isAdmin,
        canCreateOrgAdmins: isAdmin,
        canViewHighLevelStats: isAdmin,
        canManageProjects: isOrgAdmin,
        canViewOrgStats: isOrgAdmin,
        canViewOrgBudgets: isOrgAdmin,
        canViewLimitedInfo: isMember && !isOrgAdmin && !isAdmin,
    };
};
