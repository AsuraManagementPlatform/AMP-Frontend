import React, {useState} from 'react';
import {Modal} from '@/components/ui/Modal.tsx';
import {DynamicForm} from '@/components/forms/DynamicForm.tsx';
import showToast from '@/components/ui/Toast.tsx';
import {updateEntityCommunicationFormConfig} from '@/config/entity-communication.form.config.ts';
import {
    getUpdateEntityCommunicationValues,
    UpdateEntityCommunicationData,
    updateEntityCommunicationSchema
} from '@/schemas/entity-communication.schema.ts';
import {entityCommunicationService} from '@/services/entity-communicationService.ts';
import {EntityCommunication, EntityCommunicationUpdateRequest} from '@/types/entity-communication.types.ts';
import {SelectOption} from '@/types/form.types.ts';

interface UpdateEntityCommunicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    entityCommunication: EntityCommunication;
    organizationMembers?: SelectOption[];
}

export const UpdateEntityCommunicationModal: React.FC<UpdateEntityCommunicationModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    entityCommunication,
    organizationMembers
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: UpdateEntityCommunicationData) => {
        try {
            setIsSubmitting(true);

            const entityCommunicationUpdateRequest: EntityCommunicationUpdateRequest = {
                id: data.id,
                entity: data.entity,
                responsible: data.responsible,
                date: data.date,
                type: data.type,
                topic: data.topic,
                content: data.content,
                notes: data.notes,
                nextSteps: data.nextSteps
            };

            await entityCommunicationService.update(entityCommunicationUpdateRequest);
            showToast.success('Comunicarea a fost actualizată cu succes!');
            onSuccess?.();
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Nu s-a putut actualiza comunicarea. Încercați din nou.';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = updateEntityCommunicationFormConfig(organizationMembers);
    const defaultValues = getUpdateEntityCommunicationValues(entityCommunication)

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editează Comunicare"
            size="lg"
        >
            <DynamicForm
                config={formConfig}
                schema={updateEntityCommunicationSchema}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};