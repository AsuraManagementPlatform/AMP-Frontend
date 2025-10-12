import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createProjectFundFormConfig } from '@/config/project-fund.form.config';
import { createProjectFundSchema, CreateProjectFundData, getCreateProjectFundDefaultValues } from '@/schemas/project-fund.schema';
import projectFundService from '@/services/project-fund.service';
import showToast from '@/components/ui/Toast';

interface CreateProjectFundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    projectId: string;
}

export const CreateProjectFundModal: React.FC<CreateProjectFundModalProps> = ({
                                                                                  isOpen,
                                                                                  onClose,
                                                                                  onSuccess,
                                                                                  projectId
                                                                              }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: CreateProjectFundData) => {
        try {
            setIsSubmitting(true);
            await projectFundService.create(data);
            showToast.success('Finan╚¢area a fost ad─âugat─â cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la ad─âugarea finan╚¢─ârii';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createProjectFundFormConfig(projectId);
    const defaultValues = getCreateProjectFundDefaultValues(projectId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Adaug─â surs─â de finan╚¢are"
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
