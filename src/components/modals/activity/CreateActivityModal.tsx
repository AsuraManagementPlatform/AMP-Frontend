import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createActivityFormConfig } from '@/config/activity.form.config';
import { createActivitySchema, CreateActivityData, getCreateActivityDefaultValues } from '@/schemas/activity.schema';
import showToast from '@/components/ui/Toast';
import activityService from '@/services/activity.service';
import { ActivityCreateRequest } from '@/types/activity.types';

interface CreateActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (activity: any) => void;
    projectId?: string;
    availableProjects?: { id: string; name: string }[];
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    projectId,
    availableProjects = []
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (data: CreateActivityData) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            showToast.loading('Se creează activitatea...');

            const activityData: ActivityCreateRequest = {
                ...data,
                projectId: projectId || data.projectId,
                endDate: data.endDate || undefined,
                location: data.location || undefined,
                assignedTo: data.assignedTo || [],
                estimatedHours: data.estimatedHours || undefined,
                notes: data.notes || undefined
            };

            const activity = await activityService.create(activityData);
            
            showToast.success('Activitatea a fost creată cu succes!');
            onSuccess?.(activity);
            onClose();
        } catch (error: any) {
            console.error('Error creating activity:', error);
            showToast.error('Crearea activității a eșuat');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createActivityFormConfig(projectId, availableProjects, []);
    const defaultValues = getCreateActivityDefaultValues();

    // Set projectId if provided
    if (projectId) {
        defaultValues.projectId = projectId;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Creează activitate nouă"
            size="lg"
        >
            <DynamicForm
                config={formConfig}
                schema={createActivitySchema}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};