import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import organizationDocumentService from '@/services/organization-document.service';
import showToast from '@/components/ui/Toast';
import {createOrganizationDocumentFormConfig} from "@/config/organization-document.form.config";
import {
    CreateOrganizationDocumentData,
    createOrganizationDocumentSchema,
    getCreateOrganizationDocumentDefaultValues
} from "@/schemas/organization-document.schema";
import {OrganizationDocumentCreateRequest, DocumentType} from "@/types/organization-document.types";
import toast from 'react-hot-toast';

interface CreateOrganizationDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organization: string;
}

export const CreateOrganizationDocumentModal: React.FC<CreateOrganizationDocumentModalProps> = ({
                                                                                        isOpen,
                                                                                        onClose,
                                                                                        onSuccess,
                                                                                        organization
                                                                                    }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: CreateOrganizationDocumentData) => {
        let loadingToastId: string | undefined;
        try {
            setIsSubmitting(true);
            loadingToastId = showToast.loading('Se salvează documentul...');

            const documentCreateRequest: OrganizationDocumentCreateRequest = {
                organization: data.organization,
                name: data.name,
                document_type: data.document_type as DocumentType,
                description: data.description || undefined,
                document_number: data.document_number || undefined,
                issue_date: data.issue_date || undefined,
                expiry_date: data.expiry_date || undefined,
                issued_by: data.issued_by || undefined,
                notes: data.notes || undefined,
                is_active: data.is_active ?? true
            };

            await organizationDocumentService.create(documentCreateRequest);
            
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            showToast.success('Documentul a fost adăugat cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            const errorMessage = error?.message || 'Eroare la adăugarea documentului';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createOrganizationDocumentFormConfig();
    const defaultValues = getCreateOrganizationDocumentDefaultValues(organization);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Adaugă document"
            size="lg"
        >
            <DynamicForm<CreateOrganizationDocumentData>
                config={formConfig}
                schema={createOrganizationDocumentSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};
