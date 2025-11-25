import {TableAction, TableColumn} from '@/types/index.types';
import React, {useState} from "react";
import Table from "@/components/ui/Table.tsx";
import {Entity, EntityType} from '@/types/entity.types';
import {UpdateEntityModal} from '@/components/modals/entity/UpdateEntityModal';
import entityService from '@/services/entity.service';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from '@/components/ui/ConfirmDialog';
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import {t} from 'i18next';
import { ActionIcons } from '@/components/ui/ActionIcons';

interface EntityListProps {
    organizationId: string;
    refreshTrigger?: number;
    pageSize?: number;
    onRowClick?: (entity: Entity) => void;
}

export const EntityList: React.FC<EntityListProps> = ({
                                                          organizationId,
                                                          refreshTrigger = 0,
                                                          pageSize = 10,
                                                          onRowClick,
                                                      }) => {
    const confirm = useConfirmDialog();
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleEdit = (entity: Entity) => {
        setSelectedEntity(entity);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (entity: Entity) => {
        const isConfirmed = await confirm({
            title: t('label.entity.delete_entity_title'),
            message: `${t('label.entity.delete_entity_message')} "${entity.name}"?`,
            confirmText: t('action.confirm'),
            cancelText: t('action.cancel'),
            confirmButtonVariant: 'primary',
            icon: (<IconWarning />)
        });

        if (!isConfirmed) {
            return;
        }

        try {
            await entityService.delete(entity.id);
            showToast.success(t('toast.entity.deleted'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.entity.delete_error');
            showToast.error(errorMessage);
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<Entity>[] => [
        {
            key: 'name',
            label: t('label.entity.name'),
            sortable: true,
            filterable: true,
            filterType: 'text',
            size: 'lg',
        },
        {
            key: 'type',
            label: t('label.entity.entity_type'),
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: t('label.entity.type_donor'), value: EntityType.DONOR },
                { label: t('label.entity.type_sponsor'), value: EntityType.SPONSOR },
                { label: t('label.entity.type_partner'), value: EntityType.PARTNER },
                { label: t('label.entity.type_voluntar'), value: EntityType.VOLUNTEER },
                { label: t('label.entity.type_beneficiar'), value: EntityType.BENEFICIARY },
                { label: t('label.entity.type_altul'), value: EntityType.OTHER },
            ],
            size: 'sm',
            render: (type: string) => {
                const typeLabels: Record<string, string> = {
                    [EntityType.DONOR]: t('label.entity.type_donor'),
                    [EntityType.SPONSOR]: t('label.entity.type_sponsor'),
                    [EntityType.PARTNER]: t('label.entity.type_partner'),
                    [EntityType.VOLUNTEER]: t('label.entity.type_voluntar'),
                    [EntityType.BENEFICIARY]: t('label.entity.type_beneficiar'),
                    [EntityType.OTHER]: t('label.entity.type_altul'),
                };
                return typeLabels[type] || type;
            }
        },
        {
            key: 'email',
            label: t('label.entity.contact'),
            size: 'md',
            render: (email: string, entity: Entity) => (
                <div>
                    <div className="text-sm text-gray-700">{email}</div>
                    <div className="text-sm text-gray-500">{entity.phone}</div>
                </div>
            )
        },
    ];

    const getActions = (): TableAction<Entity>[] => [
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
            <Table<Entity>
                endpoint={`entity/list?organization_id=${organizationId}`}
                columns={getColumns()}
                actions={getActions()}
                initialPageSize={pageSize}
                initialSort={{ field: 'name', direction: 'asc' }}
                showFilters={true}
                showPagination={true}
                emptyMessage={t('label.entity.empty_list')}
                refreshTrigger={refreshTrigger + localRefresh}
                onRowClick={onRowClick}
            />

            {isUpdateModalOpen && selectedEntity && (
                <UpdateEntityModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedEntity(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    entity={selectedEntity}
                />
            )}
        </>
    );
};

export default EntityList;