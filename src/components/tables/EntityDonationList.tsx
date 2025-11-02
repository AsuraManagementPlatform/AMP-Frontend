import {DonationType, EntityDonation, SelectOption, TableAction, TableColumn} from '@/types/index.types';
import React, {useState} from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import entityDonationService from '@/services/entity-donation.service';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from "@/components/ui/ConfirmDialog";
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import {t} from 'i18next';
import {UpdateEntityDonationModal} from "@/components/modals/entity-donation/UpdateEntityDonationModal.tsx";

interface EntityDonationListProps {
    entityId?: string;
    refreshTrigger?: number;
    pageSize?: number;
    entities?: SelectOption[];
}

export const EntityDonationList: React.FC<EntityDonationListProps> = ({
    entityId,
    refreshTrigger = 0,
    pageSize = 10,
    entities = [],
                                                                      }) => {
    const confirm = useConfirmDialog();
    const [selectedDonation, setSelectedDonation] = useState<EntityDonation | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleEdit = (donation: EntityDonation) => {
        setSelectedDonation(donation);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (donation: EntityDonation) => {
        const isConfirmed = await confirm({
            title: t('label.entity_donation.delete_donation_title'),
            message: `${t('label.entity_donation.delete_donation_message')}?`,
            confirmText: t('action.confirm'),
            cancelText: t('action.cancel'),
            confirmButtonVariant: 'primary',
            icon: (<IconWarning />)
        });

        if (!isConfirmed) {
            return;
        }

        try {
            await entityDonationService.delete(donation.id);
            showToast.success(t('toast.entity_donation.deleted'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.entity_donation.delete_error');
            showToast.error(errorMessage);
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<EntityDonation>[] => [
        {
            key: 'entityName',
            label: t('label.entity_donation.entity'),
            sortable: false,
            filterable: false,
            size: 'md',
        },
        {
            key: 'date',
            label: t('label.entity_donation.date'),
            sortable: true,
            filterable: true,
            filterType: 'date',
            size: 'sm',
            render: (date: string) => {
                return new Date(date).toLocaleDateString('ro-RO');
            }
        },
        {
            key: 'type',
            label: t('label.entity_donation.type'),
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: t('label.donation_type.monetary'), value: DonationType.MONETARY },
                { label: t('label.donation_type.in_kind'), value: DonationType.IN_KIND },
                { label: t('label.donation_type.service'), value: DonationType.SERVICE },
                { label: t('label.donation_type.sponsorship'), value: DonationType.SPONSORSHIP },
                { label: t('label.donation_type.other'), value: DonationType.OTHER },
            ],
            size: 'sm',
            render: (type: string) => {
                const typeLabels: Record<string, string> = {
                    'monetary': t('label.donation_type.monetary'),
                    'in_kind': t('label.donation_type.in_kind'),
                    'service': t('label.donation_type.service'),
                    'sponsorship': t('label.donation_type.sponsorship'),
                    'other': t('label.donation_type.other')
                };
                return typeLabels[type] || type;
            }
        },
        {
            key: 'amount',
            label: t('label.entity_donation.amount'),
            sortable: true,
            filterable: true,
            filterType: 'number',
            size: 'sm',
            render: (amount: number, row: EntityDonation) => {
                return `${amount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
            }
        },
    ];

    const getActions = (): TableAction<EntityDonation>[] => [
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
            <Table<EntityDonation>
                endpoint={entityId ? `entity-donation/list?entity_id=${entityId}` : 'entity-donation/list'}
                columns={getColumns()}
                actions={getActions()}
                initialPageSize={pageSize}
                initialSort={{ field: 'date', direction: 'desc' }}
                showFilters={true}
                showPagination={true}
                emptyMessage={t('label.entity_donation.empty_list')}
                refreshTrigger={refreshTrigger + localRefresh}
            />

            {isUpdateModalOpen && selectedDonation && (
                <UpdateEntityDonationModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedDonation(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    entityDonation={selectedDonation}
                    entities={entities}
                />
            )}
        </>
    );
};

export default EntityDonationList;