import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import showToast from '@/components/ui/Toast';
import toast from 'react-hot-toast';
import { createCommunicationFormConfig } from '@/config/communication.form.config';
import { communicationSchema, getDefaultCommunicationValues, CommunicationFormData } from '@/schemas/communication.schema';
import { communicationService } from '@/services/communication.service';
import { SelectOption } from '@/types/form.types';

interface CreateCommunicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (communication: any) => void;
    entities: SelectOption[];
    projects?: SelectOption[];
    entityId?: string;
}

export const CreateCommunicationModal: React.FC<CreateCommunicationModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    entities,
    projects = [],
    entityId
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formConfig = createCommunicationFormConfig(entities, projects);

    const getDefaultValues = (): Partial<CommunicationFormData> => {
        const defaults = getDefaultCommunicationValues();
        if (entityId) {
            defaults.entity_id = entityId;
        }
        return defaults;
    };

    const handleSubmit = async (data: CommunicationFormData) => {
        if (isSubmitting) return;

        let loadingToastId: string | undefined;

        try {
            setIsSubmitting(true);
            loadingToastId = showToast.loading('Se creează comunicarea...');

            const communicationData = {
                entityId: data.entity_id,
                date: data.date,
                type: data.type,
                status: data.status,
                subject: data.subject,
                content: data.content,
                contactPerson: data.contact_person,
                projectId: data.project_id,
                nextSteps: data.next_steps
            };

            const communication = await communicationService.create(communicationData);
            
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            showToast.success('Comunicarea a fost creată cu succes!');
            onSuccess?.(communication);
            onClose();
        } catch (error) {
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            showToast.error('Nu s-a putut crea comunicarea. Încercați din nou.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Adaugă Comunicare"
            size="lg"
        >
            <DynamicForm
                config={formConfig}
                schema={communicationSchema}
                defaultValues={getDefaultValues()}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};