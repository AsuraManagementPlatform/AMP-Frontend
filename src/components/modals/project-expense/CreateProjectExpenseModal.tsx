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
import {ExpenseCategory, ProjectExpenseCreateRequest, UnitType} from "@/types/project-expense.types.ts";
import {Currency, TransactionStatus} from "@/types/index.types.ts";

interface CreateProjectExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    project: string;
}

export const CreateProjectExpenseModal: React.FC<CreateProjectExpenseModalProps> = ({
                                                                                        isOpen,
                                                                                        onClose,
                                                                                        onSuccess,
                                                                                        project
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
                        project_id: project
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
    }, [isOpen, project]);

    const handleSubmit = async (data: CreateProjectExpenseData) => {
        try {
            setIsSubmitting(true);

            const projectExpenseCreateRequest: ProjectExpenseCreateRequest = {
                project: data.project,
                activity: data.activity,
                name: data.name,
                unitType: data.unitType as UnitType,
                quantity: data.quantity,
                unitPrice: data.unitPrice,
                category: data.category as ExpenseCategory,
                currency: data.currency as Currency,
                status: data.status as TransactionStatus,
            }

            await projectExpenseService.create(projectExpenseCreateRequest);
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
    const defaultValues = getCreateProjectExpenseDefaultValues(project);

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