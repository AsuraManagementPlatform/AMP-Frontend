import React, {useEffect, useState} from "react";
import {CreateVatData, createVatSchema, getCreateVatDefaultValues} from "@/schemas/vat.schema.ts";
import {VatCreateRequest} from "@/types/index.types.ts";
import vatService from "@/services/vat.service.ts";
import showToast from "@/components/ui/Toast.tsx";
import {t} from "i18next";
import {createVatFormConfig} from "@/config/vat.form.config.ts";
import Modal from "@/components/ui/Modal.tsx";
import {DynamicForm} from "@/components/forms/DynamicForm.tsx";

interface CreateVatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateVatModal: React.FC<CreateVatModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {}, [isOpen]);

    const handleSubmit = async (data: CreateVatData) => {
        try {
            setIsSubmitting(true);

            const vatCreateRequest: VatCreateRequest = {
                name: data.name,
                value: data.value,
            }

            await vatService.create(vatCreateRequest);
            showToast.vatCreated();
            onSuccess();
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                showToast.error(error.message);
            } else {
                showToast.error(`${t('toast.default_error_message')}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = createVatFormConfig();
    const defaultValues = getCreateVatDefaultValues();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('form.vat.create_modal_title')}
            size="lg"
        >
            <DynamicForm<CreateVatData> config={formConfig} schema={createVatSchema} onSubmit={handleSubmit} onCancel={onClose} defaultValues={defaultValues} isSubmitting={isSubmitting} />
        </Modal>
    )
}