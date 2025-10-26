import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createProjectFundFormConfig } from '@/config/project-fund.form.config';
import { createProjectFundSchema, CreateProjectFundData, getCreateProjectFundDefaultValues } from '@/schemas/project-fund.schema';
import projectFundService from '@/services/project-fund.service';
import showToast from '@/components/ui/Toast';
import {ProjectFundCreateRequest} from "@/types/project-fund.types.ts";

interface CreateProjectFundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    project: string;
}

export const CreateProjectFundModal: React.FC<CreateProjectFundModalProps> = ({
                                                                                  isOpen,
                                                                                  onClose,
                                                                                  onSuccess,
                                                                                  project
                                                                              }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: CreateProjectFundData) => {
        try {
            setIsSubmitting(true);

            const projectFundCreateRequest: ProjectFundCreateRequest = {
                project: data.project,
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
            showToast.success('Finanțarea a fost adăugată cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la adăugarea finanțării';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createProjectFundFormConfig();
    const defaultValues = getCreateProjectFundDefaultValues(project);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Adaugă sursă de finanțare"
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
