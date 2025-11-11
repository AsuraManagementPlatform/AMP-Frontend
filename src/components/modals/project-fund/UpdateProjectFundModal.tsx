import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { updateProjectFundFormConfig } from '@/config/project-fund.form.config';
import { updateProjectFundSchema, UpdateProjectFundData } from '@/schemas/project-fund.schema';
import projectFundService from '@/services/project-fund.service';
import showToast from '@/components/ui/Toast';
import { ProjectFund, ProjectFundUpdateRequest } from '@/types/project-fund.types';
import {SelectOption} from "@/types/form.types.ts";
import {t} from "i18next";

interface UpdateProjectFundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    fund: ProjectFund;
    project: string;
    activities?: SelectOption[];
    entities?: SelectOption[];
}

export const UpdateProjectFundModal: React.FC<UpdateProjectFundModalProps> = ({
                                                                                  isOpen,
                                                                                  onClose,
                                                                                  onSuccess,
                                                                                  fund,
                                                                                  project,
                                                                                  activities = [],
                                                                                  entities = []
                                                                              }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: UpdateProjectFundData) => {
        try {
            setIsSubmitting(true);

            const projectFundUpdateRequest: ProjectFundUpdateRequest = {
                id: data.id!,
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

            await projectFundService.update(fund.id, projectFundUpdateRequest);
            showToast.success(t('toast.project_fund.updated'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.project_fund.update_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = updateProjectFundFormConfig(activities, entities);

    const defaultValues: UpdateProjectFundData = {
        id: fund.id,
        project: fund.project || project,
        activity: fund.activity || undefined,
        entity: fund.entityDonation || undefined,
        estimatedAmount: fund.estimatedAmount,
        source: fund.source || '',
        category: fund.category || '',
        sourceName: fund.sourceName || '',
        currency: fund.currency,
        estimatedDate: fund.estimatedDate || '',
        paymentMethod: fund.paymentMethod || '',
        scope: fund.scope || '',
        documentReference: fund.documentReference || '',
        notes: fund.notes || ''
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('form.project_fund.update_title')}
            size="lg"
        >
            <DynamicForm<UpdateProjectFundData>
                config={formConfig}
                schema={updateProjectFundSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};