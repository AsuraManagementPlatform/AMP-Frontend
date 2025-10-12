import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import projectExpenseService from '@/services/project-expense.service.ts';
import activityService from '@/services/activity.service.ts';
import showToast from '@/components/ui/Toast';
import {createProjectExpenseFormConfig} from "@/config/project-expense.form.config.ts";
import {
    CreateProjectExpenseData,
    createProjectExpenseSchema,
    getCreateProjectExpenseDefaultValues
} from "@/schemas/project-expense.schema.ts";
import {Activity} from "@/types/activity.types.ts";

interface CreateProjectExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projectId: string;
}

export const CreateProjectExpenseModal: React.FC<CreateProjectExpenseModalProps> = ({
                                                                                        isOpen,
                                                                                        onClose,
                                                                                        onSuccess,
                                                                                        projectId
                                                                                    }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(true);

    useEffect(() => {
        const loadActivities = async () => {
            try {
                setLoadingActivities(true);
                const response = await activityService.getList({
                    pageSize: 100,
                    filters: {
                        project_id: projectId
                    }
                });
                setActivities(response.results || []);
            } catch (error) {
                showToast.error('Eroare la încărcarea activităților');
            } finally {
                setLoadingActivities(false);
            }
        };

        if (isOpen) {
            loadActivities();
        }
    }, [isOpen, projectId]);

    const handleSubmit = async (data: CreateProjectExpenseData) => {
        try {
            setIsSubmitting(true);
            await projectExpenseService.create(data as any);
            showToast.success('Cheltuiala a fost adăugată cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la adăugarea cheltuielii';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createProjectExpenseFormConfig(activities);
    const defaultValues = getCreateProjectExpenseDefaultValues(projectId);

    if (loadingActivities) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Adaugă cheltuială" size="md">
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-600">Se încarcă...</div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Adaugă cheltuială"
            size="lg"
        >
            <DynamicForm<CreateProjectExpenseData>
                config={formConfig}
                schema={createProjectExpenseSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};