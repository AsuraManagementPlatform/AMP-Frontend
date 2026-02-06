import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal} from '@/components/ui/Modal.tsx';
import {DynamicForm} from '@/components/forms/DynamicForm.tsx';
import showToast from '@/components/ui/Toast.tsx';
import {createEntityCommunicationFormConfig} from '@/config/entity-communication.form.config.ts';
import {
    CreateEntityCommunicationData,
    createEntityCommunicationSchema,
    getDefaultEntityCommunicationValues
} from '@/schemas/entity-communication.schema.ts';
import {entityCommunicationService} from '@/services/entity-communicationService.ts';
import {SelectOption} from '@/types/form.types.ts';
import {EntityCommunicationCreateRequest} from "@/types/entity-communication.types.ts";

interface CreateEntityCommunicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    entityId: string;
    organizationMembers?: SelectOption[];
}

export const CreateEntityCommunicationModal: React.FC<CreateEntityCommunicationModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    entityId,
    organizationMembers,
}) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (data: CreateEntityCommunicationData) => {
        try {
            setIsSubmitting(true);

            const entityCommunicationCreateRequest: EntityCommunicationCreateRequest = {
                entity: entityId,
                responsible: data.responsible,
                date: data.date,
                type: data.type,
                topic: data.topic,
                content: data.content,
                notes: data.notes,
                nextSteps: data.nextSteps
            };

            await entityCommunicationService.create(entityCommunicationCreateRequest);
            showToast.success(t('toast.entity_communication.created'));
            onSuccess();
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : t('toast.entity_communication.create_error');
            showToast.error(errorMessage.includes('.') ? t(errorMessage) : errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


    const formConfig = createEntityCommunicationFormConfig(organizationMembers);
    const defaultValues = getDefaultEntityCommunicationValues(entityId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('label.entity_communication.create_title')}
            size="lg"
        >
            <DynamicForm<CreateEntityCommunicationData>
                config={formConfig}
                schema={createEntityCommunicationSchema}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};