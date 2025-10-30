import { TableAction, TableColumn } from '@/types/index.types';
import React, { useState } from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import { Entity, EntityStatus, EngagementLevel, LegalType, EntityType } from '@/types/entity.types';
import { UpdateEntityModal } from '@/components/modals/entity/UpdateEntityModal';
import entityService from '@/services/entity.service';
import showToast from '@/components/ui/Toast';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import { t } from 'i18next';

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
            key: 'identificationNumber',
            label: t('label.entity.identification_number'),
            sortable: true,
            filterable: true,
            filterType: 'text',
            size: 'sm',
        },
        {
            key: 'name',
            label: t('label.entity.name'),
            sortable: true,
            filterable: true,
            filterType: 'text',
            size: 'lg',
        },
        {
            key: 'legalType',
            label: t('label.entity.legal_type'),
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: t('label.entity.legal_type_fizica'), value: LegalType.FIZICA },
                { label: t('label.entity.legal_type_juridica'), value: LegalType.JURIDICA },
            ],
            size: 'sm',
            render: (legalType: string) => {
                return legalType === LegalType.FIZICA
                    ? t('label.entity.legal_type_fizica')
                    : t('label.entity.legal_type_juridica');
            }
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
        {
            key: 'status',
            label: t('label.entity.status'),
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: t('label.entity.status_activ'), value: EntityStatus.ACTIV },
                { label: t('label.entity.status_inactiv'), value: EntityStatus.INACTIV },
                { label: t('label.entity.status_potential'), value: EntityStatus.POTENTIAL },
                { label: t('label.entity.status_blocat'), value: EntityStatus.BLOCAT },
            ],
            size: 'sm',
            render: (status: string) => {
                const statusColors: Record<string, string> = {
                    [EntityStatus.ACTIV]: 'bg-green-100 text-green-800',
                    [EntityStatus.INACTIV]: 'bg-gray-100 text-gray-800',
                    [EntityStatus.POTENTIAL]: 'bg-blue-100 text-blue-800',
                    [EntityStatus.BLOCAT]: 'bg-red-100 text-red-800'
                };
                const statusLabels: Record<string, string> = {
                    [EntityStatus.ACTIV]: t('label.entity.status_activ'),
                    [EntityStatus.INACTIV]: t('label.entity.status_inactiv'),
                    [EntityStatus.POTENTIAL]: t('label.entity.status_potential'),
                    [EntityStatus.BLOCAT]: t('label.entity.status_blocat')
                };
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
                        {statusLabels[status]}
                    </span>
                );
            }
        },
        {
            key: 'engagementLevel',
            label: t('label.entity.engagement'),
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: t('label.entity.engagement_total'), value: EngagementLevel.TOTAL },
                { label: t('label.entity.engagement_partial'), value: EngagementLevel.PARTIAL },
                { label: t('label.entity.engagement_deloc'), value: EngagementLevel.DELOC },
            ],
            size: 'sm',
            render: (level: string) => {
                const badges: Record<string, string> = {
                    [EngagementLevel.TOTAL]: 'bg-green-100 text-green-800',
                    [EngagementLevel.PARTIAL]: 'bg-yellow-100 text-yellow-800',
                    [EngagementLevel.DELOC]: 'bg-gray-100 text-gray-800'
                };
                const labels: Record<string, string> = {
                    [EngagementLevel.TOTAL]: t('label.entity.engagement_total'),
                    [EngagementLevel.PARTIAL]: t('label.entity.engagement_partial'),
                    [EngagementLevel.DELOC]: t('label.entity.engagement_deloc')
                };
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[level || EngagementLevel.DELOC]}`}>
                        {labels[level || EngagementLevel.DELOC]}
                    </span>
                );
            }
        },
    ];

    const getActions = (): TableAction<Entity>[] => [
        {
            label: t('action.edit'),
            variant: 'primary',
            onClick: handleEdit,
            icon: <IconEdit />
        },
        {
            label: t('action.delete'),
            variant: 'danger',
            onClick: handleDelete,
            icon: <IconDelete />
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