import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { ProjectPartnerList } from '@/components/tables/ProjectPartnerList';
import { CreateProjectPartnerModal } from '@/components/modals/project-partner/CreateProjectPartnerModal';
import { useProjectPermissions } from '@/hooks/useProjectPermissions';
import { t } from 'i18next';

interface ProjectPartnersTabProps {
    projectId: string;
}

export const ProjectPartnersTab: React.FC<ProjectPartnersTabProps> = ({
                                                                          projectId
                                                                      }) => {
    const { canManageProject } = useProjectPermissions(projectId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <>
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