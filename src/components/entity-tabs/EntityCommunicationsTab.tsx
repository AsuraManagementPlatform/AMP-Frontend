import React, {useState} from 'react';
import {Card} from '@/components/ui/Card';
import {PrimaryActionButton} from '@/components/ui/PrimaryActionButton';
import {CreateEntityCommunicationModal} from '@/components/modals/entity-communication/CreateEntityCommunicationModal';
import {t} from 'i18next';
import EntityCommunicationList from "@/components/tables/EntityCommunicationList.tsx";
import {SelectOption} from "@/types/form.types.ts";

interface EntityCommunicationsTabProps {
    entityId: string;
    entityName: string;
    entities?: SelectOption[];
    organizationMembers?: SelectOption[];
}

export const EntityCommunicationsTab: React.FC<EntityCommunicationsTabProps> = ({
    entityId,
    entityName,
    entities,
    organizationMembers,
                                                                                }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <>
            <Card
                title={t('label.entity_communication.communications_for_entity', { name: entityName })}
                className="mb-6"
                headerActions={
                    <PrimaryActionButton
                        onClick={() => setIsCreateModalOpen(true)}
                        size="sm"
                    >
                        {t('label.entity_communication.add_communication')}
                    </PrimaryActionButton>
                }
            >
                <EntityCommunicationList
                    entityId={entityId}
                    refreshTrigger={refreshTrigger}
                    pageSize={20}
                    organizationMembers={organizationMembers}
                />
            </Card>

            {isCreateModalOpen && (
                <CreateEntityCommunicationModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                    entityId={entityId}
                    entities={entities}
                    organizationMembers={organizationMembers}
                />
            )}
        </>
    );
};