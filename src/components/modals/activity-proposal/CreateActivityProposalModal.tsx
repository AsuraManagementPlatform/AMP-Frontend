import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
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
import { projectService } from '@/services/project.service';
import { activityService } from '@/services/activity.service';
import { SelectOption } from '@/types/form.types';
import { ActivityProposalCreateRequest } from '@/types/activity-proposal.types';

interface CreateActivityProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    organizationId: string;
    projectId?: string;
}

export const CreateActivityProposalModal: React.FC<CreateActivityProposalModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    organizationId,
    projectId
}) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || '');

    const { data: projectsData, isLoading: loadingProjects } = useQuery({
        queryKey: ['user-projects-for-proposal'],
        queryFn: () => projectService.getList({ pageSize: 100 }),
        enabled: isOpen
    });

    const { data: activitiesData, isLoading: loadingActivities } = useQuery({
        queryKey: ['project-activities-for-proposal', selectedProjectId],
        queryFn: () => activityService.getList({ filters: { project: selectedProjectId }, pageSize: 100 }),
        enabled: isOpen && !!selectedProjectId
    });

    const projectOptions = useMemo((): SelectOption[] => {
        if (!projectsData?.results) return [];
        return projectsData.results.map(project => ({
            value: project.id,
            label: project.name
        }));
    }, [projectsData]);

    const activityOptions = useMemo((): SelectOption[] => {
        if (!activitiesData?.results) return [];
        return activitiesData.results
            .filter(activity => !activity.parentActivity)
            .map(activity => ({
                value: activity.id,
                label: activity.title
            }));
    }, [activitiesData]);

    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
            setSelectedProjectId(projectId || '');
        }
    }, [isOpen, projectId]);

    const handleFormChange = useCallback((values: Partial<CreateActivityProposalData>) => {
        if (values.project && values.project !== selectedProjectId) {
            setSelectedProjectId(values.project);
        }
    }, [selectedProjectId]);

    const handleSubmit = async (data: CreateActivityProposalData) => {
        try {
            setIsSubmitting(true);

            const proposalCreateRequest: ActivityProposalCreateRequest = {
                project: data.project,
                organization: data.organization,
                parentActivity: data.parentActivity || undefined,
                activityTitle: data.activityTitle,
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate,
                estimatedBudget: data.estimatedBudget,
                justification: data.justification
            };

            await activityProposalService.create(proposalCreateRequest);
            showToast.success(t('label.activity_proposal.created'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error.message || t('label.activity_proposal.create_error');
            showToast.error(errorMessage.includes('.') ? t(errorMessage) : errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createActivityProposalFormConfig(projectOptions, activityOptions);
    const defaultValues = getDefaultActivityProposalValues(projectId, organizationId);

    if (loadingProjects) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={t('label.activity_proposal.create_title')} size="lg">
                <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">{t('label.activity_proposal.loading_projects')}</div>
                </div>
            </Modal>
        );
    }

    if (projectOptions.length === 0) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={t('label.activity_proposal.create_title')} size="lg">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="text-gray-500 mb-4">
                        {t('label.activity_proposal.no_active_projects')}
                    </div>
                    <div className="text-sm text-gray-400">
                        {t('label.activity_proposal.no_active_projects_hint')}
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('label.activity_proposal.create_title')}
            size="lg"
        >
            <DynamicForm<CreateActivityProposalData>
                config={formConfig}
                schema={createActivityProposalSchema}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting || loadingActivities}
                onChange={handleFormChange}
            />
        </Modal>
    );
};
