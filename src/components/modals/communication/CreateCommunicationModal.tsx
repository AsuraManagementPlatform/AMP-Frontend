import React, { useEffect, useState, useContext } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import showToast from '@/components/ui/Toast';
import { createCommunicationFormConfig } from '@/config/communication.form.config';
import {
    CreateCommunicationData,
    createCommunicationSchema,
    getDefaultCommunicationValues
} from '@/schemas/communication.schema';
import communicationService from '@/services/communication.service';
import { SelectOption } from '@/types/form.types';
import { CommunicationCreateRequest } from '@/types/communication.types';
import { AuthContext } from '@/context/Auth.context';

interface CreateCommunicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organizationId: string;
    admins?: SelectOption[];
    projects?: SelectOption[];
    activities?: SelectOption[];
}

export const CreateCommunicationModal: React.FC<CreateCommunicationModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    organizationId,
    admins = [],
    projects = [],
    activities = []
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const authContext = useContext(AuthContext);
    const isOrganizationAdmin = authContext?.user?.groups?.includes('organization_admin') || false;

    console.log('=== CreateCommunicationModal Debug ===');
    console.log('admins prop:', admins);
    console.log('admins length:', admins.length);
    console.log('isOrganizationAdmin:', isOrganizationAdmin);

    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (data: CreateCommunicationData) => {
        try {
            setIsSubmitting(true);

            const communicationCreateRequest: CommunicationCreateRequest = {
                type: data.type,
                recipient: data.recipient,
                organization: data.organization,
                subject: data.subject,
                initialMessage: data.initialMessage,
                priority: data.priority,
                relatedProject: data.relatedProject,
                relatedActivity: data.relatedActivity
            };

            console.log('=== Sending Communication Request ===');
            console.log('communicationCreateRequest:', communicationCreateRequest);

            await communicationService.create(communicationCreateRequest);
            showToast.success('Mesajul a fost trimis cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('=== Communication Create Error ===', error);
            showToast.error(error.message || 'Nu s-a putut trimite mesajul. Încercați din nou.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createCommunicationFormConfig(admins, projects, activities, isOrganizationAdmin);
    
    const firstAdmin = admins.find(admin => admin.label.includes('(Admin)'));
    const firstAdminId = firstAdmin ? String(firstAdmin.value) : '';

    const defaultValues = getDefaultCommunicationValues(organizationId, firstAdminId);

    console.log('defaultValues for form:', defaultValues);
    console.log('firstAdmin:', firstAdmin);
    console.log('firstAdminId:', firstAdminId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Trimite Mesaj către ONG"
            size="lg"
        >
            <DynamicForm<CreateCommunicationData>
                config={formConfig}
                schema={createCommunicationSchema}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};
