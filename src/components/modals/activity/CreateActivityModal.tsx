import React, {useEffect, useState} from 'react';
import {Modal} from '@/components/ui/Modal';
import {DynamicForm} from '@/components/forms/DynamicForm';
import {createActivityFormConfig} from '@/config/activity.form.config';
import {CreateActivityData, createActivitySchema, getCreateActivityDefaultValues} from '@/schemas/activity.schema';
import activityService from '@/services/activity.service';
import showToast from '@/components/ui/Toast';
import {Activity, ActivityCreateRequest, ActivityStatus} from "@/types/activity.types.ts";
import {SelectOption} from "@/types/form.types.ts";

interface CreateActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    project: string;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onSuccess,
                                                                            project
                                                                        }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableParentActivities, setAvailableParentActivities] = useState<SelectOption[]>([]);

    useEffect(() => {
        if (isOpen && project) {
            const loadParentActivities = async () => {
                try {
                    const response = await activityService.getList({ filters: { project } });
                    const parentOptions: SelectOption[] = response.results
                        .filter((activity: Activity) => 
                            !activity.parentActivity && 
                            activity.status !== ActivityStatus.COMPLETED && 
                            activity.status !== ActivityStatus.CANCELLED
                        )
                        .map((activity: Activity) => ({
                            value: activity.id,
                            label: activity.title
                        }));
                    setAvailableParentActivities(parentOptions);
                } catch (error) {
                    setAvailableParentActivities([]);
                }
            };
            loadParentActivities();
        }
    }, [isOpen, project]);

    const handleSubmit = async (data: CreateActivityData) => {
        try {
            setIsSubmitting(true);
            
            const activityCreateRequest: ActivityCreateRequest = {
                project: data.project,
                projectObjective: data.projectObjective,
                parentActivity: data.isSubActivity && data.parentActivity ? data.parentActivity : undefined,
                title: data.title,
                description: data.description,
                startingDate: data.startingDate,
                estimatedEndingDate: data.estimatedEndingDate,
                endingDate: data.endingDate,
                status: data.status,
                type: data.type,
                location: data.location,
                observation: data.observation,
                results: data.results,
                indicators: data.indicators
            };

            await activityService.create(activityCreateRequest);
            showToast.success('Activitatea a fost creată cu succes!');
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la crearea activității';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createActivityFormConfig(availableParentActivities);
    const defaultValues = getCreateActivityDefaultValues(project);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Creează activitate nouă"
            size="lg"
        >
            <DynamicForm<CreateActivityData>
                config={formConfig}
                schema={createActivitySchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};