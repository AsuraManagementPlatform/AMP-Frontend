import React, {useEffect, useState} from 'react';
import {Modal} from '@/components/ui/Modal';
import {DynamicForm} from '@/components/forms/DynamicForm';
import {createDonationFormConfig} from '@/config/entity-donation.form.config.ts';
import {
    createDonationSchema,
    CreateEntityDonationData,
    getCreateDonationDefaultValues
} from '@/schemas/entity-donation.schema.ts';
import showToast from '@/components/ui/Toast';
import entityDonationService from '@/services/entity-donation.service.ts';
import {EntityDonationCreateRequest, SelectOption} from '@/types/index.types';
import {t} from 'i18next';

interface CreateEntityDonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    entityId?: string;
    entities?: SelectOption[];
    projects?: SelectOption[];
    activities?: SelectOption[];
}

export const CreateEntityDonationModal: React.FC<CreateEntityDonationModalProps> = ({
                                                                                        isOpen,
                                                                                        onClose,
                                                                                        onSuccess,
                                                                                        entityId,
                                                                                        entities = [],
                                                                                        projects = [],
                                                                                        activities = []
                                                                                    }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [typeSuggestions, setTypeSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchTypeSuggestions = async () => {
            try {
                const suggestions = await entityDonationService.getTypeSuggestions();
                setTypeSuggestions(suggestions);
            } catch (error) {
            }
        };

        if (isOpen) {
            fetchTypeSuggestions();
        }
    }, [isOpen]);

    const handleSubmit = async (data: CreateEntityDonationData) => {
        try {
            setIsSubmitting(true);

            const donationCreateRequest: EntityDonationCreateRequest = {
                entity: data.entity,
                type: data.type,
                scope: data.scope,
                date: data.date,
                amount: data.amount,
                currency: data.currency,
                paymentMethod: data.paymentMethod,
                project: data.project || undefined,
                activity: data.activity || undefined,
                documentReference: data.documentReference || undefined,
                notes: data.notes || undefined
            };

            await entityDonationService.create(donationCreateRequest);
            showToast.success(t('toast.entity_donation.created'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.entity_donation.create_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createDonationFormConfig(entities, projects, activities, typeSuggestions);
    const defaultValues = getCreateDonationDefaultValues(entityId);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('form.entity_donation.create_title')}
            size="lg"
        >
            <DynamicForm<CreateEntityDonationData>
                config={formConfig}
                schema={createDonationSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};