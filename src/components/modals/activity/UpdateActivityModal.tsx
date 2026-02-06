import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { updateActivityFormConfig } from '@/config/activity.form.config';
import { updateActivitySchemaWithProjectDates, UpdateActivityData } from '@/schemas/activity.schema';
import activityService from '@/services/activity.service';
import projectService from '@/services/project.service';
import showToast from '@/components/ui/Toast';
import { Activity, ActivityStatus } from '@/types/activity.types';
import { SelectOption } from '@/types/form.types';
import { Project } from '@/types/project.types';

interface UpdateActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    activity: Activity;
    project: string;
}

export const UpdateActivityModal: React.FC<UpdateActivityModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onSuccess,
                                                                            activity,
                                                                            project
                                                                        }) => {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableParentActivities, setAvailableParentActivities] = useState<SelectOption[]>([]);
    const [projectData, setProjectData] = useState<Project | null>(null);

    useEffect(() => {
        if (isOpen && project) {
            const loadProjectAndActivities = async () => {
                try {
                    const projectResponse = await projectService.getById(project);
                    setProjectData(projectResponse);
                    
                    const response = await activityService.getList({ filters: { project } });
                    const parentOptions: SelectOption[] = response.results
                        .filter((act: Activity) => 
                            !act.parentActivity && 
                            act.id !== activity.id &&
                            act.status !== ActivityStatus.COMPLETED && 
                            act.status !== ActivityStatus.CANCELLED
                        )
                        .map((act: Activity) => ({
                            value: act.id,
                            label: act.title
                        }));
                    setAvailableParentActivities(parentOptions);
                } catch (error) {
                    setAvailableParentActivities([]);
                    setProjectData(null);
                }
            };
            loadProjectAndActivities();
        }
    }, [isOpen, project, activity.id]);

    const handleSubmit = async (data: UpdateActivityData) => {
        try {
            setIsSubmitting(true);
            await activityService.update(activity.id, data);
            showToast.success(t('toast.activity.updated'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.activity.update_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = updateActivityFormConfig(availableParentActivities);
    
    const schema = updateActivitySchemaWithProjectDates(
        projectData?.startingDate,
        projectData?.endingDate
    );

    const defaultValues: UpdateActivityData = {
        id: activity.id,
        project: activity.project,
        projectObjective: activity.projectObjective || '',
        title: activity.title,
        description: activity.description || '',
        startingDate: activity.startingDate,
        estimatedEndingDate: activity.estimatedEndingDate,
        endingDate: activity.endingDate || '',
        status: activity.status,
        type: activity.type,
        location: activity.location || '',
        observation: activity.observation || '',
        results: activity.results || '',
        indicators: activity.indicators || ''
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Actualizează activitate"
            size="lg"
        >
            <DynamicForm<UpdateActivityData>
                config={formConfig}
                schema={schema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};