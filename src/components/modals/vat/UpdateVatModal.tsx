import React, {useEffect, useState} from "react";
import {UpdateVatData, updateVatSchema} from "@/schemas/vat.schema.ts";
import {Vat, VatUpdateRequest} from "@/types/index.types.ts";
import vatService from "@/services/vat.service.ts";
import showToast from "@/components/ui/Toast.tsx";
import {t} from "i18next";
import {updateVatFormConfig} from "@/config/vat.form.config.ts";
import Modal from "@/components/ui/Modal.tsx";
import {DynamicForm} from "@/components/forms/DynamicForm.tsx";

interface UpdateVatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    vat: Vat
}

export const UpdateVatModal: React.FC<UpdateVatModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    vat
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {}, [isOpen]);

    const handleSubmit = async (data: UpdateVatData) => {
        try {
            setIsSubmitting(true);

            const vatUpdateRequest: VatUpdateRequest = {
                id: data.id,
                name: data.name,
                value: data.value,
            }

            await vatService.update(vatUpdateRequest);
            showToast.vatUpdated();
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

    const formConfig = updateVatFormConfig();
    const defaultValues: UpdateVatData = {
        id: vat.id,
        name: vat.name,
        value: vat.value,
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('form.vat.update_modal_title')}
            size="lg"
        >
            <DynamicForm<UpdateVatData> config={formConfig} schema={updateVatSchema} onSubmit={handleSubmit} onCancel={onClose} defaultValues={defaultValues} isSubmitting={isSubmitting} />
        </Modal>
    )
}