import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import projectService from '@/services/project.service';
import showToast from '@/components/ui/Toast';
import { t } from 'i18next';

export const useProjectPermissions = (projectId: string) => {
    const { user, hasAllUserGroups } = useAuth();
    const [canManageProject, setCanManageProject] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkPermissions = async () => {
            try {
                setIsLoading(true);
                const project = await projectService.getById(projectId);

                const isOrgAdmin = hasAllUserGroups(['ORGANIZATION_ADMIN']);
                const isProjectResponsible = project.budgetResponsible === user?.id;

                setCanManageProject(isOrgAdmin || isProjectResponsible);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : t('toast.default_error_message');
                showToast.error(errorMessage);
                setCanManageProject(false);
            } finally {
                setIsLoading(false);
            }
        };

        if (projectId && user?.id) {
            checkPermissions();
        }
    }, [projectId, user?.id, hasAllUserGroups]);

    return { canManageProject, isLoading };
};
