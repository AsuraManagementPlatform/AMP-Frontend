import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import showToast from '@/components/ui/Toast';
import toast from 'react-hot-toast';
import { updateCommunicationFormConfig } from '@/config/communication.form.config';
import { communicationSchema, CommunicationFormData } from '@/schemas/communication.schema';
import { communicationService } from '@/services/communication.service';
import { EntityCommunication } from '@/types/communication.types';
import { SelectOption } from '@/types/form.types';

interface UpdateCommunicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    communicationId: string;
    entities: SelectOption[];
    projects?: SelectOption[];
}

export const UpdateCommunicationModal: React.FC<UpdateCommunicationModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    communicationId,
    entities,
    projects = []
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [communication, setCommunication] = useState<EntityCommunication | null>(null);

    const formConfig = updateCommunicationFormConfig(entities, projects);

    useEffect(() => {
        if (isOpen && communicationId) {
            loadCommunication();
        }
    }, [isOpen, communicationId]);

    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
            setIsLoading(false);
            setCommunication(null);
        }
    }, [isOpen]);

    const loadCommunication = async () => {
        try {
            setIsLoading(true);
            const data = await communicationService.getById(communicationId);
            setCommunication(data);
        } catch (error) {
            showToast.error('Nu s-au putut încărca datele comunicării');
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (data: CommunicationFormData) => {
        if (isSubmitting || !communication) return;

        let loadingToastId: string | undefined;

        try {
            setIsSubmitting(true);
            loadingToastId = showToast.loading('Se actualizează comunicarea...');

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

            await communicationService.update(communication.id, communicationData);
            
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            showToast.success('Comunicarea a fost actualizată cu succes!');
            onSuccess?.();
            onClose();
        } catch (error) {
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            showToast.error('Nu s-a putut actualiza comunicarea. Încercați din nou.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDefaultValues = (): Partial<CommunicationFormData> => {
        if (!communication) return {};
        
        return {
            entity_id: communication.entityId,
            date: communication.date,
            type: communication.type,
            status: communication.status,
            subject: communication.subject,
            content: communication.content,
            contact_person: communication.contactPerson || '',
            project_id: communication.projectId || '',
            next_steps: communication.nextSteps || ''
        };
    };

    if (isLoading) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Editează Comunicare"
                size="lg"
            >
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Se încarcă...</span>
                </div>
            </Modal>
        );
    }

    if (!communication) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editează Comunicare"
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