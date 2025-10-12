import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createActivityFormConfig } from '@/config/activity.form.config';
import { createActivitySchema, CreateActivityData, getCreateActivityDefaultValues } from '@/schemas/activity.schema';
import showToast from '@/components/ui/Toast';
import activityService from '@/services/activity.service';
import toast from 'react-hot-toast';

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
    const [formKey, setFormKey] = useState(0);
    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (data: CreateActivityData) => {
        if (isSubmitting) return;

        let loadingToastId: string | undefined;
        
        try {
            setIsSubmitting(true);
            loadingToastId = showToast.loading('Se creează activitatea...');

            const activity = await activityService.create(data);
            
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            showToast.success('Activitatea a fost creată cu succes!');
            onSuccess?.(activity);
            onClose();
        } catch (error: any) {
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            
            let errorMessage = 'Crearea activității a eșuat';
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.response?.data?.details) {
                errorMessage = `Eroare: ${JSON.stringify(error.response.data.details)}`;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormKey(prev => prev + 1);
    };

    const formConfig = createActivityFormConfig(projectId, availableProjects, []);
    const defaultValues = getCreateActivityDefaultValues();
    if (projectId) {
        defaultValues.project = projectId;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Creează activitate nouă"
            size="lg"
            showResetButton={true}
            onReset={handleReset}
        >
            <DynamicForm
                key={formKey}
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
