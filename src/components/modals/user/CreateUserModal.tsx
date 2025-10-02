import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal.tsx';
import { DynamicForm } from '@/components/forms/DynamicForm.tsx';
import { createUserFormConfig } from '@/config/user.form.config.ts';
import { createUserSchema, UserCreateRequest, getCreateUserDefaultValues } from '@/schemas/user.schema.ts';
import showToast from '@/components/ui/Toast.tsx';
import toast from 'react-hot-toast';
import {UserGroup} from "@/types/auth.types.ts";
import {UserStatus} from "@/types/user.types.ts";

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserCreateRequest) => Promise<void>;
    isAdmin?: boolean;
    isOrgAdmin?: boolean;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
                                                                    isOpen,
                                                                    onClose,
                                                                    onSubmit,
                                                                    isAdmin = false,
                                                                    isOrgAdmin = false
                                                                }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [key, setKey] = useState(0);

    const formConfig = createUserFormConfig(isAdmin, isOrgAdmin);
    const defaultValues = getCreateUserDefaultValues(isAdmin, isOrgAdmin);

    const handleReset = () => {
        setKey(prev => prev + 1);
        showToast.formReset();
    };

    const handleSubmit = async (data: UserCreateRequest) => {
        let loadingToast: string | undefined;

        try {
            setIsSubmitting(true);

            loadingToast = showToast.creatingUser();

            if (isAdmin) {
                data.group = UserGroup.ORGANIZATION_ADMIN;
                data.status = UserStatus.DRAFT;
            }

            if (!data.group || !data.status) {
                showToast.error('Câmpurile grup și status sunt obligatorii');
            }

            await onSubmit(data);

            if (loadingToast) {
                toast.dismiss(loadingToast);
            }

            onClose();
        } catch (error) {
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }

            let errorMessage = 'A apărut o eroare necunoscută la crearea utilizatorului.';

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
                showToast.userCreationFailed(errorMessage);
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Creează utilizator nou"
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