import React, {useState} from 'react';
import {Modal} from '@/components/ui/Modal';
import {DynamicForm} from '@/components/forms/DynamicForm';
import {updateEntityFormConfig} from '@/config/entity.form.config';
import {UpdateEntityData, updateEntitySchema} from '@/schemas/entity.schema';
import showToast from '@/components/ui/Toast';
import entityService from '@/services/entity.service';
import {Entity, EntityUpdateRequest} from '@/types/entity.types';

interface UpdateEntityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    entity: Entity;
}

export const UpdateEntityModal: React.FC<UpdateEntityModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    entity
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: UpdateEntityData) => {
        try {
            setIsSubmitting(true);

            const updateRequest: EntityUpdateRequest = {
                id: data.id,
                organization: data.organization,
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

            await entityService.update(updateRequest);

            showToast.success('Entitatea a fost actualizată cu succes!');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la actualizarea entității';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const defaultValues: UpdateEntityData = {
        id: entity.id,
        organization: entity.organization,
        legalType: entity.legalType,
        name: entity.name,
        identificationNumber: entity.identificationNumber,
        email: entity.email,
        phone: entity.phone,
        address: entity.address,
        address2: entity.address2 || '',
        type: entity.type,
        status: entity.status,
        observation: entity.observation || '',
        engagementLevel: entity.engagementLevel
    };

    const formConfig = updateEntityFormConfig();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Actualizează entitate"
            size="lg"
        >
            <DynamicForm<UpdateEntityData>
                config={formConfig}
                schema={updateEntitySchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};
