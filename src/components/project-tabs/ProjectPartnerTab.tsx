import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { ProjectPartnerList } from '@/components/tables/ProjectPartnerList';
import { CreateProjectPartnerModal } from '@/components/modals/project-partner/CreateProjectPartnerModal';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';
import { t } from 'i18next';
import { Project } from '@/types/project.types';

interface ProjectPartnersTabProps {
    projectId: string;
    project?: Project;
}

export const ProjectPartnersTab: React.FC<ProjectPartnersTabProps> = ({
                                                                          projectId,
                                                                          project
                                                                      }) => {
    const { canManageProject } = useProjectPermissions(projectId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const formatCurrency = (value: number | undefined) => {
        return (value || 0).toLocaleString('ro-RO');
    };

    return (
        <>
            {project && (
                <Card className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">{t('label.project_partner.total_budget')}</p>
                            <p className="text-xl font-bold text-blue-600">
                                {formatCurrency(project.budget)} {project.currency}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <p className="text-sm text-gray-600">{t('label.project_partner.partners_budget')}</p>
                            <p className="text-xl font-bold text-orange-600">
                                {formatCurrency(project.partnersBudget)} {project.currency}
                            </p>
                            <p className="text-xs text-gray-500">
                                {project.partnersCount || 0} {t('label.project_partner.partners_count')}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">{t('label.project_partner.own_budget')}</p>
                            <p className="text-xl font-bold text-green-600">
                                {formatCurrency(project.ownBudget)} {project.currency}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <Card
                title={t('tab.project_partners')}
                className="mb-6"
                headerActions={
                    canManageProject && (
                        <PrimaryActionButton
                            onClick={() => setIsCreateModalOpen(true)}
                            size="sm"
                        >
                            {t('label.project_partner.add_partner')}
                        </PrimaryActionButton>
                    )
                }
            >
                <ProjectPartnerList
                    project={projectId}
                    refreshTrigger={refreshTrigger}
                />
            </Card>

            {isCreateModalOpen && (
                <CreateProjectPartnerModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                    project={projectId}
                />
            )}
        </>
    );
};