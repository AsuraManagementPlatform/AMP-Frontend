import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { updateEntityFormConfig } from '@/config/entity.form.config';
import { createEntitySchema, CreateEntityData } from '@/schemas/entity.schema';
import showToast from '@/components/ui/Toast';
import toast from 'react-hot-toast';
import entityService from '@/services/entity.service';
import { Entity, EntityUpdateRequest } from '@/types/entity.types';

interface UpdateEntityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    entityId: string;
}

export const UpdateEntityModal: React.FC<UpdateEntityModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    entityId
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentEntity, setCurrentEntity] = useState<Entity | null>(null);

    useEffect(() => {
        const loadEntity = async () => {
            try {
                setIsLoading(true);
                const entity = await entityService.getById(entityId);
                setCurrentEntity(entity);
            } catch (error) {
                showToast.error('Eroare la încărcarea entității');
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen && entityId) {
            loadEntity();
        }
    }, [isOpen, entityId]);

    const handleSubmit = async (data: CreateEntityData) => {
        let loadingToastId: string | undefined;

        try {
            setIsSubmitting(true);
            loadingToastId = showToast.loading('Se actualizează entitatea...');

            const updateRequest: EntityUpdateRequest = {
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
                engagementLevel: data.engagementLevel
            };

            await entityService.update(entityId, updateRequest);
            
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            showToast.success('Entitatea a fost actualizată cu succes!');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            const errorMessage = error?.message || 'Eroare la actualizarea entității';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const defaultValues: CreateEntityData | undefined = currentEntity ? {
        legalType: currentEntity.legalType,
        name: currentEntity.name,
        identificationNumber: currentEntity.identificationNumber,
        email: currentEntity.email,
        phone: currentEntity.phone,
        address: currentEntity.address,
        address2: currentEntity.address2 || '',
        type: currentEntity.type,
        status: currentEntity.status,
        observation: currentEntity.observation || '',
        engagementLevel: currentEntity.engagementLevel
    } : undefined;

    const formConfig = updateEntityFormConfig();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Actualizează entitate"
            size="lg"
        >
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <DynamicForm<CreateEntityData>
                    config={formConfig}
                    schema={createEntitySchema}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    defaultValues={defaultValues}
                    isSubmitting={isSubmitting}
                />
            )}
        </Modal>
    );
};
