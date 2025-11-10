import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createEntityFormConfig } from '@/config/entity.form.config';
import { createEntitySchema, CreateEntityData, getCreateEntityDefaultValues } from '@/schemas/entity.schema';
import showToast from '@/components/ui/Toast';
import toast from 'react-hot-toast';
import entityService from '@/services/entity.service';
import { EntityCreateRequest } from '@/types/entity.types';

interface CreateEntityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (entity: any) => void;
    organization: string;
}

export const CreateEntityModal: React.FC<CreateEntityModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    organization: organization
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (data: CreateEntityData) => {
        if (isSubmitting) return;

        let loadingToastId: string | undefined;

        try {
            setIsSubmitting(true);
            loadingToastId = showToast.loading('Se creează entitatea...');

            const entityData: EntityCreateRequest = {
                organization: organization,
                legalType: data.legalType,
                name: data.name,
                identificationNumber: data.identificationNumber,
                email: data.email,
                phone: data.phone,
                address: data.address,
                address2: data.address2 || '',
                type: data.type,
                status: data.status || 'activ',
                observation: data.observation || '',
            };

            const entity = await entityService.create(entityData);
            
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            showToast.success('Entitatea a fost creată cu succes!');
            onSuccess?.(entity);
            onClose();
        } catch (error: any) {
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            showToast.error('Crearea entității a eșuat');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createEntityFormConfig();
    const defaultValues = getCreateEntityDefaultValues(organization);

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
