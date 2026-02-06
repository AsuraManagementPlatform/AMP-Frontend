import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { updateProjectPartnerFormConfig } from '@/config/project-partner.form.config';
import {
    UpdateProjectPartnerData,
    updateProjectPartnerSchema,
    getUpdateProjectPartnerDefaultValues
} from '@/schemas/project-partner.schema';
import projectPartnerService from '@/services/project-partner.service';
import showToast from '@/components/ui/Toast';
import { ProjectPartner } from "@/types/project-partner.types";
import { useTranslation } from 'react-i18next';

interface UpdateProjectPartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    partner: ProjectPartner;
}

export const UpdateProjectPartnerModal: React.FC<UpdateProjectPartnerModalProps> = ({
                                                                                        isOpen,
                                                                                        onClose,
                                                                                        onSuccess,
                                                                                        partner
                                                                                    }) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: UpdateProjectPartnerData) => {
        try {
            setIsSubmitting(true);
            await projectPartnerService.update({
                id: partner.id,
                engagementLevel: data.engagementLevel,
                budget: data.budget
            });
            showToast.success(t('toast.project_partner.updated'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.project_partner.update_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = updateProjectPartnerFormConfig();
    const defaultValues = getUpdateProjectPartnerDefaultValues(partner);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('form.project_partner.update_title')}
            size="md"
        >
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    {t('label.project_partner.partner_info')}
                </h4>
                <div className="space-y-1 text-sm">
                    <div>
                        <span className="text-gray-600">{t('label.project_partner.entity')}: </span>
                        <span className="font-medium">{partner.entityName}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">{t('label.project_partner.project')}: </span>
                        <span className="font-medium">{partner.projectName}</span>
                    </div>
                </div>
            </div>

            <DynamicForm<UpdateProjectPartnerData>
                config={formConfig}
                schema={updateProjectPartnerSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};