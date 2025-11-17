import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { updateActivityFormConfig } from '@/config/activity.form.config';
import { updateActivitySchema, UpdateActivityData } from '@/schemas/activity.schema';
import activityService from '@/services/activity.service';
import showToast from '@/components/ui/Toast';
import { Activity, ActivityStatus } from '@/types/activity.types';
import { useTranslation } from 'react-i18next';
import IconEdit from '@/assets/icons/iconmonstr-edit.svg?react';

interface ActivityDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    activity: Activity;
    project: string;
    canEdit?: boolean;
}

export const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    activity,
    canEdit = false,
}) => {
    const { t } = useTranslation();
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const canEditActivity = canEdit && activity.status !== ActivityStatus.COMPLETED;

    const handleSubmit = async (data: UpdateActivityData) => {
        try {
            setIsSubmitting(true);
            await activityService.update(activity.id, data);
            showToast.success(t('toast.activity.updated'));
            onSuccess();
            setIsEditMode(false);
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.activity.update_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsEditMode(false);
    };

    const formConfig = updateActivityFormConfig();

    const defaultValues: UpdateActivityData = {
        id: activity.id,
        project: activity.project,
        projectObjective: activity.projectObjective || '',
        title: activity.title,
        description: activity.description || '',
        startingDate: activity.startingDate,
        estimatedEndingDate: activity.estimatedEndingDate,
        endingDate: activity.endingDate || '',
        status: activity.status,
        type: activity.type,
        location: activity.location || '',
        observation: activity.observation || '',
        results: activity.results || '',
        indicators: activity.indicators || ''
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('label.activity.activity_details')}
            size="lg"
        >
            {!isEditMode ? (
                <div className="max-h-[70vh] overflow-y-auto">
                    <div className="space-y-5">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 border border-gray-200">
                            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-primary-600 rounded"></span>
                                {t('label.activity.section_info')}
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="bg-white rounded-md p-3 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 mb-1">{t('label.activity.title')}</p>
                                    <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                                </div>
                                <div className="bg-white rounded-md p-3 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 mb-1">{t('label.activity.type')}</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {t(`label.activity.type_${activity.type.toLowerCase()}`)}
                                    </p>
                                </div>
                                <div className="bg-white rounded-md p-3 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 mb-1">{t('label.activity.status')}</p>
                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                        activity.status === 'PLANNED' ? 'bg-blue-100 text-blue-800' :
                                        activity.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                        activity.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                        activity.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {t(`label.activity.status_${activity.status.toLowerCase()}`)}
                                    </span>
                                </div>
                                {activity.location && (
                                    <div className="bg-white rounded-md p-3 shadow-sm">
                                        <p className="text-xs font-medium text-gray-500 mb-1">{t('label.activity.location')}</p>
                                        <p className="text-sm font-semibold text-gray-900">{activity.location}</p>
                                    </div>
                                )}
                                {activity.description && (
                                    <div className="col-span-2 bg-white rounded-md p-3 shadow-sm">
                                        <p className="text-xs font-medium text-gray-500 mb-1">{t('label.activity.description')}</p>
                                        <p className="text-sm text-gray-700 leading-relaxed">{activity.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
                            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-blue-600 rounded"></span>
                                {t('label.activity.section_planning')}
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-md p-3 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 mb-1">{t('label.activity.starting_date')}</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {new Date(activity.startingDate).toLocaleDateString('ro-RO')}
                                    </p>
                                </div>
                                <div className="bg-white rounded-md p-3 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 mb-1">{t('label.activity.estimated_ending_date')}</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {new Date(activity.estimatedEndingDate).toLocaleDateString('ro-RO')}
                                    </p>
                                </div>
                                {activity.endingDate && (
                                    <div className="bg-white rounded-md p-3 shadow-sm">
                                        <p className="text-xs font-medium text-gray-500 mb-1">{t('label.activity.ending_date')}</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {new Date(activity.endingDate).toLocaleDateString('ro-RO')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
                            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-green-600 rounded"></span>
                                {t('label.project.planned_budget')}
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white rounded-md p-3 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 mb-1">{t('label.project_expense.total_planned_expenses')}</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {activity.totalActivityExpensesAmount.toLocaleString('ro-RO')} <span className="text-sm font-normal text-gray-600">RON</span>
                                    </p>
                                </div>
                                <div className="bg-white rounded-md p-3 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 mb-1">{t('label.project_fund.total_amount')}</p>
                                    <p className="text-lg font-bold text-green-600">
                                        {activity.totalFundsAmount.toLocaleString('ro-RO')} <span className="text-sm font-normal text-gray-600">RON</span>
                                    </p>
                                </div>
                                <div className="bg-white rounded-md p-3 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 mb-1">{t('label.entity_donation.total_donations')}</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {activity.totalDonationsAmount.toLocaleString('ro-RO')} <span className="text-sm font-normal text-gray-600">RON</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {(activity.results || activity.indicators || activity.observation) && (
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
                                <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-5 bg-purple-600 rounded"></span>
                                    {t('label.activity.section_additional')}
                                </h3>
                                <div className="space-y-4">
                                    {activity.results && (
                                        <div className="bg-white rounded-md p-3 shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 mb-1">{t('label.activity.results')}</p>
                                            <p className="text-sm text-gray-700 leading-relaxed">{activity.results}</p>
                                        </div>
                                    )}
                                    {activity.indicators && (
                                        <div className="bg-white rounded-md p-3 shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 mb-1">{t('label.activity.indicators')}</p>
                                            <p className="text-sm text-gray-700 leading-relaxed">{activity.indicators}</p>
                                        </div>
                                    )}
                                    {activity.observation && (
                                        <div className="bg-white rounded-md p-3 shadow-sm">
                                            <p className="text-xs font-medium text-gray-500 mb-1">{t('label.activity.observation')}</p>
                                            <p className="text-sm text-gray-700 leading-relaxed">{activity.observation}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                        <div className="flex gap-3">
                            {canEditActivity && (
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="inline-flex items-center px-6 py-3 text-base font-medium text-orange-500 bg-white hover:bg-orange-50 rounded-lg transition-colors duration-200"
                                >
                                    <IconEdit className="w-4 h-4 mr-2" />
                                    {t('action.edit')}
                                </button>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="inline-flex items-center px-6 py-3 text-base font-medium text-orange-500 bg-white hover:bg-orange-50 rounded-lg transition-colors duration-200"
                        >
                            {t('action.close')}
                        </button>
                    </div>
                </div>
            ) : (
                <DynamicForm<UpdateActivityData>
                    config={formConfig}
                    schema={updateActivitySchema}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    defaultValues={defaultValues}
                    isSubmitting={isSubmitting}
                />
            )}
        </Modal>
    );
};
