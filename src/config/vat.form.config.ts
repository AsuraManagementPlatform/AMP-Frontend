import {DynamicFormConfig, FieldType} from "@/types/index.types.ts";
import {t} from "i18next";

export const createVatFormConfig = (): DynamicFormConfig => ({
    sections: [
        {
            title: `${t('form.vat.section_one_title')}`,
            columns: 2,
            fields: [
                {
                    name: 'name',
                    label: `${t('label.vat.name')}`,
                    type: FieldType.TEXT,
                    required: true,
                },
                {
                    name: 'value',
                    label: `${t('label.vat.value')}`,
                    type: FieldType.NUMBER,
                    required: true,
                    step: 1,
                    min: 0,
                },
            ]
        }
    ],
    submitButtonText: `${t('form.vat.submit_btn_text')}`,
    cancelButtonText: `${t('form.vat.cancel_btn_text')}`,
})

export const updateVatFormConfig = (): DynamicFormConfig => ({
    ...createVatFormConfig(),
    submitButtonText: `${t('form.vat.update_btn_text')}`
})