import {ActivityChangeStatusRequest, TableAction, TableColumn} from '@/types/index.types';
import React, {useState} from "react";
import Table from "@/components/ui/Table.tsx";
import IconView from "@/assets/icons/iconmonstr-eye.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import IconStart from "@/assets/icons/iconmonstr-start.svg?react";
import IconDone from "@/assets/icons/iconmonstr-done.svg?react";
import {Activity, ActivityStatus, ActivityCompleteRequest} from '@/types/activity.types';
import {ActivityDetailsModal} from '@/components/modals/activity/ActivityDetailsModal';
import activityService from '@/services/activity.service';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from '@/components/ui/ConfirmDialog';
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import {t} from "i18next";

interface ActivityListProps {
    project: string;
    refreshTrigger?: number;
    pageSize?: number;
    canManageActivities?: boolean;
}

export const ActivityList: React.FC<ActivityListProps> = ({
                                                              project,
                                                              refreshTrigger = 0,
                                                              pageSize = 10,
                                                              canManageActivities = false,
                                                          }) => {
    const confirm = useConfirmDialog();
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleViewDetails = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsDetailsModalOpen(true);
    };

    const handleDelete = async (activity: Activity) => {
        const isConfirmed = await confirm({
            title: t('label.activity.delete_activity_title'),
            message: `${t('label.activity.delete_activity_message')} "${activity.title}"?`,
            confirmText: t('action.confirm'),
            cancelText: t('action.cancel'),
            confirmButtonVariant: 'primary',
            icon: (<IconWarning></IconWarning>)
        });

        if (!isConfirmed) return;

        try {
            await activityService.delete(activity.id);
            showToast.success(t('toast.activity.deleted'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.activity.delete_error');
            showToast.error(errorMessage);
        }
    };

    const handleActivate = async (activity: Activity) => {
        const changeStatusData: ActivityChangeStatusRequest = {
            id: activity.id,
            status: ActivityStatus.IN_PROGRESS
        }

        try {
            await activityService.changeStatus(changeStatusData);
            showToast.success(t('toast.activity.activated'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.activity.activate_error');
            showToast.error(errorMessage);
        }
    };

    const handleCompleted = async (activity: Activity) => {
        const isConfirmed = await confirm({
            title: t('label.activity.complete_activity'),
            message: `${t('label.activity.complete_activity_message')} "${activity.title}"?`,
            confirmText: t('action.confirm'),
            cancelText: t('action.cancel'),
            confirmButtonVariant: 'primary',
            icon: (<IconDone></IconDone>)
        });

        if (!isConfirmed) return;

        const completeData: ActivityCompleteRequest = {
            id: activity.id,
            endingDate: new Date().toISOString().split('T')[0]
        };

        try {
            await activityService.complete(completeData);
            showToast.success(t('toast.activity.completed'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.activity.complete_error');
            showToast.error(errorMessage);
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<Activity>[] => [
        {
            key: 'title',
            label: t('label.activity.title'),
            sortable: true,
            size: 'lg',
            filterable: true,
            filterType: 'text',
            sticky: 'left',
        },
        {
            key: 'startingDate',
            label: t('label.activity.starting_date'),
            sortable: true,
            size: 'sm',
            render: (startingDate: string) => {
                return startingDate ? new Date(startingDate).toLocaleDateString('ro-RO') : '-';
            }
        },
        {
            key: 'estimatedEndingDate',
            label: t('label.activity.estimated_ending_date'),
            sortable: true,
            size: 'sm',
            render: (estimatedEndingDate: string) => {
                return estimatedEndingDate ? new Date(estimatedEndingDate).toLocaleDateString('ro-RO') : '-';
            }
        },
        {
            key: 'completedAt',
            label: t('label.activity.completed_at'),
            sortable: true,
            size: 'sm',
            render: (completedAt: string | undefined, activity: Activity) => {
                if (activity.status !== ActivityStatus.COMPLETED || !completedAt) {
                    return '-';
                }
                return new Date(completedAt).toLocaleDateString('ro-RO', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        },
        {
            key: 'status',
            label: t('label.activity.status'),
            sortable: true,
            filterable: true,
            filterType: 'select',
            size: 'md',
            filterOptions: [
                { label: t('label.activity.status_planned'), value: ActivityStatus.PLANNED },
                { label: t('label.activity.status_in_progress'), value: ActivityStatus.IN_PROGRESS },
                { label: t('label.activity.status_completed'), value: ActivityStatus.COMPLETED },
                { label: t('label.activity.status_cancelled'), value: ActivityStatus.CANCELLED },
                { label: t('label.activity.status_postponed'), value: ActivityStatus.POSTPONED }
            ],
            render: (status: string) => {
                const statusColors = {
                    'PLANNED': 'bg-blue-100 text-blue-800',
                    'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
                    'COMPLETED': 'bg-green-100 text-green-800',
                    'CANCELLED': 'bg-red-100 text-red-800',
                    'POSTPONED': 'bg-gray-100 text-gray-800'
                };

                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {t(`label.activity.status_${status.toLowerCase()}`)}
                    </span>
                );
            }
        },
        {
            key: 'totalActivityExpensesAmount',
            label: t('label.activity.total_expenses'),
            sortable: false,
            size: 'sm',
            render: (amount: number) => {
                return amount ? `${amount.toLocaleString('ro-RO')} RON` : '0 RON';
            }
        }
    ];

    const getActions = (): TableAction<Activity>[] => {
        const actions: TableAction<Activity>[] = [];

        if (canManageActivities) {
            actions.push(
                {
                    label: t('action.view'),
                    variant: 'primary',
                    onClick: handleViewDetails,
                    icon: <IconView />
                },
                {
                    label: t('action.delete'),
                    variant: 'danger',
                    onClick: handleDelete,
                    icon: <IconDelete />,
                    show: (activity: Activity) => activity.status === ActivityStatus.PLANNED
                },
                {
                    label: t('action.activate'),
                    variant: 'primary',
                    onClick: handleActivate,
                    icon: <IconStart />,
                    show: (activity: Activity) => activity.status === ActivityStatus.PLANNED
                },
                {
                    label: t('action.complete'),
                    variant: 'primary',
                    onClick: handleCompleted,
                    icon: <IconDone />,
                    show: (activity: Activity) => activity.status === ActivityStatus.IN_PROGRESS
                }
            );
        } else {
            actions.push({
                label: t('action.view'),
                variant: 'primary',
                onClick: handleViewDetails,
                icon: <IconView />
            });
        }

        return actions;
    };

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
                emptyMessage={t('label.activity.empty_list')}
                refreshTrigger={refreshTrigger + localRefresh}
            />

            {isDetailsModalOpen && selectedActivity && (
                <ActivityDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setSelectedActivity(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    activity={selectedActivity}
                    project={project}
                    canEdit={canManageActivities}
                />
            )}
        </>
    );
};

export default ActivityList;