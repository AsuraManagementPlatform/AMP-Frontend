import {ActivityChangeStatusRequest, TableAction, TableColumn} from '@/types/index.types';
import React, {useState} from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconView from "@/assets/icons/iconmonstr-eye.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import IconX from "@/assets/icons/iconmonstr-x.svg?react";
import IconStart from "@/assets/icons/iconmonstr-start.svg?react";
import IconDone from "@/assets/icons/iconmonstr-done.svg?react";
import {Activity, ActivityStatus} from '@/types/activity.types';
import {UpdateActivityModal} from '@/components/modals/activity/UpdateActivityModal';
import {ViewActivityModal} from '@/components/modals/activity/ViewActivityModal';
import activityService from '@/services/activity.service';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from '@/components/ui/ConfirmDialog';
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import {CompleteActivityModal} from "@/components/modals/activity/CompleteActivityModal.tsx";
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
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleView = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsViewModalOpen(true);
    };

    const handleEdit = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsUpdateModalOpen(true);
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
        setSelectedActivity(activity);
        setIsCompleteModalOpen(true);
    };

    const handleCancelled = async (activity: Activity) => {
        const changeStatusData: ActivityChangeStatusRequest = {
            id: activity.id,
            status: ActivityStatus.CANCELLED
        }

        try {
            await activityService.changeStatus(changeStatusData);
            showToast.success(t('toast.activity.cancelled'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.activity.cancel_error');
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
        },
        {
            key: 'type',
            label: t('label.activity.type'),
            sortable: true,
            filterable: true,
            filterType: 'select',
            size: 'md',
            filterOptions: [
                { label: t('label.activity.type_meeting'), value: 'MEETING' },
                { label: t('label.activity.type_workshop'), value: 'WORKSHOP' },
                { label: t('label.activity.type_training'), value: 'TRAINING' },
                { label: t('label.activity.type_conference'), value: 'CONFERENCE' },
                { label: t('label.activity.type_presentation'), value: 'PRESENTATION' },
                { label: t('label.activity.type_event'), value: 'EVENT' },
                { label: t('label.activity.type_task'), value: 'TASK' },
                { label: t('label.activity.type_milestone'), value: 'MILESTONE' },
                { label: t('label.activity.type_review'), value: 'REVIEW' },
                { label: t('label.activity.type_other'), value: 'OTHER' }
            ],
            render: (type: string) => {
                return t(`label.activity.type_${type.toLowerCase()}`);
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
                    label: t('action.edit'),
                    variant: 'primary',
                    onClick: handleEdit,
                    icon: <IconEdit />
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
                },
                {
                    label: t('action.cancel'),
                    variant: 'primary',
                    onClick: handleCancelled,
                    icon: <IconX />,
                    show: (activity: Activity) => activity.status === ActivityStatus.IN_PROGRESS
                }
            );
        } else {
            actions.push({
                label: t('action.view'),
                variant: 'primary',
                onClick: handleView,
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

            {isViewModalOpen && selectedActivity && (
                <ViewActivityModal
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedActivity(null);
                    }}
                    activity={selectedActivity}
                />
            )}

            {isCompleteModalOpen && selectedActivity && (
                <CompleteActivityModal
                    isOpen={isCompleteModalOpen}
                    onClose={() => {
                        setIsCompleteModalOpen(false);
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