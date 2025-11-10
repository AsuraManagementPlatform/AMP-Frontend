import React, {useEffect, useState} from 'react';
import {Modal} from '@/components/ui/Modal';
import {updateProjectFormConfig} from '@/config/project.form.config';
import {UpdateProjectData, updateProjectSchema} from '@/schemas/project.schema';
import projectService from '@/services/project.service';
import userService from '@/services/user.service';
import showToast from '@/components/ui/Toast';
import {Project} from '@/types/project.types';
import {DynamicForm} from "@/components/forms/DynamicForm.tsx";
import {t} from "i18next";
import {Currency} from "@/types/index.types.ts";

interface UpdateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    project: Project;
    organizationId?: string;
}

export const UpdateProjectModal: React.FC<UpdateProjectModalProps> = ({
                                                                          isOpen,
                                                                          onClose,
                                                                          onSuccess,
                                                                          project,
                                                                          organizationId
                                                                      }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingManagers, setIsLoadingManagers] = useState(true);
    const [availableManagers, setAvailableManagers] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const loadManagers = async () => {
            if (!isOpen) return;

            try {
                setIsLoadingManagers(true);
                if (organizationId) {
                    const response = await userService.getList({
                        filters: {organization: organizationId},
                        pageSize: 100
                    });

                    const organization_members = response.results.map(user => ({
                        id: user.id,
                        name: user.fullName || user.email
                    }));

                    setAvailableManagers(organization_members);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : t('toast.project.load_managers_error');
                showToast.error(errorMessage);
            } finally {
                setIsLoadingManagers(false);
            }
        };

        loadManagers();
    }, [isOpen]);

    const handleSubmit = async (data: UpdateProjectData) => {
        try {
            setIsSubmitting(true);

            await projectService.update(data);
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.project.update_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = updateProjectFormConfig(organizationId, availableManagers);

    const defaultValues: UpdateProjectData = {
        id: project.id,
        name: project.name,
        description: project.description || '',
        category: project.category || '',
        location: project.location || '',
        status: project.status,
        priority: project.priority,
        startingDate: project.startingDate,
        endingDate: project.endingDate,
        budget: project.budget,
        currency: (project.currency || Currency.RON),
        budgetResponsible: project.budgetResponsible || '',
        budgetNotes: project.budgetNotes || '',
        sustainability: project.sustainability || '',
        organization: project.organization || organizationId || ''
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('form.project.update_title')}
            size="lg"
        >
            {isLoadingManagers ? (
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-600">{t('label.loading')}</div>
                </div>
            ) : (
                <DynamicForm<UpdateProjectData>
                    config={formConfig}
                    schema={updateProjectSchema}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    defaultValues={defaultValues}
                    isSubmitting={isSubmitting}
                />
            )}
        </Modal>
    );
};