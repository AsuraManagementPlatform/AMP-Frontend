import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import ProjectMemberList from '@/components/tables/ProjectMemberList';
import { CreateProjectMemberModal } from '@/components/modals/project-member/CreateProjectMemberModal';

interface ProjectMembersTabProps {
    projectId: string;
    organizationId: string;
}

export const ProjectMembersTab: React.FC<ProjectMembersTabProps> = ({
                                                                        projectId,
                                                                        organizationId
                                                                    }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <>
            <Card
                title="Membri proiect"
                className="mb-6"
                headerActions={
                    <PrimaryActionButton
                        onClick={() => setIsCreateModalOpen(true)}
                        size="sm"
                    >
                        Adaugă membru
                    </PrimaryActionButton>
                }
            >
                <ProjectMemberList
                    project={projectId}
                    organizationId={organizationId}
                    refreshTrigger={refreshTrigger}
                />
            </Card>

            {isCreateModalOpen && (
                <CreateProjectMemberModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                    project={projectId}
                    organizationId={organizationId}
                />
            )}
        </>
    );
};