import { DynamicFormConfig, FieldType, SelectOption } from "@/types/form.types.ts";
import { DonationType, PaymentMethod, DonationScope } from "@/types/donation.types.ts";

const getDonationTypeOptions = (): SelectOption[] => [
    { value: DonationType.MONETARY, label: 'Donație Monetară' },
    { value: DonationType.IN_KIND, label: 'Donație în Natură' },
    { value: DonationType.SERVICE, label: 'Servicii' },
    { value: DonationType.SPONSORSHIP, label: 'Sponsorizare' },
    { value: DonationType.OTHER, label: 'Altul' }
];

const getPaymentMethodOptions = (): SelectOption[] => [
    { value: PaymentMethod.CASH, label: 'Numerar' },
    { value: PaymentMethod.BANK_TRANSFER, label: 'Transfer Bancar' },
    { value: PaymentMethod.CARD, label: 'Card' },
    { value: PaymentMethod.OTHER, label: 'Altul' }
];

const getDonationScopeOptions = (): SelectOption[] => [
    { value: DonationScope.GENERAL, label: 'General' },
    { value: DonationScope.PROJECT, label: 'Proiect' },
    { value: DonationScope.ACTIVITY, label: 'Activitate' },
    { value: DonationScope.EMERGENCY, label: 'Urgență' }
];

export const createDonationFormConfig = (
    entities: SelectOption[] = [],
    projects: SelectOption[] = [],
    activities: SelectOption[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații donație",
            columns: 2,
            fields: [
                {
                    name: 'entityId',
                    label: 'Entitate',
                    type: FieldType.SELECT,
                    required: true,
                    options: entities,
                    helperText: 'Selectează entitatea care face donația'
                },
                {
                    name: 'type',
                    label: 'Tip donație',
                    type: FieldType.SELECT,
                    required: true,
                    options: getDonationTypeOptions()
                },
                {
                    name: 'scope',
                    label: 'Scop',
                    type: FieldType.SELECT,
                    required: true,
                    options: getDonationScopeOptions()
                },
                {
                    name: 'date',
                    label: 'Data donației',
                    type: FieldType.DATE,
                    required: true
                }
            ]
        },
        {
            title: "Sumă și plată",
            columns: 2,
            fields: [
                {
                    name: 'amount',
                    label: 'Sumă',
                    type: FieldType.NUMBER,
                    required: true,
                    min: 0,
                    placeholder: 'ex: 1000'
                },
                {
                    name: 'currency',
                    label: 'Monedă',
                    type: FieldType.TEXT,
                    required: true,
                    placeholder: 'ex: RON, EUR, USD',
                    maxLength: 10
                },
                {
                    name: 'paymentMethod',
                    label: 'Metodă de plată',
                    type: FieldType.SELECT,
                    required: true,
                    options: getPaymentMethodOptions()
                }
            ]
        },
        {
            title: "Destinație (opțional)",
            columns: 2,
            fields: [
                {
                    name: 'projectId',
                    label: 'Proiect',
                    type: FieldType.SELECT,
                    options: projects,
                    helperText: 'Opțional - selectează proiectul destinatar'
                },
                {
                    name: 'activityId',
                    label: 'Activitate',
                    type: FieldType.SELECT,
                    options: activities,
                    helperText: 'Opțional - selectează activitatea destinatară'
                }
            ]
        },
        {
            title: "Detalii suplimentare",
            columns: 1,
            fields: [
                {
                    name: 'documentReference',
                    label: 'Referință document',
                    type: FieldType.TEXT,
                    placeholder: 'ex: https://drive.google.com/file/...',
                    helperText: 'Link către documentul donației (chitanță, contract, etc.)',
                    gridColumn: 'full'
                },
                {
                    name: 'notes',
                    label: 'Note',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note sau observații despre donație',
                    maxLength: 511,
                    rows: 3,
                    gridColumn: 'full'
                }
            ]
        }
    ],
    submitButtonText: 'Înregistrează donație',
    cancelButtonText: 'Anulează'
});

export const updateDonationFormConfig = (
    entities: SelectOption[] = [],
    projects: SelectOption[] = [],
    activities: SelectOption[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații donație",
            columns: 2,
            fields: [
                {
                    name: 'entityId',
                    label: 'Entitate',
                    type: FieldType.SELECT,
                    required: true,
                    options: entities,
                    helperText: 'Selectează entitatea care face donația'
                },
                {
                    name: 'type',
                    label: 'Tip donație',
                    type: FieldType.SELECT,
                    required: true,
                    options: getDonationTypeOptions()
                },
                {
                    name: 'scope',
                    label: 'Scop',
                    type: FieldType.SELECT,
                    required: true,
                    options: getDonationScopeOptions()
                },
                {
                    name: 'date',
                    label: 'Data donației',
                    type: FieldType.DATE,
                    required: true
                }
            ]
        },
        {
            title: "Sumă și plată",
            columns: 2,
            fields: [
                {
                    name: 'amount',
                    label: 'Sumă',
                    type: FieldType.NUMBER,
                    required: true,
                    min: 0,
                    placeholder: 'ex: 1000'
                },
                {
                    name: 'currency',
                    label: 'Monedă',
                    type: FieldType.TEXT,
                    required: true,
                    placeholder: 'ex: RON, EUR, USD',
                    maxLength: 10
                },
                {
                    name: 'paymentMethod',
                    label: 'Metodă de plată',
                    type: FieldType.SELECT,
                    required: true,
                    options: getPaymentMethodOptions()
                }
            ]
        },
        {
            title: "Destinație (opțional)",
            columns: 2,
            fields: [
                {
                    name: 'projectId',
                    label: 'Proiect',
                    type: FieldType.SELECT,
                    options: projects,
                    helperText: 'Opțional - selectează proiectul destinatar'
                },
                {
                    name: 'activityId',
                    label: 'Activitate',
                    type: FieldType.SELECT,
                    options: activities,
                    helperText: 'Opțional - selectează activitatea destinatară'
                }
            ]
        },
        {
            title: "Detalii suplimentare",
            columns: 1,
            fields: [
                {
                    name: 'documentReference',
                    label: 'Referință document',
                    type: FieldType.TEXT,
                    placeholder: 'ex: https://drive.google.com/file/...',
                    helperText: 'Link către documentul donației (chitanță, contract, etc.)',
                    gridColumn: 'full'
                },
                {
                    name: 'notes',
                    label: 'Note',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note sau observații despre donație',
                    maxLength: 511,
                    rows: 3,
                    gridColumn: 'full'
                }
            ]
        }
    ],
    submitButtonText: 'Salvează modificări',
    cancelButtonText: 'Anulează'
});
