import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import showToast from '@/components/ui/Toast';
import { createActivityProposalFormConfig } from '@/config/activity-proposal.form.config';
import {
    CreateActivityProposalData,
    createActivityProposalSchema,
    getDefaultActivityProposalValues
} from '@/schemas/activity-proposal.schema';
import activityProposalService from '@/services/activity-proposal.service';
import { SelectOption } from '@/types/form.types';
import { ActivityProposalCreateRequest } from '@/types/activity-proposal.types';

interface CreateActivityProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organizationId: string;
    projectId?: string;
    projects?: SelectOption[];
}

export const CreateActivityProposalModal: React.FC<CreateActivityProposalModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    organizationId,
    projectId,
    projects = []
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (data: CreateActivityProposalData) => {
        try {
            setIsSubmitting(true);

            const proposalCreateRequest: ActivityProposalCreateRequest = {
                project: data.project,
                organization: data.organization,
                activityTitle: data.activityTitle,
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate,
                estimatedBudget: data.estimatedBudget,
                justification: data.justification
            };

            await activityProposalService.create(proposalCreateRequest);
            showToast.success('Propunerea de activitate a fost trimisă cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            showToast.error(error.message || 'Nu s-a putut trimite propunerea. Încercați din nou.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createActivityProposalFormConfig(projects);
    const defaultValues = getDefaultActivityProposalValues(projectId, organizationId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Propune Activitate Nouă"
            size="lg"
        >
            <DynamicForm<CreateActivityProposalData>
                config={formConfig}
                schema={createActivityProposalSchema}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};
