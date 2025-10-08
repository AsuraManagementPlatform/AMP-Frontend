import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createProjectFormConfig } from '@/config/project.form.config';
import { createProjectSchema, CreateProjectData, getCreateProjectDefaultValues } from '@/schemas/project.schema';
import showToast from '@/components/ui/Toast';
import projectService from '@/services/project.service';
import userService from '@/services/user.service';
import toast from 'react-hot-toast';
import {ProjectCreateRequest} from "@/types/project.types.ts";

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
    const [availableManagers, setAvailableManagers] = useState<{ id: string; name: string }[]>([]);
    const [formKey, setFormKey] = useState(0);
    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        } else {
            loadAvailableManagers();
        }
    }, [isOpen, organizationId]);

    const loadAvailableManagers = async () => {
        try {
            if (organizationId) {
                const response = await userService.getManagers({
                    pageSize: 100
                });
                
                const managers = response.results?.map(user => ({
                    id: user.id,
                    name: user.full_name || user.email
                })) || [];
                
                setAvailableManagers(managers);
                setFormKey(prev => prev + 1);
            }
        } catch (error) {
            showToast.error('Eroare la încărcarea managerilor');
            setAvailableManagers([]);
        }
    };

    const handleSubmit = async (data: CreateProjectData) => {
        if (isSubmitting) return;

        const projectData: ProjectCreateRequest = {
            name: data.name,
            description: data.description || '',
            category: data.category,
            starting_date: data.starting_date,
            ending_date: data.ending_date,
            status: data.status,
            priority: data.priority,
            organization: organizationId || data.organization,
            location: data.location,
            budget: Math.round(data.budget),
            currency: data.currency,
            budget_planning_date: data.budget_planning_date || data.starting_date,
            budget_responsible: data.budget_responsible,
            budget_notes: data.budget_notes || '',
            sustainability: data.sustainability || ''
        };

        let loadingToastId: string | undefined;
        
        try {
            setIsSubmitting(true);
            loadingToastId = showToast.loading('Se creează proiectul...');

            const project = await projectService.create(projectData);
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            showToast.success('Proiectul a fost creat cu succes!');
            
            onSuccess?.(project);
            onClose();
        } catch (error: any) {
            if (loadingToastId) {
                toast.dismiss(loadingToastId);
            }
            
            let errorMessage = 'Crearea proiectului a eșuat';
            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormKey(prev => prev + 1);
        loadAvailableManagers();
    };

    const formConfig = createProjectFormConfig(organizationId, availableManagers);
    const defaultValues = getCreateProjectDefaultValues();
    if (organizationId) {
        defaultValues.organization = organizationId;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Creează proiect nou"
            size="lg"
            showResetButton={true}
            onReset={handleReset}
        >
            <DynamicForm
                key={formKey}
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
