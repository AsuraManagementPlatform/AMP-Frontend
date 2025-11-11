import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { updateActivityFormConfig } from '@/config/activity.form.config';
import { updateActivitySchema, UpdateActivityData } from '@/schemas/activity.schema';
import activityService from '@/services/activity.service';
import showToast from '@/components/ui/Toast';
import { Activity } from '@/types/activity.types';

interface UpdateActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    activity: Activity;
    project: string;
}

export const UpdateActivityModal: React.FC<UpdateActivityModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onSuccess,
                                                                            activity,
                                                                        }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: UpdateActivityData) => {
        try {
            setIsSubmitting(true);
            await activityService.update(activity.id, data);
            showToast.success('Activitatea a fost actualizată cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la actualizarea activității';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
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
            title="Actualizează activitate"
            size="lg"
        >
            <DynamicForm<UpdateActivityData>
                config={formConfig}
                schema={updateActivitySchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};