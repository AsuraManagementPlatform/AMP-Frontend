import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { createDonationFormConfig } from '@/config/donation.form.config';
import { createDonationSchema, CreateDonationData, getCreateDonationDefaultValues } from '@/schemas/donation.schema';
import showToast from '@/components/ui/Toast';
import toast from 'react-hot-toast';
import donationService from '@/services/donation.service';
import { EntityDonationCreateRequest } from '@/types/donation.types';
import { SelectOption } from '@/types/form.types';

interface CreateDonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (donation: any) => void;
    entities?: SelectOption[];
    projects?: SelectOption[];
    activities?: SelectOption[];
}

export const CreateDonationModal: React.FC<CreateDonationModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    entities = [],
    projects = [],
    activities = []
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        if (!isOpen) {
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleSubmit = async (data: CreateDonationData) => {
        if (isSubmitting) return;

        let loadingToastId: string | undefined;

        try {
            setIsSubmitting(true);
            loadingToastId = showToast.loading('Se înregistrează donația...');

            const donationData: EntityDonationCreateRequest = {
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

            const donation = await donationService.create(donationData);
            
            if (loadingToastId) toast.dismiss(loadingToastId);
            showToast.success('Donația a fost înregistrată cu succes!');
            onSuccess?.(donation);
            onClose();
        } catch (error: any) {
            if (loadingToastId) toast.dismiss(loadingToastId);
            const errorMessage = error?.message || 'Înregistrarea donației a eșuat';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createDonationFormConfig(entities, projects, activities);
    const defaultValues = getCreateDonationDefaultValues();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Înregistrează donație nouă"
            size="lg"
        >
            <DynamicForm
                config={formConfig}
                schema={createDonationSchema}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
            />
        </Modal>
    );
};
