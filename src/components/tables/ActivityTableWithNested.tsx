import React, {useState, useEffect, useCallback} from 'react';
import { Activity, ActivityStatus, ActivityCompleteRequest } from '@/types/activity.types';
import { ActivityChangeStatusRequest } from '@/types/index.types';
import activityService from '@/services/activity.service';
import showToast from '@/components/ui/Toast';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { t } from 'i18next';
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import IconDone from '@/assets/icons/iconmonstr-done.svg?react';
import IconArrowDown from '@/assets/icons/iconmonstr-arrow-down.svg?react';
import { ActivityDetailsModal } from '@/components/modals/activity/ActivityDetailsModal';
import { ActionIcons } from '@/components/ui/ActionIcons';

interface ActivityTableWithNestedProps {
    project: string;
    refreshTrigger?: number;
    canManageActivities?: boolean;
}

export const ActivityTableWithNested: React.FC<ActivityTableWithNestedProps> = ({
    project,
    refreshTrigger = 0,
    canManageActivities = false,
}) => {
    const confirm = useConfirmDialog();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [subActivities, setSubActivities] = useState<Map<string, Activity[]>>(new Map());
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const loadActivities = useCallback(async () => {
        setLoading(true);
        try {
            const response = await activityService.getList({
                filters: { project }
            });
            const parentActivities = response.results.filter((a: Activity) => !a.parentActivity);
            setActivities(parentActivities);
            setSubActivities(new Map());
            setExpandedRows(new Set());
        } catch (error: any) {
            showToast.error(error?.message || t('toast.activity.load_error'));
        } finally {
            setLoading(false);
        }
    }, [project]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities, refreshTrigger, localRefresh]);

    const toggleRow = async (activityId: string, hasSubActivities: boolean) => {
        if (!hasSubActivities) return;

        const newExpanded = new Set(expandedRows);
        
        if (newExpanded.has(activityId)) {
            newExpanded.delete(activityId);
            setExpandedRows(newExpanded);
        } else {
            newExpanded.add(activityId);
            setExpandedRows(newExpanded);
            
            if (!subActivities.has(activityId)) {
                try {
                    const response = await activityService.getList({ 
                        filters: { project, parent_activity: activityId } 
                    });
                    setSubActivities(prev => new Map(prev).set(activityId, response.results));
                } catch (error) {
                    showToast.error(t('toast.activity.load_subactivities_error'));
                }
            }
        }
    };

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
            icon: <IconWarning />
        });

        if (!isConfirmed) return;

        try {
            await activityService.delete(activity.id);
            showToast.success(t('toast.activity.deleted'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            showToast.error(error?.message || t('toast.activity.delete_error'));
        }
    };

    const handleActivate = async (activity: Activity) => {
        const changeStatusData: ActivityChangeStatusRequest = {
            id: activity.id,
            status: ActivityStatus.IN_PROGRESS
        };

        try {
            await activityService.changeStatus(changeStatusData);
            showToast.success(t('toast.activity.activated'));
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            showToast.error(error?.message || t('toast.activity.activate_error'));
        }
    };

    const handleCompleted = async (activity: Activity) => {
        const isConfirmed = await confirm({
            title: t('label.activity.complete_activity'),
            message: `${t('label.activity.complete_activity_message')} "${activity.title}"?`,
            confirmText: t('action.confirm'),
            cancelText: t('action.cancel'),
            confirmButtonVariant: 'primary',
            icon: <IconDone />
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
            showToast.error(error?.message || t('toast.activity.complete_error'));
        }
    };

    const renderActions = (activity: Activity) => {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleViewDetails(activity)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title={t('action.view')}
                >
                    <ActionIcons.View />
                </button>
                
                {canManageActivities && (
                    <>
                        {activity.status === ActivityStatus.PLANNED && (
                            <>
                                <button
                                    onClick={() => handleActivate(activity)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                    title={t('action.activate')}
                                >
                                    <ActionIcons.Approve />
                                </button>
                                <button
                                    onClick={() => handleDelete(activity)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                    title={t('action.delete')}
                                >
                                    <ActionIcons.Delete />
                                </button>
                            </>
                        )}
                        
                        {activity.status === ActivityStatus.IN_PROGRESS && activity.canComplete && (
                            <button
                                onClick={() => handleCompleted(activity)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                title={t('action.complete')}
                            >
                                <ActionIcons.Approve />
                            </button>
                        )}
                    </>
                )}
            </div>
        );
    };

    const renderStatusBadge = (status: ActivityStatus) => {
        const statusColors = {
            'PLANNED': 'bg-blue-100 text-blue-800',
            'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800',
            'POSTPONED': 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                {t(`label.activity.status_${status.toLowerCase()}`)}
            </span>
        );
    };

    const renderRow = (activity: Activity, isSubActivity: boolean = false, depth: number = 0) => {
        if (depth > 2) {
            console.error('Maximum nesting depth exceeded for activity:', activity.id);
            return null;
        }

        const hasSubActivities = !isSubActivity && activity.subActivitiesCount > 0;
        const isExpanded = expandedRows.has(activity.id);
        const childActivities = isSubActivity ? [] : (subActivities.get(activity.id) || []);

        return (
            <React.Fragment key={activity.id}>
                <tr className={`${isSubActivity ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    {/* Title with expand/collapse */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2" style={{ paddingLeft: isSubActivity ? '2rem' : '0' }}>
                            {!isSubActivity && hasSubActivities && (
                                <button
                                    onClick={() => toggleRow(activity.id, hasSubActivities)}
                                    className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                                    title="Expandează/Restrânge subactivitățile"
                                >
                                    {isExpanded ? (
                                        <IconArrowDown className="w-4 h-4 text-gray-600" />
                                    ) : (
                                        <span className="inline-block w-4 h-4 text-gray-600 transform -rotate-90">
                                            <IconArrowDown className="w-4 h-4" />
                                        </span>
                                    )}
                                </button>
                            )}
                            {!isSubActivity && !hasSubActivities && (
                                <div className="w-6 flex-shrink-0" />
                            )}
                            {isSubActivity && (
                                <span className="text-gray-400 flex-shrink-0">└─</span>
                            )}
                            <span className="truncate">{activity.title}</span>
                            {hasSubActivities && (
                                <span className="flex-shrink-0 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                    {activity.completedSubActivitiesCount}/{activity.subActivitiesCount}
                                </span>
                            )}
                        </div>
                    </td>

                    {/* Starting Date */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                        {activity.startingDate ? new Date(activity.startingDate).toLocaleDateString('ro-RO') : '-'}
                    </td>

                    {/* Estimated Ending Date */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                        {activity.estimatedEndingDate ? new Date(activity.estimatedEndingDate).toLocaleDateString('ro-RO') : '-'}
                    </td>

                    {/* Completed At */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                        {activity.status === ActivityStatus.COMPLETED && activity.completedAt
                            ? new Date(activity.completedAt).toLocaleDateString('ro-RO', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            })
                            : '-'
                        }
                    </td>

                    {/* Status with Progress Bar */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-col gap-1">
                            {renderStatusBadge(activity.status)}
                            {hasSubActivities && (
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-green-500 h-full transition-all duration-300"
                                            style={{ width: `${activity.progressPercentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-600 flex-shrink-0">
                                        {activity.progressPercentage}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </td>

                    {/* Total Expenses */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                        {activity.totalActivityExpensesAmount ? `${activity.totalActivityExpensesAmount.toLocaleString('ro-RO')} RON` : '0 RON'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-sm text-gray-900">
                        {renderActions(activity)}
                    </td>
                </tr>

                {/* Render subactivities if expanded */}
                {isExpanded && childActivities.length > 0 && childActivities.map(subActivity => 
                    renderRow(subActivity, true, depth + 1)
                )}
            </React.Fragment>
        );
    };

    return (
        <>
            <div className="w-full">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        {t('label.activity.title')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        {t('label.activity.starting_date')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        {t('label.activity.estimated_ending_date')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        {t('label.activity.completed_at')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        {t('label.activity.status')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        {t('label.activity.total_expenses')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8">
                                            <LoadingSpinner />
                                        </td>
                                    </tr>
                                ) : activities.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            {t('label.activity.empty_list')}
                                        </td>
                                    </tr>
                                ) : (
                                    activities.map(activity => renderRow(activity))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isDetailsModalOpen && selectedActivity && (
                <ActivityDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setSelectedActivity(null);
                    }}
                    onSuccess={loadActivities}
                    activity={selectedActivity}
                    project={project}
                    canEdit={canManageActivities}
                />
            )}
        </>
    );
};

export default ActivityTableWithNested;
