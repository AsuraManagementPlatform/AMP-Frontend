import React, {useState} from 'react';
import {Modal} from '@/components/ui/Modal';
import {DynamicForm} from '@/components/forms/DynamicForm';
import {completeActivityFormConfig} from '@/config/activity.form.config';
import {CompleteActivityData, completeActivitySchema} from '@/schemas/activity.schema';
import activityService from '@/services/activity.service';
import showToast from '@/components/ui/Toast';
import {Activity, ActivityCompleteRequest} from '@/types/activity.types';
import {useTranslation} from "react-i18next";

interface CompleteActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    activity: Activity;
    project: string;
}

export const CompleteActivityModal: React.FC<CompleteActivityModalProps> = ({
                                                                                isOpen,
                                                                                onClose,
                                                                                onSuccess,
                                                                                activity,
                                                                            }) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: CompleteActivityData) => {
        const completeData: ActivityCompleteRequest = {
            id: data.id,
            endingDate: data.endingDate,
        }

        try {
            setIsSubmitting(true);
            await activityService.complete(completeData);
            showToast.success(t('toast.activity.completed'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.activity.complete_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = completeActivityFormConfig();

    const defaultValues: CompleteActivityData = {
        id: activity.id,
        project: activity.project,
        startingDate: activity.startingDate,
        endingDate: activity.endingDate || '',
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('label.activity.complete_activity')}
            size="lg"
        >
            <DynamicForm<CompleteActivityData>
                config={formConfig}
                schema={completeActivitySchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};