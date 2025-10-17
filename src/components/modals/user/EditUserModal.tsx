import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal.tsx';
import { DynamicForm } from '@/components/forms/DynamicForm.tsx';
import { createUserFormConfig } from '@/config/user.form.config.ts';
import { createUserSchema, UserCreateRequest } from '@/schemas/user.schema.ts';
import { UserMeResponse } from '@/types/user.types.ts';
import showToast from '@/components/ui/Toast.tsx';
import toast from 'react-hot-toast';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserCreateRequest) => Promise<void>;
    user: UserMeResponse | null;
    isAdmin?: boolean;
    isOrgAdmin?: boolean;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    user,
    isAdmin = false,
    isOrgAdmin = false
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [key, setKey] = useState(0);

    const formConfig = {
        ...createUserFormConfig(isAdmin, isOrgAdmin),
        submitButtonText: 'Salvează',
        cancelButtonText: 'Anulează'
    };

    const defaultValues: Partial<UserCreateRequest> = user ? {
        full_name: user.fullName || '',
        email: user.email || '',
        personal_numerical_number: user.personalNumericalNumber || '',
        phone_number: user.phoneNumber || '',
        isLegalEntity: user.isLegalEntity || false,
        company_number: user.companyNumber || '',
        company_name: user.companyName || '',
        group: user.groups?.[0] || '',
        status: user.status || ''
    } : {};

    const handleReset = () => {
        setKey(prev => prev + 1);
        showToast.formReset();
    };

    const handleSubmit = async (data: UserCreateRequest) => {
        let loadingToast: string | undefined;

        try {
            setIsSubmitting(true);
            loadingToast = showToast.updatingUser();

            await onSubmit(data);

            if (loadingToast) {
                toast.dismiss(loadingToast);
            }

            onClose();
        } catch (error) {
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }

            let errorMessage = 'A apărut o eroare necunoscută la actualizarea utilizatorului.';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null) {
                const apiError = error as any;
                if (apiError.message) {
                    errorMessage = apiError.message;
                }
                if (apiError.details && Array.isArray(apiError.details) && apiError.details.length > 0) {
                    const detailMessages = apiError.details.map((detail: any) =>
                        typeof detail === 'string' ? detail : detail.message || JSON.stringify(detail)
                    ).join(', ');
                    errorMessage += ` Detalii: ${detailMessages}`;
                }
                if (apiError.status) {
                    errorMessage += ` (Status: ${apiError.status})`;
                }
            }
            
            if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('există deja')) {
                showToast.duplicateEntry(errorMessage);
            } else if (errorMessage.toLowerCase().includes('obligatorii') || errorMessage.toLowerCase().includes('required')) {
                showToast.requiredFieldsMissing();
            } else if (errorMessage.toLowerCase().includes('validare') || errorMessage.toLowerCase().includes('validation')) {
                showToast.validationError(errorMessage);
            } else {
                showToast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    if (!user) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Editează utilizator"
            size="md"
            showResetButton={true}
            onReset={handleReset}
        >
            <DynamicForm<UserCreateRequest>
                key={key}
                config={formConfig}
                schema={createUserSchema}
                onSubmit={handleSubmit}
                onCancel={handleClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};
