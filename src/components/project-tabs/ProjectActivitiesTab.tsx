import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import ActivityList from '@/components/tables/ActivityList';
import { CreateActivityModal } from '@/components/modals/activity/CreateActivityModal';

interface ProjectActivitiesTabProps {
    projectId: string;
}

export const ProjectActivitiesTab: React.FC<ProjectActivitiesTabProps> = ({ projectId }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <>
            <Card
                title="Activități proiect"
                className="mb-6"
                headerActions={
                    <PrimaryActionButton
                        onClick={() => setIsCreateModalOpen(true)}
                        size="sm"
                    >
                        Adaugă activitate
                    </PrimaryActionButton>
                }
            >
                <ActivityList
                    project={projectId}
                    refreshTrigger={refreshTrigger}
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