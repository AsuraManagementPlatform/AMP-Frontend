import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createProjectFormConfig } from '@/config/project.form.config';
import { createProjectSchema, CreateProjectData, getCreateProjectDefaultValues } from '@/schemas/project.schema';
import showToast from '@/components/ui/Toast';
import projectService from '@/services/project.service';
import { ProjectCreateRequest } from '@/types/project.types';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (project: any) => void;
    organizationId?: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    organizationId
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [availableManagers, setAvailableManagers] = useState<{ id: string; name: string }[]>([]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (data: CreateProjectData) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            showToast.loading('Se creează proiectul...');

            const projectData: ProjectCreateRequest = {
                ...data,
                organizationId: organizationId || data.organizationId,
                budget: data.budget || undefined,
                startDate: data.startDate || undefined,
                endDate: data.endDate || undefined,
                managerId: data.managerId || undefined,
                tags: data.tags || []
            };

            const project = await projectService.create(projectData);
            
            showToast.success('Proiectul a fost creat cu succes!');
            onSuccess?.(project);
            onClose();
        } catch (error: any) {
            console.error('Error creating project:', error);
            showToast.error('Crearea proiectului a eșuat');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createProjectFormConfig(organizationId, []);
    const defaultValues = getCreateProjectDefaultValues();

    // Set organizationId if provided
    if (organizationId) {
        defaultValues.organizationId = organizationId;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Creează proiect nou"
            size="lg"
        >
            <DynamicForm
                config={formConfig}
                schema={createProjectSchema}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};