import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createProjectFundFormConfig } from '@/config/project-fund.form.config';
import { createProjectFundSchema, CreateProjectFundData, getCreateProjectFundDefaultValues } from '@/schemas/project-fund.schema';
import projectFundService from '@/services/project-fund.service';
import showToast from '@/components/ui/Toast';
import {ProjectFundCreateRequest} from "@/types/project-fund.types.ts";
import {SelectOption} from "@/types/form.types.ts";
import {t} from "i18next";

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
            const errorMessage = error?.message || t('toast.project_fund.create_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createProjectFundFormConfig(activities, entities);
    const defaultValues = getCreateProjectFundDefaultValues(project);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('form.project_fund.create_title')}
            size="lg"
        >
            <DynamicForm<CreateProjectFundData>
                config={formConfig}
                schema={createProjectFundSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};