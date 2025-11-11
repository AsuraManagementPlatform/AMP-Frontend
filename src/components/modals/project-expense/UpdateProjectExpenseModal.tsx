import React, {useEffect, useState} from 'react';
import {Modal} from '@/components/ui/Modal';
import {DynamicForm} from '@/components/forms/DynamicForm';
import projectExpenseService from '@/services/project-expense.service.ts';
import activityService from '@/services/activity.service.ts';
import showToast from '@/components/ui/Toast';
import {updateProjectExpenseFormConfig} from "@/config/project-expense.form.config.ts";
import {UpdateProjectExpenseData, updateProjectExpenseSchema} from "@/schemas/project-expense.schema.ts";
import {Activity, ProjectExpense, ProjectExpenseUpdateRequest, Vat} from "@/types/index.types.ts";
import vatService from "@/services/vat.service.ts";

interface UpdateProjectExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expense: ProjectExpense;
    project: string;
}

export const UpdateProjectExpenseModal: React.FC<UpdateProjectExpenseModalProps> = ({
                                                                                        isOpen,
                                                                                        onClose,
                                                                                        onSuccess,
                                                                                        expense,
                                                                                        project
                                                                                    }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(true);
    const [vats, setVats] = useState<Vat[]>([]);
    const [loadingVats, setLoadingVats] = useState(true);

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
                if (error instanceof Error) {
                    showToast.error(error.message);
                } else {
                    showToast.error('Eroare la încărcarea activităților');
                }
            } finally {
                setLoadingActivities(false);
            }
        };
        const loadVats = async () => {
            try {
                setLoadingVats(true);
                const response = await vatService.getList({
                    pageSize: 100,
                });
                setVats(response.results || []);
            } catch (error) {
                if (error instanceof Error) {
                    showToast.error(error.message);
                } else {
                    showToast.error('Eroare la încărcarea TVA-urilor');
                }
            } finally {
                setLoadingVats(false);
            }
        };

        if (isOpen) {
            loadActivities();
            loadVats();
        }
    }, [isOpen, project]);

    const handleSubmit = async (data: UpdateProjectExpenseData) => {
        try {
            setIsSubmitting(true);

            const projectExpenseUpdateRequest: ProjectExpenseUpdateRequest = {
                id: data.id,
                project: data.project,
                activity: data.activity || null,
                vat: data.vat,
                name: data.name,
                unitType: data.unitType,
                quantity: data.quantity,
                unitPrice: data.unitPrice,
                category: data.category,
                currency: data.currency,
            }

            await projectExpenseService.update(expense.id, projectExpenseUpdateRequest);
            showToast.success('Cheltuiala a fost actualizată cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la actualizarea cheltuielii';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = updateProjectExpenseFormConfig(activities, vats);

    const defaultValues: UpdateProjectExpenseData = {
        id: expense.id,
        project: expense.project,
        activity: expense.activity || null,
        vat: expense.vat,
        name: expense.name,
        unitType: expense.unitType,
        quantity: expense.quantity,
        unitPrice: expense.unitPrice,
        category: expense.category,
        currency: expense.currency,
    };

    if (loadingActivities || loadingVats) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Actualizează cheltuială" size="md">
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
            title="Actualizează cheltuială"
            size="lg"
        >
            <DynamicForm<UpdateProjectExpenseData>
                config={formConfig}
                schema={updateProjectExpenseSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};