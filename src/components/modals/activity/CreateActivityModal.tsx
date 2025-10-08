import React, {useState} from 'react';
import {Modal} from '@/components/ui/Modal';
import {DynamicForm} from '@/components/forms/DynamicForm';
import {createActivityFormConfig} from '@/config/activity.form.config';
import {CreateActivityData, createActivitySchema, getCreateActivityDefaultValues} from '@/schemas/activity.schema';
import activityService from '@/services/activity.service';
import showToast from '@/components/ui/Toast';
import {ActivityCreateRequest} from "@/types/activity.types.ts";

interface CreateActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projectId: string;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onSuccess,
                                                                            projectId
                                                                        }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: CreateActivityData) => {
        try {
            setIsSubmitting(true);
            const activityCreateRequest: ActivityCreateRequest = {
                project: data.project,
                project_objective: data.project_objective,
                title: data.title,
                description: data.description,
                starting_date: data.starting_date,
                estimated_ending_date: data.estimated_ending_date,
                ending_date: data.ending_date,
                status: data.status,
                type: data.type,
                location: data.location,
                observation: data.observation,
                results: data.results,
                indicators: data.indicators
            };

            await activityService.create(activityCreateRequest);
            showToast.success('Activitatea a fost creată cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la crearea activității';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createActivityFormConfig();
    const defaultValues = getCreateActivityDefaultValues(projectId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Creează activitate nouă"
            size="lg"
        >
            <DynamicForm<CreateActivityData>
                config={formConfig}
                schema={createActivitySchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};