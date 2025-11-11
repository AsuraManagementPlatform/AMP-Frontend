import React, {useState} from 'react';
import {Card} from '@/components/ui/Card';
import {PrimaryActionButton} from '@/components/ui/PrimaryActionButton';
import {SelectOption} from '@/types/form.types';
import {t} from 'i18next';
import EntityDonationList from "@/components/tables/EntityDonationList.tsx";
import {CreateEntityDonationModal} from "@/components/modals/entity-donation/CreateEntityDonationModal.tsx";
import {EntityDonationStats} from "@/types/entity-donation.types.ts";

interface EntityDonationsTabProps {
    entityId: string;
    entityName: string;
    entities?: SelectOption[];
    projects?: SelectOption[];
    activities?: SelectOption[];
    stats?: EntityDonationStats
}

export const EntityDonationsTab: React.FC<EntityDonationsTabProps> = ({
    entityId,
    entityName,
    entities = [],
    projects = [],
    activities = [],
    stats,
                                                                      }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);


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
                    entities={entities}
                    projects={projects}
                    activities={activities}
                />
            )}
        </>
    );
};