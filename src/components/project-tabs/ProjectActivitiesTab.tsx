import React, {useState} from 'react';
import {Card} from '@/components/ui/Card';
import {PrimaryActionButton} from '@/components/ui/PrimaryActionButton';
import ActivityTableWithNested from '@/components/tables/ActivityTableWithNested';
import {CreateActivityModal} from '@/components/modals/activity/CreateActivityModal';
import {useProjectPermissions} from '@/hooks/useProjectPermissions';
import {t} from "i18next";

interface ProjectActivitiesTabProps {
    projectId: string;
}

export const ProjectActivitiesTab: React.FC<ProjectActivitiesTabProps> = ({ projectId }) => {
    const { canManageProject } = useProjectPermissions(projectId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <>
            <Card
                title={t('label.activity.page_title')}
                className="mb-6"
                headerActions={
                    canManageProject && (
                        <PrimaryActionButton
                            onClick={() => setIsCreateModalOpen(true)}
                            size="sm"
                        >
                            {t('label.activity.add_activity')}
                        </PrimaryActionButton>
                    )
                }
            >
                <ActivityTableWithNested
                    project={projectId}
                    refreshTrigger={refreshTrigger}
                    canManageActivities={canManageProject}
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