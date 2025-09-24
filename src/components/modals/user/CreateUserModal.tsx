import React, { useState } from 'react';
import { FormModal } from '@/components/ui/Modal.tsx';
import { DynamicForm } from '@/components/forms/DynamicForm.tsx';
import { createUserFormConfig } from '@/config/user.form.config.ts';
import { createUserSchema, UserCreateRequest, getCreateUserDefaultValues } from '@/schemas/user.schema.ts';
import showToast from '@/components/ui/Toast.tsx';
import {UserGroup} from "@/types/auth.types.ts";
import {UserStatus} from "@/types/user.types.ts";

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserCreateRequest) => Promise<void>;
    isAdmin?: boolean;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
                                                                    isOpen,
                                                                    onClose,
                                                                    onSubmit,
                                                                    isAdmin = false
                                                                }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [key, setKey] = useState(0);

    const formConfig = createUserFormConfig(isAdmin);
    const defaultValues = getCreateUserDefaultValues(isAdmin);

    const handleReset = () => {
        setKey(prev => prev + 1);
    };

    const handleSubmit = async (data: UserCreateRequest) => {
        try {
            setIsSubmitting(true);

            if (isAdmin) {
                data.group = UserGroup.ORGANIZATION_ADMIN;
                data.status = UserStatus.DRAFT;
            }

            if (!data.group || !data.status) {
                showToast.error('Câmpurile grup și status sunt obligatorii');
            }

            await onSubmit(data);
            onClose();
        } catch (error) {
            let errorMessage = 'A apărut o eroare necunoscută la crearea utilizatorului.';

            if (error instanceof Error) {
                errorMessage = `Eroare la crearea utilizatorului: ${error.message}`;
            } else if (typeof error === 'object' && error !== null) {
                const apiError = error as any;
                if (apiError.message) {
                    errorMessage = `Eroare la crearea utilizatorului: ${apiError.message}`;
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

            showToast.error(errorMessage);
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
        <FormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Creează utilizator nou"
            size="lg"
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
        </FormModal>
    );
};