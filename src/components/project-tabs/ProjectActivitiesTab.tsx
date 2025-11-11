import React, {useEffect, useState} from 'react';
import {Card} from '@/components/ui/Card';
import {PrimaryActionButton} from '@/components/ui/PrimaryActionButton';
import ActivityList from '@/components/tables/ActivityList';
import {CreateActivityModal} from '@/components/modals/activity/CreateActivityModal';
import {useAuth} from "@/hooks/useAuth.ts";
import showToast from "@/components/ui/Toast.tsx";
import projectService from "@/services/project.service.ts";
import {Project} from "@/types/project.types.ts";
import {t} from "i18next";

interface ProjectActivitiesTabProps {
    projectId: string;
}

export const ProjectActivitiesTab: React.FC<ProjectActivitiesTabProps> = ({ projectId }) => {
    const { user, hasAllUserGroups } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [canManageActivities, setCanManageActivities] = useState<boolean>(false);

    useEffect(() => {
        const loadProject = async () => {
            try {
                const project: Project = await projectService.getById(projectId);

                const isOrgAdmin = hasAllUserGroups(['ORGANIZATION_ADMIN']);
                const isProjectResponsible = project.budgetResponsible === user?.id;

                setCanManageActivities(isOrgAdmin || isProjectResponsible);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : t('toast.default_error_message');
                showToast.error(errorMessage);
            }
        };

        loadProject();
    }, [projectId, user?.id, hasAllUserGroups]);

    return (
        <>
            <Card
                title={t('label.activity.page_title')}
                className="mb-6"
                headerActions={
                    canManageActivities && (
                        <PrimaryActionButton
                            onClick={() => setIsCreateModalOpen(true)}
                            size="sm"
                        >
                            {t('label.activity.add_activity')}
                        </PrimaryActionButton>
                    )
                }
            >
                <ActivityList
                    project={projectId}
                    refreshTrigger={refreshTrigger}
                    canManageActivities={canManageActivities}
                />
            </Card>

            {isCreateModalOpen && (
                <CreateActivityModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                    project={projectId}
                />
            )}
        </>
    );
};