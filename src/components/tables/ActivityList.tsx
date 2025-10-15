import { TableAction, TableColumn } from '@/types/index.types';
import React, { useState } from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import { Activity, ActivityStatus } from '@/types/activity.types';
import { UpdateActivityModal } from '@/components/modals/activity/UpdateActivityModal';
import activityService from '@/services/activity.service';
import showToast from '@/components/ui/Toast';

interface ActivityListProps {
    project: string;
    refreshTrigger?: number;
    className?: string;
    pageSize?: number;
}

export const ActivityList: React.FC<ActivityListProps> = ({
                                                              project,
                                                              refreshTrigger = 0,
                                                              className = '',
                                                              pageSize = 10
                                                          }) => {
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleEdit = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (activity: Activity) => {
        if (!window.confirm(`Sigur doriți să ștergeți activitatea "${activity.title}"?`)) {
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
            width: '250px',
            filterable: true,
            filterType: 'text',
        },
        {
            key: 'type',
            label: 'Tip',
            sortable: true,
            filterable: true,
            filterType: 'select',
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
            width: '120px',
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
            filterOptions: [
                { label: 'Planificat', value: ActivityStatus.PLANNED },
                { label: 'În progres', value: ActivityStatus.IN_PROGRESS },
                { label: 'Finalizat', value: ActivityStatus.COMPLETED },
                { label: 'Anulat', value: ActivityStatus.CANCELLED },
                { label: 'Amânat', value: ActivityStatus.POSTPONED }
            ],
            width: '120px',
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
            key: 'starting_date',
            label: 'Data început',
            sortable: true,
            width: '120px',
            render: (date: string) => {
                return date ? new Date(date).toLocaleDateString('ro-RO') : '-';
            }
        },
        {
            key: 'estimated_ending_date',
            label: 'Data estimată',
            sortable: true,
            width: '120px',
            render: (date: string) => {
                return date ? new Date(date).toLocaleDateString('ro-RO') : '-';
            }
        },
        {
            key: 'total_activity_expenses_amount',
            label: 'Total cheltuieli',
            sortable: false,
            width: '120px',
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
                pageSize={pageSize}
                initialSort={{ field: 'starting_date', direction: 'desc' }}
                showSearch={true}
                showFilters={true}
                showPagination={true}
                emptyMessage="Nu există activități pentru acest proiect."
                className={className}
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