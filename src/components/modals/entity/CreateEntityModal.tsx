import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createEntityFormConfig } from '@/config/entity.form.config';
import { createEntitySchema, CreateEntityData, getCreateEntityDefaultValues } from '@/schemas/entity.schema';
import showToast from '@/components/ui/Toast';
import entityService from '@/services/entity.service';
import { EntityCreateRequest } from '@/types/entity.types';

interface CreateEntityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (entity: any) => void;
    organizationId?: string;
}

export const CreateEntityModal: React.FC<CreateEntityModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    organizationId
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (data: CreateEntityData) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            showToast.loading('Se creează entitatea...');

            const entityData: EntityCreateRequest = {
                ...data,
                organizationId: organizationId || data.organizationId,
                email: data.email || undefined,
                phoneNumber: data.phoneNumber || undefined,
                address: data.address || undefined,
                contactPerson: data.contactPerson || undefined,
                website: data.website || undefined,
                description: data.description || undefined,
                userId: data.userId || undefined,
                taxId: data.taxId || undefined,
                registrationNumber: data.registrationNumber || undefined
            };

            const entity = await entityService.create(entityData);
            
            showToast.success('Entitatea a fost creată cu succes!');
            onSuccess?.(entity);
            onClose();
        } catch (error: any) {
            console.error('Error creating entity:', error);
            showToast.error('Crearea entității a eșuat');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createEntityFormConfig(organizationId, []);
    const defaultValues = getCreateEntityDefaultValues();

    // Set organizationId if provided
    if (organizationId) {
        defaultValues.organizationId = organizationId;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Creează entitate nouă"
            size="lg"
        >
            <DynamicForm
                config={formConfig}
                schema={createEntitySchema}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};