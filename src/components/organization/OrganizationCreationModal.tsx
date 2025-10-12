import React, {useEffect} from 'react';
import {FormModal} from '@/components/ui/Modal';
import {DynamicForm} from '@/components/forms/DynamicForm';
import {createOrganizationFormConfig} from '@/config/organization.form.config';
import {
    CreateOrganizationData,
    createOrganizationSchema,
    getCreateOrganizationDefaultValues
} from '@/schemas/organization.schema';
import {User, UserMeResponse} from '@/types/user.types';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';

interface OrganizationCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateOrganizationData) => void;
    isSubmitting: boolean;
    pendingAdminUsers: User[];
    loadingPendingUsers: boolean;
    preselectedUser?: UserMeResponse | null;
}

export const OrganizationCreationModal: React.FC<OrganizationCreationModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    pendingAdminUsers,
    loadingPendingUsers,
    preselectedUser
}) => {
    const formConfig = createOrganizationFormConfig(pendingAdminUsers, loadingPendingUsers, preselectedUser);
    const defaultValues = getCreateOrganizationDefaultValues(preselectedUser);

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title="Înregistrează organizație"
            size="md"
        >
            <DynamicForm<CreateOrganizationData>
                config={formConfig}
                schema={createOrganizationSchema}
                onSubmit={onSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </FormModal>
    );
};