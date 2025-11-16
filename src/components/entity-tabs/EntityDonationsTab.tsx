import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { SelectOption } from '@/types/form.types';
import { t } from 'i18next';
import EntityDonationList from "@/components/tables/EntityDonationList.tsx";
import { CreateEntityDonationModal } from "@/components/modals/entity-donation/CreateEntityDonationModal.tsx";
import { EntityDonationStats } from "@/types/entity-donation.types.ts";
import projectService from '@/services/project.service';
import activityService from '@/services/activity.service';
import showToast from '@/components/ui/Toast';

interface EntityDonationsTabProps {
    entityId: string;
    entityName: string;
    organizationId: string;
    stats?: EntityDonationStats;
}

export const EntityDonationsTab: React.FC<EntityDonationsTabProps> = ({
                                                                          entityId,
                                                                          entityName,
                                                                          organizationId,
                                                                          stats,
                                                                      }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [projects, setProjects] = useState<SelectOption[]>([]);
    const [activities, setActivities] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                setLoading(true);

                const projectsResponse = await projectService.getList({
                    pageSize: 1000,
                    filters: {
                        organization_id: organizationId
                    }
                });

                const projectOptions: SelectOption[] = (projectsResponse.results || []).map(project => ({
                    label: project.name,
                    value: project.id
                }));

                setProjects(projectOptions);

                if (projectsResponse.results && projectsResponse.results.length > 0) {
                    const activitiesResponses = await Promise.all(
                        projectsResponse.results.map(project =>
                            activityService.getList({
                                pageSize: 1000,
                                filters: {
                                    project_id: project.id
                                }
                            })
                        )
                    );

                    const allActivities = activitiesResponses.flatMap(response => response.results || []);

                    const activityOptions: SelectOption[] = allActivities.map(activity => {
                        const project = projectsResponse.results?.find(p => p.id === activity.project);
                        return {
                            label: `${activity.title} (${project?.name || ''})`,
                            value: activity.id
                        };
                    });

                    setActivities(activityOptions);
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error loading dropdown data';
                showToast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadDropdownData();
    }, [organizationId]);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <>
            {stats && (
                <div className="grid-cols-1 md:grid-cols-4 gap-4 mb-6 flex justify-center">
                    <Card className="p-4">
                        <div className="text-2xl font-bold text-gray-900">{stats.totalAmount} RON</div>
                        <div className="text-sm text-gray-600">Total Donații</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-2xl font-bold text-gray-900">{stats.totalCount}</div>
                        <div className="text-sm text-gray-600">Număr Donații</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.averageAmount} RON
                        </div>
                        <div className="text-sm text-gray-600">Medie Donație</div>
                    </Card>
                </div>
            )}

            <Card
                title={t('label.entity_donation.donations_for_entity', { name: entityName })}
                className="mb-6"
                headerActions={
                    <PrimaryActionButton
                        onClick={() => setIsCreateModalOpen(true)}
                        size="sm"
                        disabled={loading}
                    >
                        {t('label.entity_donation.add_donation')}
                    </PrimaryActionButton>
                }
            >
                <EntityDonationList
                    entityId={entityId}
                    refreshTrigger={refreshTrigger}
                    pageSize={20}
                />
            </Card>

            {isCreateModalOpen && (
                <CreateEntityDonationModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                    entityId={entityId}
                    entities={[{ label: entityName, value: entityId }]}
                    projects={projects}
                    activities={activities}
                />
            )}
        </>
    );
};