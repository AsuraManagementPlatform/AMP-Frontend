import {EntityDonation, SelectOption, TableAction, TableColumn} from '@/types/index.types';
import {DonationStatus} from '@/types/entity-donation.types';
import React, {useState, useEffect} from "react";
import Table from "@/components/ui/Table.tsx";
import entityDonationService from '@/services/entity-donation.service';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from "@/components/ui/ConfirmDialog";
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import {t} from 'i18next';
import {UpdateEntityDonationModal} from "@/components/modals/entity-donation/UpdateEntityDonationModal.tsx";
import {ConfirmDonationModal} from "@/components/modals/entity-donation/ConfirmDonationModal.tsx";
import {RejectDonationModal} from "@/components/modals/entity-donation/RejectDonationModal.tsx";
import { ActionIcons } from '@/components/ui/ActionIcons';

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
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);
    const [typeSuggestions, setTypeSuggestions] = useState<string[]>([]);

    useEffect(() => {
        const fetchTypeSuggestions = async () => {
            try {
                const suggestions = await entityDonationService.getTypeSuggestions();
                setTypeSuggestions(suggestions);
            } catch (error) {
                setTypeSuggestions([]);
            }
        };

        fetchTypeSuggestions();
    }, []);

    const handleEdit = (donation: EntityDonation) => {
        setSelectedDonation(donation);
        setIsUpdateModalOpen(true);
    };

    const handleConfirmDonation = (donation: EntityDonation) => {
        setSelectedDonation(donation);
        setIsConfirmModalOpen(true);
    };

    const handleRejectDonation = (donation: EntityDonation) => {
        setSelectedDonation(donation);
        setIsRejectModalOpen(true);
    };

    const handleConfirmSubmit = async (proofDocument?: string) => {
        if (!selectedDonation) return;
        try {
            await entityDonationService.confirm(selectedDonation.id, proofDocument);
            showToast.success(t('toast.entity_donation.confirmed'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorKey = error?.message || 'toast.entity_donation.confirm_error';
            const errorMessage = errorKey.includes('.') ? t(errorKey) : errorKey;
            showToast.error(errorMessage);
            throw error;
        }
    };

    const handleRejectSubmit = async (reason: string) => {
        if (!selectedDonation) return;
        try {
            await entityDonationService.reject(selectedDonation.id, reason);
            showToast.success(t('toast.entity_donation.rejected'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorKey = error?.message || 'toast.entity_donation.reject_error';
            const errorMessage = errorKey.includes('.') ? t(errorKey) : errorKey;
            showToast.error(errorMessage);
            throw error;
        }
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
            filterOptions: typeSuggestions.map(type => ({
                label: type,
                value: type.toLowerCase()
            })),
            size: 'sm',
            render: (type: string) => type
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
        {
            key: 'status',
            label: t('label.entity_donation.status'),
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: t('label.entity_donation.status_pending'), value: 'PENDING' },
                { label: t('label.entity_donation.status_confirmed'), value: 'CONFIRMED' },
                { label: t('label.entity_donation.status_rejected'), value: 'REJECTED' },
            ],
            size: 'sm',
            render: (status: string) => {
                const statusStyles: Record<string, string> = {
                    PENDING: 'bg-yellow-100 text-yellow-800',
                    CONFIRMED: 'bg-green-100 text-green-800',
                    REJECTED: 'bg-red-100 text-red-800',
                    CANCELLED: 'bg-gray-100 text-gray-800',
                };
                const statusLabels: Record<string, string> = {
                    PENDING: t('label.entity_donation.status_pending'),
                    CONFIRMED: t('label.entity_donation.status_confirmed'),
                    REJECTED: t('label.entity_donation.status_rejected'),
                    CANCELLED: t('label.entity_donation.status_cancelled'),
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[status] || status}
                    </span>
                );
            }
        },
    ];

    const getActions = (): TableAction<EntityDonation>[] => [
        {
            label: t('action.confirm'),
            variant: 'primary',
            onClick: handleConfirmDonation,
            icon: <ActionIcons.Approve />,
            show: (donation: EntityDonation) => donation.status === DonationStatus.PENDING
        },
        {
            label: t('action.reject'),
            variant: 'danger',
            onClick: handleRejectDonation,
            icon: <ActionIcons.Reject />,
            show: (donation: EntityDonation) => donation.status === DonationStatus.PENDING
        },
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
            <Table<EntityDonation>
                endpoint={entityId ? `entity_donation/list?entity_id=${entityId}` : 'entity_donation/list'}
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

            {isConfirmModalOpen && selectedDonation && (
                <ConfirmDonationModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => {
                        setIsConfirmModalOpen(false);
                        setSelectedDonation(null);
                    }}
                    onConfirm={handleConfirmSubmit}
                    donation={selectedDonation}
                />
            )}

            {isRejectModalOpen && selectedDonation && (
                <RejectDonationModal
                    isOpen={isRejectModalOpen}
                    onClose={() => {
                        setIsRejectModalOpen(false);
                        setSelectedDonation(null);
                    }}
                    onReject={handleRejectSubmit}
                    donation={selectedDonation}
                />
            )}
        </>
    );
};

export default EntityDonationList;