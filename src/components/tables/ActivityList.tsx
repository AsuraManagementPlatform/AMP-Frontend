import { TableAction, TableColumn } from '@/types/index.types';
import React, { useState } from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import { Activity, ActivityStatus } from '@/types/activity.types';
import { UpdateActivityModal } from '@/components/modals/activity/UpdateActivityModal';
import activityService from '@/services/activity.service';
import showToast from '@/components/ui/Toast';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';

interface ActivityListProps {
    project: string;
    refreshTrigger?: number;
    pageSize?: number;
}

export const ActivityList: React.FC<ActivityListProps> = ({
                                                              project,
                                                              refreshTrigger = 0,
                                                              pageSize = 10,
                                                          }) => {
    const confirm = useConfirmDialog();
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleEdit = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (activity: Activity) => {
        const isConfirmed = await confirm({
            title: 'Șterge activitatea',
            message: `Sigur doriți să ștergeți activitatea "${activity.title}"?`,
            confirmText: 'Confirmă',
            cancelText: 'Renunță',
            confirmButtonVariant: 'primary',
            icon: (<IconWarning></IconWarning>)
        });

        if (!isConfirmed) {
            return;
        }

        try {
            await activityService.delete(activity.id);
            showToast.success('Activitatea a fost ștearsă cu succes!');
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la ștergerea activității';
            showToast.error(errorMessage);
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<Activity>[] => [
        {
            key: 'title',
            label: 'Titlu',
            sortable: true,
            size: 'lg',
            filterable: true,
            filterType: 'text',
        },
        {
            key: 'type',
            label: 'Tip',
            sortable: true,
            filterable: true,
            filterType: 'select',
            size: 'md',
            filterOptions: [
                { label: 'Întâlnire', value: 'MEETING' },
                { label: 'Workshop', value: 'WORKSHOP' },
                { label: 'Training', value: 'TRAINING' },
                { label: 'Conferință', value: 'CONFERENCE' },
                { label: 'Prezentare', value: 'PRESENTATION' },
                { label: 'Eveniment', value: 'EVENT' },
                { label: 'Sarcină', value: 'TASK' },
                { label: 'Obiectiv', value: 'MILESTONE' },
                { label: 'Revizuire', value: 'REVIEW' },
                { label: 'Altele', value: 'OTHER' }
            ],
            render: (type: string) => {
                const typeLabels: Record<string, string> = {
                    'MEETING': 'Întâlnire',
                    'WORKSHOP': 'Workshop',
                    'TRAINING': 'Training',
                    'CONFERENCE': 'Conferință',
                    'PRESENTATION': 'Prezentare',
                    'EVENT': 'Eveniment',
                    'TASK': 'Sarcină',
                    'MILESTONE': 'Obiectiv',
                    'REVIEW': 'Revizuire',
                    'OTHER': 'Altele'
                };
                return typeLabels[type] || type;
            }
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            filterable: true,
            filterType: 'select',
            size: 'md',
            filterOptions: [
                { label: 'Planificat', value: ActivityStatus.PLANNED },
                { label: 'În progres', value: ActivityStatus.IN_PROGRESS },
                { label: 'Finalizat', value: ActivityStatus.COMPLETED },
                { label: 'Anulat', value: ActivityStatus.CANCELLED },
                { label: 'Amânat', value: ActivityStatus.POSTPONED }
            ],
            render: (status: string) => {
                const statusColors = {
                    'PLANNED': 'bg-blue-100 text-blue-800',
                    'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
                    'COMPLETED': 'bg-green-100 text-green-800',
                    'CANCELLED': 'bg-red-100 text-red-800',
                    'POSTPONED': 'bg-gray-100 text-gray-800'
                };

                const statusLabels = {
                    'PLANNED': 'Planificat',
                    'IN_PROGRESS': 'În progres',
                    'COMPLETED': 'Finalizat',
                    'CANCELLED': 'Anulat',
                    'POSTPONED': 'Amânat'
                };

                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[status as keyof typeof statusLabels] || status}
                    </span>
                );
            }
        },
        {
            key: 'totalActivityExpensesAmount',
            label: 'Total cheltuieli',
            sortable: false,
            size: 'sm',
            render: (amount: number) => {
                return amount ? `${amount.toLocaleString('ro-RO')} RON` : '0 RON';
            }
        }
    ];

    const getActions = (): TableAction<Activity>[] => [
        {
            label: 'Edit',
            variant: 'primary',
            onClick: handleEdit,
            icon: <IconEdit />
        },
        {
            label: 'Delete',
            variant: 'danger',
            onClick: handleDelete,
            icon: <IconDelete />
        }
    ];

    return (
        <>
            <Table<Activity>
                endpoint={`activity/list?project_id=${project}`}
                columns={getColumns()}
                actions={getActions()}
                initialPageSize={pageSize}
                initialSort={{ field: 'starting_date', direction: 'desc' }}
                showFilters={true}
                showPagination={true}
                emptyMessage="Nu există activități pentru acest proiect."
                refreshTrigger={refreshTrigger + localRefresh}
            />

            {isUpdateModalOpen && selectedActivity && (
                <UpdateActivityModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedActivity(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    activity={selectedActivity}
                    project={project}
                />
            )}
        </>
    );
};

export default ActivityList;