import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createProjectPartnerFormConfig } from '@/config/project-partner.form.config';
import {
    CreateProjectPartnerData,
    createProjectPartnerSchema,
    getCreateProjectPartnerDefaultValues
} from '@/schemas/project-partner.schema';
import projectPartnerService from '@/services/project-partner.service';
import entityService from '@/services/entity.service';
import showToast from '@/components/ui/Toast';
import { ProjectPartnerCreateRequest } from "@/types/project-partner.types";
import { Entity } from "@/types/entity.types";
import {t} from "i18next";

interface CreateProjectPartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    project: string;
}

export const CreateProjectPartnerModal: React.FC<CreateProjectPartnerModalProps> = ({
                                                                                        isOpen,
                                                                                        onClose,
                                                                                        onSuccess,
                                                                                        project
                                                                                    }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loadingEntities, setLoadingEntities] = useState(true);

    useEffect(() => {
        const loadEntities = async () => {
            try {
                setLoadingEntities(true);
                const response = await entityService.getList({ pageSize: 100 });
                setEntities(response.results || []);
            } catch (error: any) {
                const errorMessage = error?.message || t('toast.project_partner.load_entities_error');
                showToast.error(errorMessage);
            } finally {
                setLoadingEntities(false);
            }
        };

        if (isOpen) {
            loadEntities();
        }
    }, [isOpen, t]);

    const handleSubmit = async (data: CreateProjectPartnerData) => {
        try {
            setIsSubmitting(true);
            const createRequest: ProjectPartnerCreateRequest = {
                project: data.project,
                entity: data.entity,
                engagementLevel: data.engagementLevel
            };

            await projectPartnerService.create(createRequest);
            showToast.success(t('toast.project_partner.created'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.project_partner.create_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createProjectPartnerFormConfig(entities);
    const defaultValues = getCreateProjectPartnerDefaultValues(project);

    if (loadingEntities) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={t('form.project_partner.create_title')} size="md">
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-600">{t('label.loading')}</div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('form.project_partner.create_title')}
            size="md"
        >
            <DynamicForm<CreateProjectPartnerData>
                config={formConfig}
                schema={createProjectPartnerSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};