import { DynamicFormConfig, FieldType, SelectOption } from "@/types/form.types.ts";
import { DonationType, PaymentMethod, DonationScope } from "@/types/entity-donation.types.ts";
import { Currency } from "@/types/index.types.ts";
import { t } from "i18next";

const getDonationTypeOptions = (): SelectOption[] => [
    { value: DonationType.MONETARY, label: t('label.donation_type.monetary') },
    { value: DonationType.IN_KIND, label: t('label.donation_type.in_kind') },
    { value: DonationType.SERVICE, label: t('label.donation_type.service') },
    { value: DonationType.SPONSORSHIP, label: t('label.donation_type.sponsorship') },
    { value: DonationType.OTHER, label: t('label.donation_type.other') }
];

const getPaymentMethodOptions = (): SelectOption[] => [
    { value: PaymentMethod.CASH, label: t('label.payment_method.cash') },
    { value: PaymentMethod.BANK_TRANSFER, label: t('label.payment_method.bank_transfer') },
    { value: PaymentMethod.CARD, label: t('label.payment_method.card') },
    { value: PaymentMethod.OTHER, label: t('label.payment_method.other') }
];

const getDonationScopeOptions = (): SelectOption[] => [
    { value: DonationScope.GENERAL, label: t('label.donation_scope.general') },
    { value: DonationScope.PROJECT, label: t('label.donation_scope.project') },
    { value: DonationScope.ACTIVITY, label: t('label.donation_scope.activity') },
    { value: DonationScope.EMERGENCY, label: t('label.donation_scope.emergency') }
];

const getCurrencyOptions = (): SelectOption[] => [
    { value: Currency.RON, label: t('label.currency.ron') },
    { value: Currency.EUR, label: t('label.currency.eur') },
    { value: Currency.USD, label: t('label.currency.usd') }
];

export const createDonationFormConfig = (
    entities: SelectOption[] = [],
    projects: SelectOption[] = [],
    activities: SelectOption[] = [],
): DynamicFormConfig => ({
    sections: [
        {
            title: t('form.entity_donation.section_info'),
            columns: 2,
            fields: [
                {
                    name: 'entity',
                    label: t('label.entity_donation.entity'),
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: '', label: t('label.entity_donation.select_entity') },
                        ...entities
                    ],
                    helperText: t('label.entity_donation.entity_helper')
                },
                {
                    name: 'type',
                    label: t('label.entity_donation.type'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getDonationTypeOptions()
                },
                {
                    name: 'scope',
                    label: t('label.entity_donation.scope'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getDonationScopeOptions()
                },
                {
                    name: 'date',
                    label: t('label.entity_donation.date'),
                    type: FieldType.DATE,
                    required: true
                }
            ]
        },
        {
            title: t('form.entity_donation.section_financial'),
            columns: 2,
            fields: [
                {
                    name: 'amount',
                    label: t('label.entity_donation.amount'),
                    type: FieldType.NUMBER,
                    required: true,
                    min: 0,
                    step: 0.01,
                    placeholder: t('label.entity_donation.amount_placeholder')
                },
                {
                    name: 'currency',
                    label: t('label.entity_donation.currency'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getCurrencyOptions()
                },
                {
                    name: 'paymentMethod',
                    label: t('label.entity_donation.payment_method'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getPaymentMethodOptions()
                }
            ]
        },
        {
            title: t('form.entity_donation.section_destination'),
            columns: 2,
            fields: [
                {
                    name: 'project',
                    label: t('label.entity_donation.project'),
                    type: FieldType.SELECT,
                    required: false,
                    options: [
                        { value: '', label: t('label.entity_donation.select_project') },
                        ...projects
                    ],
                    helperText: t('label.entity_donation.project_helper')
                },
                {
                    name: 'activity',
                    label: t('label.entity_donation.activity'),
                    type: FieldType.SELECT,
                    required: false,
                    options: [
                        { value: '', label: t('label.entity_donation.select_activity') },
                        ...activities
                    ],
                    helperText: t('label.entity_donation.activity_helper')
                },
            ]
        },
        {
            title: t('form.entity_donation.section_additional'),
            columns: 1,
            fields: [
                {
                    name: 'documentReference',
                    label: t('label.entity_donation.document_reference'),
                    type: FieldType.TEXT,
                    required: false,
                    placeholder: t('label.entity_donation.document_reference_placeholder'),
                    helperText: t('label.entity_donation.document_reference_helper')
                },
                {
                    name: 'notes',
                    label: t('label.entity_donation.notes'),
                    type: FieldType.TEXTAREA,
                    required: false,
                    placeholder: t('label.entity_donation.notes_placeholder'),
                    maxLength: 511,
                    rows: 3
                }
            ]
        }
    ],
    submitButtonText: t('form.entity_donation.submit_create'),
    cancelButtonText: t('form.entity_donation.cancel')
});

export const updateDonationFormConfig = (
    entities: SelectOption[] = [],
    projects: SelectOption[] = [],
    activities: SelectOption[] = [],
): DynamicFormConfig => ({
    ...createDonationFormConfig(entities, projects, activities),
    submitButtonText: t('form.entity_donation.submit_update')
});