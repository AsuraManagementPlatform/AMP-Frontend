import { DynamicFormConfig, FieldType } from "@/types/form.types.ts";
import { t } from 'i18next';

export const payProjectFundFormConfig = (): DynamicFormConfig => ({
    sections: [
        {
            title: t('form.project_fund.confirm_payment_section'),
            columns: 1,
            fields: [
                {
                    name: 'amount',
                    label: t('label.project_fund.received_amount_label'),
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 50000',
                    required: true,
                    min: 0,
                    step: 0.01
                },
                {
                    name: 'date',
                    label: t('label.project_fund.receipt_date'),
                    type: FieldType.DATE,
                    placeholder: t('label.project_fund.receipt_date'),
                    required: true
                }
            ]
        }
    ],
    submitButtonText: t('form.project_fund.submit_payment'),
    cancelButtonText: t('form.project_fund.cancel')
});