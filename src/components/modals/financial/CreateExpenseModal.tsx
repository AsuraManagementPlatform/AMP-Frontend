import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createExpenseFormConfig } from '@/config/financial.form.config';
import { createExpenseSchema, CreateExpenseData, getCreateExpenseDefaultValues } from '@/schemas/financial.schema';
import showToast from '@/components/ui/Toast';
import financialService from '@/services/financial.service';
import { ProjectExpenseCreateRequest } from '@/types/financial.types';

interface CreateExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (expense: any) => void;
    projectId?: string;
    availableProjects?: { id: string; name: string }[];
}

export const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    projectId,
    availableProjects = []
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (data: CreateExpenseData) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            showToast.loading('Se înregistrează cheltuiala...');

            const expenseData: ProjectExpenseCreateRequest = {
                ...data,
                projectId: projectId || data.projectId,
                vendor: data.vendor || undefined,
                receiptUrl: data.receiptUrl || undefined,
                notes: data.notes || undefined
            };

            const expense = await financialService.createExpense(expenseData);
            
            showToast.success('Cheltuiala a fost înregistrată cu succes!');
            onSuccess?.(expense);
            onClose();
        } catch (error: any) {
            showToast.error('Înregistrarea cheltuielii a eșuat');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createExpenseFormConfig(projectId, availableProjects);
    const defaultValues = getCreateExpenseDefaultValues();
    if (projectId) {
        defaultValues.projectId = projectId;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Înregistrează cheltuială"
            size="lg"
        >
            <DynamicForm
                config={formConfig}
                schema={createExpenseSchema}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};
