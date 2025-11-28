import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createProjectFundFormConfig } from '@/config/project-fund.form.config';
import { createProjectFundSchemaWithProjectBudget, CreateProjectFundData, getCreateProjectFundDefaultValues } from '@/schemas/project-fund.schema';
import projectFundService from '@/services/project-fund.service';
import projectService from '@/services/project.service';
import showToast from '@/components/ui/Toast';
import {ProjectFundCreateRequest, ProjectFundStatus} from "@/types/project-fund.types.ts";
import {SelectOption} from "@/types/form.types.ts";
import {t} from "i18next";
import {Project} from "@/types/project.types.ts";
import {Card} from "@/components/ui/Card.tsx";

interface CreateProjectFundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    project: string;
    activities?: SelectOption[];
    entities?: SelectOption[];
}

export const CreateProjectFundModal: React.FC<CreateProjectFundModalProps> = ({
                                                                                  isOpen,
                                                                                  onClose,
                                                                                  onSuccess,
                                                                                  project,
                                                                                  activities = [],
                                                                                  entities = []
                                                                              }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [totalReceivedFunds, setTotalReceivedFunds] = useState<number>(0);
    const [currentAmount, setCurrentAmount] = useState<number>(0);

    useEffect(() => {
        const loadProjectAndFunds = async () => {
            try {
                const projectResponse = await projectService.getById(project);
                setProjectData(projectResponse);

                const fundsResponse = await projectFundService.getList({
                    pageSize: 1000,
                    filters: { 
                        project_id: project, 
                        status: ProjectFundStatus.PAID 
                    }
                });
                
                const total = fundsResponse.results.reduce((sum, fund) => sum + (fund.amount || 0), 0);
                setTotalReceivedFunds(total);
            } catch (error) {
                setProjectData(null);
                setTotalReceivedFunds(0);
            }
        };

        if (isOpen && project) {
            loadProjectAndFunds();
        }
    }, [isOpen, project]);

    const handleSubmit = async (data: CreateProjectFundData) => {
        try {
            setIsSubmitting(true);

            const projectFundCreateRequest: ProjectFundCreateRequest = {
                project: data.project,
                activity: data.activity,
                entity: data.entity,
                estimatedAmount: data.estimatedAmount,
                source: data.source,
                category: data.category,
                sourceName: data.sourceName,
                currency: data.currency,
                estimatedDate: data.estimatedDate,
                paymentMethod: data.paymentMethod,
                scope: data.scope,
                documentReference: data.documentReference,
                notes: data.notes,
            };

            await projectFundService.create(projectFundCreateRequest);
            showToast.success(t('toast.project_fund.created'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = error?.message || t('toast.project_fund.create_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createProjectFundFormConfig(activities, entities);
    const defaultValues = getCreateProjectFundDefaultValues(project);
    const schema = createProjectFundSchemaWithProjectBudget(projectData?.budget, totalReceivedFunds);

    const handleFormChange = (data: Partial<CreateProjectFundData>) => {
        const amount = typeof data.estimatedAmount === 'number' ? data.estimatedAmount : 0;
        setCurrentAmount(amount);
    };

    const projectBudget = projectData?.budget || 0;
    const newTotal = totalReceivedFunds + currentAmount;
    const remaining = projectBudget - newTotal;
    const percentageUsed = projectBudget > 0 ? (newTotal / projectBudget) * 100 : 0;
    const isOverBudget = newTotal > projectBudget;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('form.project_fund.create_title')}
            size="lg"
        >
            {isOverBudget && currentAmount > 0 && (
                <div className="mb-4 p-4 bg-red-100 border-2 border-red-400 rounded-md">
                    <p className="text-sm text-red-800 font-bold">
                        {t('schema.project_fund.budget_warning', { 
                            amount: Math.abs(remaining).toLocaleString('ro-RO', { minimumFractionDigits: 2 }), 
                            currency: projectData?.currency || 'RON' 
                        })}
                    </p>
                </div>
            )}

            {projectData && (
                <Card className="mb-4 bg-blue-50 border-blue-200">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                                {t('label.project_fund.project')} - {t('label.project.budget')}:
                            </span>
                            <span className="text-lg font-bold text-blue-900">
                                {projectBudget.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectData.currency}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                                {t('label.project_fund.total_received_funds')}:
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                                {totalReceivedFunds.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectData.currency}
                            </span>
                        </div>

                        {currentAmount > 0 && (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">
                                        {t('label.project_fund.estimated_amount')}:
                                    </span>
                                    <span className="text-sm font-semibold text-purple-700">
                                        +{currentAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectData.currency}
                                    </span>
                                </div>

                                <div className="border-t border-blue-200 pt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-800">
                                            {t('label.project_fund.total_amount')}:
                                        </span>
                                        <span className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                            {newTotal.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectData.currency}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-sm font-medium text-gray-700">
                                            {t('label.project_fund.remaining')}:
                                        </span>
                                        <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                            {isOverBudget ? '+' : ''}{remaining.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {projectData.currency}
                                        </span>
                                    </div>

                                    <div className="mt-2">
                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>{percentageUsed.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className={`h-2.5 rounded-full transition-all duration-300 ${
                                                    isOverBudget 
                                                        ? 'bg-red-500' 
                                                        : percentageUsed > 90 
                                                            ? 'bg-yellow-500' 
                                                            : 'bg-green-500'
                                                }`}
                                                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            )}

            <DynamicForm<CreateProjectFundData>
                config={formConfig}
                schema={schema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
                onChange={handleFormChange}
            />
        </Modal>
    );
};