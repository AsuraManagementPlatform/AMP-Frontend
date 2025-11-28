import React, {useEffect, useState} from 'react';
import {Modal} from '@/components/ui/Modal';
import {DynamicForm} from '@/components/forms/DynamicForm';
import projectExpenseService from '@/services/project-expense.service.ts';
import projectService from '@/services/project.service.ts';
import activityService from '@/services/activity.service.ts';
import showToast from '@/components/ui/Toast';
import {createProjectExpenseFormConfig} from "@/config/project-expense.form.config.ts";
import {
  CreateProjectExpenseData,
  createProjectExpenseSchemaWithProjectBudget,
  getCreateProjectExpenseDefaultValues
} from "@/schemas/project-expense.schema.ts";
import {Activity} from "@/types/activity.types.ts";
import {ProjectExpenseCreateRequest, ProjectExpenseStatus} from "@/types/project-expense.types.ts";
import {Vat} from "@/types/vat.types.ts";
import {Project} from "@/types/project.types.ts";
import vatService from "@/services/vat.service.ts";

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
    const [vats, setVats] = useState<Vat[]>([]);
    const [loadingVats, setLoadingVats] = useState(true);
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [totalPlannedExpenses, setTotalPlannedExpenses] = useState<number>(0);

    useEffect(() => {
        const loadProjectAndExpenses = async () => {
            try {
                const projectResponse = await projectService.getById(project);
                setProjectData(projectResponse);

                const expensesResponse = await projectExpenseService.getList({
                    pageSize: 1000,
                    filters: { 
                        project_id: project, 
                        status: ProjectExpenseStatus.PLANNED 
                    }
                });
                
                const total = expensesResponse.results.reduce((sum, expense) => {
                    const expenseTotal = (expense.quantity || 0) * (expense.unitPrice || 0);
                    return sum + expenseTotal;
                }, 0);
                setTotalPlannedExpenses(total);
            } catch (error) {
                setProjectData(null);
                setTotalPlannedExpenses(0);
            }
        };

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
            loadProjectAndExpenses();
            loadActivities();
            loadVats();
        }
    }, [isOpen, project]);

    const handleSubmit = async (data: CreateProjectExpenseData) => {
        try {
            setIsSubmitting(true);

            const projectExpenseCreateRequest: ProjectExpenseCreateRequest = {
                project: data.project,
                activity: data.activity,
                vat: data.vat,
                name: data.name,
                unitType: data.unitType,
                quantity: data.quantity,
                unitPrice: data.unitPrice,
                category: data.category,
                currency: data.currency,
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

    const formConfig = createProjectExpenseFormConfig(activities, vats);
    const defaultValues = getCreateProjectExpenseDefaultValues(project);
    const schema = createProjectExpenseSchemaWithProjectBudget(projectData?.budget, totalPlannedExpenses);

    if (loadingActivities || loadingVats) {
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
                schema={schema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};