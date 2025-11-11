import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { ProjectFundList } from '@/components/tables/ProjectFundList';
import { CreateProjectFundModal } from '@/components/modals/project-fund/CreateProjectFundModal';
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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <>
            <Card
                title={t('tab.project_funds')}
                className="mb-6"
                headerActions={
                    <PrimaryActionButton
                        onClick={() => setIsCreateModalOpen(true)}
                        size="sm"
                    >
                        Adaugă finanțare
                    </PrimaryActionButton>
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
                />
            )}
        </>
    );
};