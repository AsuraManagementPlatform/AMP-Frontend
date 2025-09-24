import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createIncomeFormConfig } from '@/config/financial.form.config';
import { createIncomeSchema, CreateIncomeData, getCreateIncomeDefaultValues } from '@/schemas/financial.schema';
import showToast from '@/components/ui/Toast';
import financialService from '@/services/financial.service';
import { ProjectIncomeCreateRequest } from '@/types/financial.types';

interface CreateIncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (income: any) => void;
    projectId?: string;
    availableProjects?: { id: string; name: string }[];
}

export const CreateIncomeModal: React.FC<CreateIncomeModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    projectId,
    availableProjects = []
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (data: CreateIncomeData) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            showToast.loading('Se înregistrează venitul...');

            const incomeData: ProjectIncomeCreateRequest = {
                ...data,
                projectId: projectId || data.projectId,
                expectedDate: data.expectedDate || undefined,
                receivedDate: data.receivedDate || undefined,
                invoiceNumber: data.invoiceNumber || undefined,
                contractReference: data.contractReference || undefined,
                notes: data.notes || undefined
            };

            const income = await financialService.createIncome(incomeData);
            
            showToast.success('Venitul a fost înregistrat cu succes!');
            onSuccess?.(income);
            onClose();
        } catch (error: any) {
            console.error('Error creating income:', error);
            showToast.error('Înregistrarea venitului a eșuat');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createIncomeFormConfig(projectId, availableProjects);
    const defaultValues = getCreateIncomeDefaultValues();

    // Set projectId if provided
    if (projectId) {
        defaultValues.projectId = projectId;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Înregistrează venit"
            size="lg"
        >
            <DynamicForm
                config={formConfig}
                schema={createIncomeSchema}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};