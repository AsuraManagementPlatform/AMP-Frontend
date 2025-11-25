import {CommunicationType, EntityCommunication, SelectOption, TableAction, TableColumn} from '@/types/index.types';
import React, { useState } from "react";
import Table from "@/components/ui/Table.tsx";
import { ActionIcons } from '@/components/ui/ActionIcons';
import showToast from '@/components/ui/Toast';
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import { t } from 'i18next';
import { UpdateEntityCommunicationModal } from "@/components/modals/entity-communication/UpdateEntityCommunicationModal.tsx";
import entityCommunicationService from "@/services/entity-communicationService.ts";

interface EntityCommunicationListProps {
    entityId: string;
    refreshTrigger?: number;
    pageSize?: number;
    organizationMembers?: SelectOption[];
}

export const EntityCommunicationList: React.FC<EntityCommunicationListProps> = ({
    entityId,
    refreshTrigger = 0,
    pageSize = 10,
    organizationMembers = [],}) => {
    const confirm = useConfirmDialog();
    const [selectedCommunication, setSelectedCommunication] = useState<EntityCommunication | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleEdit = (communication: EntityCommunication) => {
        setSelectedCommunication(communication);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (communication: EntityCommunication) => {
        const isConfirmed = await confirm({
            title: t('label.entity_communication.delete_communication_title'),
            message: `${t('label.entity_communication.delete_communication_message')}?`,
            confirmText: t('action.confirm'),
            cancelText: t('action.cancel'),
            confirmButtonVariant: 'primary',
            icon: (<IconWarning />)
        });

        if (!isConfirmed) {
            return;
        }

        try {
            await entityCommunicationService.delete(communication.id);
            showToast.success(t('toast.entity_communication.deleted'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.entity_communication.delete_error');
            showToast.error(errorMessage);
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<EntityCommunication>[] => [
        {
            key: 'topic',
            label: t('label.entity_communication.topic'),
            sortable: true,
            filterable: true,
            filterType: 'text',
            size: 'md',
        },
        {
            key: 'type',
            label: t('label.entity_communication.type'),
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: t('label.communication_type.email'), value: CommunicationType.EMAIL },
                { label: t('label.communication_type.phone'), value: CommunicationType.PHONE },
                { label: t('label.communication_type.meeting'), value: CommunicationType.MEETING },
                { label: t('label.communication_type.letter'), value: CommunicationType.LETTER },
                { label: t('label.communication_type.newsletter'), value: CommunicationType.NEWSLETTER },
                { label: t('label.communication_type.other'), value: CommunicationType.OTHER },
            ],
            size: 'sm',
            render: (type: string) => {
                const typeLabels: Record<string, string> = {
                    'email': t('label.communication_type.email'),
                    'phone': t('label.communication_type.phone'),
                    'meeting': t('label.communication_type.meeting'),
                    'letter': t('label.communication_type.letter'),
                    'newsletter': t('label.communication_type.newsletter'),
                    'other': t('label.communication_type.other')
                };
                const typeColors: Record<string, string> = {
                    'email': 'bg-blue-100 text-blue-800',
                    'phone': 'bg-green-100 text-green-800',
                    'meeting': 'bg-purple-100 text-purple-800',
                    'letter': 'bg-yellow-100 text-yellow-800',
                    'newsletter': 'bg-orange-100 text-orange-800',
                    'other': 'bg-gray-100 text-gray-800'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
                        {typeLabels[type] || type}
                    </span>
                );
            }
        },
        {
            key: 'date',
            label: t('label.entity_communication.date'),
            sortable: true,
            filterable: true,
            filterType: 'date',
            size: 'sm',
            render: (date: string) => {
                return new Date(date).toLocaleDateString('ro-RO');
            }
        },
        {
            key: 'responsible',
            label: t('label.entity_communication.responsible'),
            sortable: false,
            filterable: false,
            size: 'sm',
            render: (responsible: string | null) => responsible || '-'
        }
    ];

    const getActions = (): TableAction<EntityCommunication>[] => [
        {
            label: t('action.edit'),
            variant: 'primary',
            onClick: handleEdit,
            icon: <ActionIcons.Edit />
        },
        {
            label: t('action.delete'),
            variant: 'danger',
            onClick: handleDelete,
            icon: <ActionIcons.Delete />
        }
    ];

    return (
        <>
            <Table<EntityCommunication>
                endpoint={`entity-communication/list?entity_id=${entityId}`}
                columns={getColumns()}
                actions={getActions()}
                initialPageSize={pageSize}
                initialSort={{ field: 'date', direction: 'desc' }}
                showFilters={true}
                showPagination={true}
                emptyMessage={t('label.entity_communication.empty_list')}
                refreshTrigger={refreshTrigger + localRefresh}
            />

            {isUpdateModalOpen && selectedCommunication && (
                <UpdateEntityCommunicationModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedCommunication(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    entityCommunication={selectedCommunication}
                    organizationMembers={organizationMembers}
                />
            )}
        </>
    );
};

export default EntityCommunicationList;