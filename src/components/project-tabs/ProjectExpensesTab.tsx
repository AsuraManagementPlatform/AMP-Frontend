import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { ProjectExpenseList } from '@/components/tables/ProjectExpenseList';
import { CreateProjectExpenseModal } from '@/components/modals/project-expense/CreateProjectExpenseModal';
import { t } from 'i18next';

interface ProjectExpensesTabProps {
    projectId: string;
    projectBudget: number;
    projectCurrency: string;
}

export const ProjectExpensesTab: React.FC<ProjectExpensesTabProps> = ({
                                                                          projectId,
                                                                          projectBudget,
                                                                          projectCurrency
                                                                      }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <>
            <Card
                title={t('tab.project_expenses')}
                className="mb-6"
                headerActions={
                    <PrimaryActionButton
                        onClick={() => setIsCreateModalOpen(true)}
                        size="sm"
                    >
                        Adaugă cheltuială
                    </PrimaryActionButton>
                }
            >
                <ProjectExpenseList
                    project={projectId}
                    projectBudget={projectBudget}
                    projectCurrency={projectCurrency}
                    refreshTrigger={refreshTrigger}
                />
            </Card>

            {isCreateModalOpen && (
                <CreateProjectExpenseModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                    project={projectId}
                />
            )}
        </>
    );
};