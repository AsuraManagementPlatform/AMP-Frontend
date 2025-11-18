import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { ProjectFundList } from '@/components/tables/ProjectFundList';
import { CreateProjectFundModal } from '@/components/modals/project-fund/CreateProjectFundModal';
import activityService from '@/services/activity.service';
import entityService from '@/services/entity.service';
import projectService from '@/services/project.service';
import showToast from '@/components/ui/Toast';
import { SelectOption } from '@/types/form.types';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';
import { t } from 'i18next';

interface ProjectFundsTabProps {
    projectId: string;
    projectBudget: number;
    projectCurrency: string;
}

export const ProjectFundsTab: React.FC<ProjectFundsTabProps> = ({
                                                                    projectId,
                                                                    projectBudget,
                                                                    projectCurrency
                                                                }) => {
    const { canManageProject } = useProjectPermissions(projectId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [activities, setActivities] = useState<SelectOption[]>([]);
    const [entities, setEntities] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                setLoading(true);

                const project = await projectService.getById(projectId);

                const [activitiesResponse, entitiesResponse] = await Promise.all([
                    activityService.getList({
                        pageSize: 1000,
                        filters: {
                            project_id: projectId
                        }
                    }),
                    entityService.getList({
                        pageSize: 1000,
                        filters: {
                            organization_id: project.organization
                        }
                    })
                ]);

                const activityOptions: SelectOption[] = (activitiesResponse.results || []).map(activity => ({
                    label: activity.title,
                    value: activity.id
                }));

                const entityOptions: SelectOption[] = (entitiesResponse.results || []).map(entity => ({
                    label: entity.name,
                    value: entity.id
                }));

                setActivities(activityOptions);
                setEntities(entityOptions);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error loading dropdown data';
                showToast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadDropdownData();
    }, [projectId]);

    return (
        <>
            <Card
                title={t('tab.project_funds')}
                className="mb-6"
                headerActions={
                    canManageProject && (
                        <PrimaryActionButton
                            onClick={() => setIsCreateModalOpen(true)}
                            size="sm"
                            disabled={loading}
                        >
                            Adaugă finanțare
                        </PrimaryActionButton>
                    )
                }
            >
                <ProjectFundList
                    project={projectId}
                    projectBudget={projectBudget}
                    projectCurrency={projectCurrency}
                    refreshTrigger={refreshTrigger}
                />
            </Card>

            {isCreateModalOpen && (
                <CreateProjectFundModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                    project={projectId}
                    activities={activities}
                    entities={entities}
                />
            )}
        </>
    );
};