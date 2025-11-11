import { DynamicFormConfig, FieldType, SelectOption } from "@/types/form.types.ts";
import {t} from "i18next";
import {Currency} from "@/types/index.types.ts";

const getCurrencyOptions = (): SelectOption[] => [
    { value: Currency.RON, label: t('label.currency.ron') },
    { value: Currency.EUR, label: t('label.currency.eur') },
    { value: Currency.USD, label: t('label.currency.usd') }
];

export const createProjectFundFormConfig = (
    activities: SelectOption[] = [],
    entities: SelectOption[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: t('form.project_fund.section_basic'),
            columns: 1,
            fields: [
                {
                    name: 'project',
                    label: t('label.project_fund.project'),
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'sourceName',
                    label: t('label.project_fund.source_name'),
                    type: FieldType.TEXT,
                    placeholder: t('label.project_fund.source_name_placeholder'),
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'source',
                    label: t('label.project_fund.source_type'),
                    type: FieldType.TEXT,
                    placeholder: t('label.project_fund.source_type_placeholder'),
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'category',
                    label: t('label.project_fund.category'),
                    type: FieldType.TEXT,
                    placeholder: t('label.project_fund.category_placeholder'),
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'scope',
                    label: t('label.project_fund.scope'),
                    type: FieldType.TEXT,
                    placeholder: t('label.project_fund.scope_placeholder'),
                    required: true,
                    maxLength: 255
                }
            ]
        },
        {
            title: t('form.project_fund.section_financial'),
            columns: 2,
            fields: [
                {
                    name: 'estimatedAmount',
                    label: t('label.project_fund.estimated_amount'),
                    type: FieldType.NUMBER,
                    placeholder: t('label.project_fund.estimated_amount_placeholder'),
                    required: true,
                    min: 0,
                    step: 0.01
                },
                {
                    name: 'currency',
                    label: t('label.project_fund.currency'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getCurrencyOptions()
                },
                {
                    name: 'paymentMethod',
                    label: t('label.project_fund.payment_method'),
                    type: FieldType.TEXT,
                    placeholder: t('label.project_fund.payment_method_placeholder'),
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'estimatedDate',
                    label: t('label.project_fund.estimated_date'),
                    type: FieldType.DATE,
                    placeholder: t('label.project_fund.estimated_date_placeholder'),
                    required: true
                }
            ]
        },
        {
            title: t('form.project_fund.section_links'),
            columns: 2,
            fields: [
                {
                    name: 'activity',
                    label: t('label.project_fund.activity'),
                    type: FieldType.SELECT,
                    required: false,
                    options: [
                        { value: '', label: t('label.project_fund.select_activity') },
                        ...activities
                    ],
                    helperText: t('label.project_fund.activity_helper')
                },
                {
                    name: 'entity',
                    label: t('label.project_fund.entity'),
                    type: FieldType.SELECT,
                    required: false,
                    options: [
                        { value: '', label: t('label.project_fund.select_entity') },
                        ...entities
                    ],
                    helperText: t('label.project_fund.entity_helper')
                }
            ]
        },
        {
            title: t('form.project_fund.section_additional'),
            columns: 1,
            fields: [
                {
                    name: 'documentReference',
                    label: t('label.project_fund.document_reference'),
                    type: FieldType.TEXT,
                    placeholder: t('label.project_fund.document_reference_placeholder'),
                    helperText: t('label.project_fund.document_reference_helper')
                },
                {
                    name: 'notes',
                    label: t('label.project_fund.notes'),
                    type: FieldType.TEXTAREA,
                    placeholder: t('label.project_fund.notes_placeholder'),
                    maxLength: 511,
                    rows: 3
                }
            ]
        }
    ],
    submitButtonText: t('form.project_fund.submit_create'),
    cancelButtonText: t('form.project_fund.cancel')
});

export const updateProjectFundFormConfig = (
    activities: SelectOption[] = [],
    entities: SelectOption[] = []
): DynamicFormConfig => ({
    ...createProjectFundFormConfig(activities, entities),
    submitButtonText: t('form.project_fund.submit_update')
});

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
                    placeholder: t('label.project_fund.amount_placeholder'),
                    required: true,
                    min: 0,
                    step: 0.01
                },
                {
                    name: 'date',
                    label: t('label.project_fund.receipt_date'),
                    type: FieldType.DATE,
                    placeholder: t('label.project_fund.receipt_date_placeholder'),
                    required: true
                }
            ]
        }
    ],
    submitButtonText: t('form.project_fund.submit_payment'),
    cancelButtonText: t('form.project_fund.cancel')
});