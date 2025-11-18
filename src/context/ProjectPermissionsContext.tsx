import React, { createContext, useContext, ReactNode } from 'react';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';

interface ProjectPermissionsContextType {
    canManageProject: boolean;
    isLoading: boolean;
}

const ProjectPermissionsContext = createContext<ProjectPermissionsContextType | undefined>(undefined);

interface ProjectPermissionsProviderProps {
    projectId: string;
    children: ReactNode;
}

export const ProjectPermissionsProvider: React.FC<ProjectPermissionsProviderProps> = ({ projectId, children }) => {
    const { canManageProject, isLoading } = useProjectPermissions(projectId);

    return (
        <ProjectPermissionsContext.Provider value={{ canManageProject, isLoading }}>
            {children}
        </ProjectPermissionsContext.Provider>
    );
};

export const useProjectPermissionsContext = () => {
    const context = useContext(ProjectPermissionsContext);
    if (context === undefined) {
        return { canManageProject: false, isLoading: false };
    }
    return context;
};
