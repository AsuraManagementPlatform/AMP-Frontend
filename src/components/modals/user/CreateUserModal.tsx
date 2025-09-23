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

    const formConfig = createUserFormConfig(isAdmin);
    const defaultValues = getCreateUserDefaultValues(isAdmin);

    const handleSubmit = async (data: UserCreateRequest) => {
        try {
            setIsSubmitting(true);

            if (isAdmin) {
                data.group = UserGroup.ORGANIZATION_ADMIN;
                data.status = UserStatus.DRAFT;
            }

            await onSubmit(data);
            onClose();
            showToast.success('Utilizator creat cu succes!');
        } catch (error) {
            if (error instanceof Error) {
                showToast.error(`Eroare la crearea utilizatorului: ${error.message}`);
            } else {
                showToast.error('A apărut o eroare necunoscută la crearea utilizatorului.');
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
        <FormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Creează utilizator nou"
            size="lg"
        >
            <DynamicForm<UserCreateRequest>
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