import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import organizationDocumentService from '@/services/organization-document.service';
import showToast from '@/components/ui/Toast';
import {updateOrganizationDocumentFormConfig} from "@/config/organization-document.form.config";
import {
    UpdateOrganizationDocumentData,
    updateOrganizationDocumentSchema
} from "@/schemas/organization-document.schema";
import {OrganizationDocument, OrganizationDocumentUpdateRequest, DocumentType} from "@/types/organization-document.types";
import toast from 'react-hot-toast';

interface UpdateOrganizationDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    document: OrganizationDocument;
    organization: string;
}

export const UpdateOrganizationDocumentModal: React.FC<UpdateOrganizationDocumentModalProps> = ({
                                                                                        isOpen,
                                                                                        onClose,
                                                                                        onSuccess,
                                                                                        document,
                                                                                        organization
                                                                                    }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: UpdateOrganizationDocumentData) => {
        let loadingToastId: string | undefined;
        try {
            setIsSubmitting(true);
            loadingToastId = showToast.loading('Se actualizează documentul...');

            const documentUpdateRequest: OrganizationDocumentUpdateRequest = {};
            
            if (data.name) documentUpdateRequest.name = data.name;
            if (data.document_type) documentUpdateRequest.document_type = data.document_type as DocumentType;
            if (data.description !== undefined) documentUpdateRequest.description = data.description || undefined;
            if (data.document_number !== undefined) documentUpdateRequest.document_number = data.document_number || undefined;
            if (data.issue_date !== undefined) documentUpdateRequest.issue_date = data.issue_date || undefined;
            if (data.expiry_date !== undefined) documentUpdateRequest.expiry_date = data.expiry_date || undefined;
            if (data.issued_by !== undefined) documentUpdateRequest.issued_by = data.issued_by || undefined;
            if (data.notes !== undefined) documentUpdateRequest.notes = data.notes || undefined;
            if (data.is_active !== undefined) documentUpdateRequest.is_active = data.is_active;

            await organizationDocumentService.update(document.id, documentUpdateRequest);
            
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            showToast.success('Documentul a fost actualizat cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            const errorMessage = error?.message || 'Eroare la actualizarea documentului';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = updateOrganizationDocumentFormConfig();
    
    const defaultValues: UpdateOrganizationDocumentData = {
        organization: organization,
        name: document.name,
        document_type: document.documentType,
        description: document.description || '',
        document_number: document.documentNumber || '',
        issue_date: document.issueDate || '',
        expiry_date: document.expiryDate || '',
        issued_by: document.issuedBy || '',
        notes: document.notes || '',
        is_active: document.isActive ? 'true' : 'false' as any
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editează document"
            size="lg"
        >
            <DynamicForm<UpdateOrganizationDocumentData>
                config={formConfig}
                schema={updateOrganizationDocumentSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};
