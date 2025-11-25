import {TableAction, TableColumn, Vat} from '@/types/index.types';
import React, {useState} from "react";
import Table from "@/components/ui/Table.tsx";
import { ActionIcons } from '@/components/ui/ActionIcons';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from '@/components/ui/ConfirmDialog';
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import {t} from "i18next";
import vatService from "@/services/vat.service.ts";
import {UpdateVatModal} from "@/components/modals/vat/UpdateVatModal.tsx";

interface VatListProps {
    refreshTrigger?: number;
    pageSize?: number;
}

export const VatList: React.FC<VatListProps> = ({
                                                    refreshTrigger = 0,
                                                    pageSize = 10
}) => {
    const confirm = useConfirmDialog();
    const [selectedVat, setSelectedVat] = useState<Vat | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleEdit = (vat: Vat) => {
        setSelectedVat(vat);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (vat: Vat) => {
        const isConfirmed = await confirm({
            title: t('label.vat.confirm_vat_deleted_tile'),
            message: `${t('label.vat.confirm_vat_deleted_message')} ${vat.name} ?`,
            confirmText: t('label.vat.confirm_vat_confirm_message'),
            cancelText: t('label.vat.confirm_vat_cancel_message'),
            confirmButtonVariant: 'primary',
            icon: (<IconWarning></IconWarning>)
        });

        if (!isConfirmed) {
            return;
        }

        try {
            await vatService.delete(vat.id);
            showToast.vatDeleted();
            setLocalRefresh(prev => prev + 1);
        } catch (error: unknown) {
            if (error instanceof Error) {
                showToast.error(error.message);
            } else {
                showToast.error(t('toast.default_error_message'))
            }
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<Vat>[] => [
        {
            key: 'name',
            label: t('label.vat.name'),
            sortable: true,
            size: 'lg',
            filterable: true,
            filterType: 'text',
        },
        {
            key: 'value',
            label: t('label.vat.value'),
            sortable: true,
            size: 'md',
        },
    ];

    const getActions = (): TableAction<Vat>[] => [
        {
            label: 'Edit',
            variant: 'primary',
            onClick: handleEdit,
            icon: <ActionIcons.Edit />
        },
        {
            label: 'Delete',
            variant: 'danger',
            onClick: handleDelete,
            icon: <ActionIcons.Delete />
        }
    ];

    return (
        <>
            <Table<Vat>
                endpoint={`vat/list`}
                columns={getColumns()}
                actions={getActions()}
                initialPageSize={pageSize}
                showFilters={true}
                showPagination={true}
                emptyMessage={t('label.vat.empty_list')}
                refreshTrigger={refreshTrigger + localRefresh}
            />

            {isUpdateModalOpen && selectedVat && (
                <UpdateVatModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedVat(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    vat={selectedVat}
                />
            )}
        </>
    );
};

export default VatList;