import React, {useState} from 'react';
import {Modal} from '@/components/ui/Modal';
import {DynamicForm} from '@/components/forms/DynamicForm';
import {updateDonationFormConfig} from '@/config/entity-donation.form.config.ts';
import {
    getUpdateDonationDefaultValues,
    updateDonationSchema,
    UpdateEntityDonationData
} from '@/schemas/entity-donation.schema.ts';
import showToast from '@/components/ui/Toast';
import entityDonationService from '@/services/entity-donation.service.ts';
import {EntityDonation, EntityDonationUpdateRequest} from '@/types/entity-donation.types.ts';
import {SelectOption} from '@/types/form.types';
import {t} from 'i18next';

interface UpdateEntityDonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    entityDonation: EntityDonation;
    entities?: SelectOption[];
    projects?: SelectOption[];
    activities?: SelectOption[];
}

export const UpdateEntityDonationModal: React.FC<UpdateEntityDonationModalProps> = ({
                                                                                        isOpen,
                                                                                        onClose,
                                                                                        onSuccess,
                                                                                        entityDonation,
                                                                                        entities = [],
                                                                                        projects = [],
                                                                                        activities = []
                                                                                    }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: UpdateEntityDonationData) => {
        try {
            setIsSubmitting(true);

            const donationUpdateRequest: EntityDonationUpdateRequest = {
                id: data.id,
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

            await entityDonationService.update(donationUpdateRequest);
            showToast.success(t('toast.entity_donation.updated'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.entity_donation.update_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = updateDonationFormConfig(entities, projects, activities);
    const defaultValues = getUpdateDonationDefaultValues(entityDonation);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('form.entity_donation.update_title')}
            size="lg"
        >
            <DynamicForm<UpdateEntityDonationData>
                config={formConfig}
                schema={updateDonationSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};