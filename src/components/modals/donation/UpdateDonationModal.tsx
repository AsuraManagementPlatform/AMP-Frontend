import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { updateDonationFormConfig } from '@/config/donation.form.config';
import { createDonationSchema, CreateDonationData } from '@/schemas/donation.schema';
import showToast from '@/components/ui/Toast';
import toast from 'react-hot-toast';
import donationService from '@/services/donation.service';
import { EntityDonation, EntityDonationUpdateRequest } from '@/types/donation.types';
import { SelectOption } from '@/types/form.types';

interface UpdateDonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    donationId: string;
    entities?: SelectOption[];
    projects?: SelectOption[];
    activities?: SelectOption[];
}

export const UpdateDonationModal: React.FC<UpdateDonationModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    donationId,
    entities = [],
    projects = [],
    activities = []
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDonation, setCurrentDonation] = useState<EntityDonation | null>(null);

    useEffect(() => {
        const loadDonation = async () => {
            try {
                setIsLoading(true);
                const donation = await donationService.getById(donationId);
                setCurrentDonation(donation);
            } catch (error) {
                console.error('Error loading donation:', error);
                showToast.error('Eroare la încărcarea donației');
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen && donationId) {
            loadDonation();
        }
    }, [isOpen, donationId]);

    const handleSubmit = async (data: CreateDonationData) => {
        let loadingToastId: string | undefined;

        try {
            setIsSubmitting(true);
            loadingToastId = showToast.loading('Se actualizează donația...');

            const updateRequest: EntityDonationUpdateRequest = {
                entityId: data.entityId,
                type: data.type,
                scope: data.scope,
                date: data.date,
                amount: data.amount,
                currency: data.currency,
                paymentMethod: data.paymentMethod,
                projectId: data.projectId || undefined,
                activityId: data.activityId || undefined,
                documentReference: data.documentReference || undefined,
                notes: data.notes || undefined
            };

            await donationService.update(donationId, updateRequest);
            if (loadingToastId) toast.dismiss(loadingToastId);
            showToast.success('Donația a fost actualizată cu succes!');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            if (loadingToastId) toast.dismiss(loadingToastId);
            const errorMessage = error?.message || 'Eroare la actualizarea donației';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const defaultValues: CreateDonationData | undefined = currentDonation ? {
        entityId: currentDonation.entityId,
        type: currentDonation.type,
        scope: currentDonation.scope,
        date: currentDonation.date,
        amount: currentDonation.amount,
        currency: currentDonation.currency,
        paymentMethod: currentDonation.paymentMethod,
        projectId: currentDonation.projectId || '',
        activityId: currentDonation.activityId || '',
        documentReference: currentDonation.documentReference || '',
        notes: currentDonation.notes || ''
    } : undefined;

    const formConfig = updateDonationFormConfig(entities, projects, activities);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Actualizează donație"
            size="lg"
        >
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <DynamicForm<CreateDonationData>
                    config={formConfig}
                    schema={createDonationSchema}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    defaultValues={defaultValues}
                    isSubmitting={isSubmitting}
                />
            )}
        </Modal>
    );
};
