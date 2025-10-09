import { UserGroup } from '@/types/auth.types';

export const getProjectStatusColor = (status: string): string => {
    switch (status) {
        case 'ACTIVE': return 'green';
        case 'PLANNING': return 'blue';
        case 'ON_HOLD': return 'yellow';
        case 'COMPLETED': return 'green';
        case 'CANCELLED': return 'red';
        default: return 'gray';
    }
};

export const getActivityStatusColor = (status: string): string => {
    switch (status) {
        case 'COMPLETED': return 'green';
        case 'IN_PROGRESS': return 'blue';
        case 'PLANNED': return 'yellow';
        case 'CANCELLED': return 'red';
        default: return 'gray';
    }
};

export const getProjectStatusText = (status: string): string => {
    switch (status) {
        case 'ACTIVE': return 'Activ';
        case 'PLANNING': return 'Planificare';
        case 'ON_HOLD': return 'Suspendat';
        case 'COMPLETED': return 'Finalizat';
        case 'CANCELLED': return 'Anulat';
        default: return status;
    }
};

export const getActivityStatusText = (status: string): string => {
    switch (status) {
        case 'COMPLETED': return 'Finalizat';
        case 'IN_PROGRESS': return 'În progres';
        case 'PLANNED': return 'Planificat';
        case 'CANCELLED': return 'Anulat';
        default: return status;
    }
};

export const getUserDisplayName = (user: any): string => {
    if (!user) return 'Utilizator';
    return user.full_name || user.email;
};

export const getUserRoleLabel = (groups: string[] | string | undefined): string => {
    if (!groups) return 'Necunoscut';
    
    const groupArray = Array.isArray(groups) ? groups : [groups];
    const firstGroup = groupArray[0]?.toLowerCase();
    
    switch (firstGroup) {
        case UserGroup.ADMIN:
            return 'Administrator';
        case UserGroup.ORGANIZATION_ADMIN:
            return 'Administrator organizație';
        case UserGroup.EMPLOYEE:
            return 'Angajat';
        case UserGroup.MANAGER:
            return 'Manager';
        case UserGroup.MEMBER:
            return 'Membru';
        case UserGroup.VOLUNTEER:
            return 'Voluntar';
        default:
            return firstGroup || 'Necunoscut';
    }
};