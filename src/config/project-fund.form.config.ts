import { DynamicFormConfig, FieldType } from "@/types/form.types.ts";

export const createProjectFundFormConfig = (): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații finanțare",
            columns: 1,
            fields: [
                {
                    name: 'project',
                    label: 'Proiect',
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'sourceName',
                    label: 'Nume sursă',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Ministerul Fondurilor Europene',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'source',
                    label: 'Tip sursă',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Grant, Sponsorizare, Donație',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'category',
                    label: 'Categorie',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Fonduri europene, Finanțare privată',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'scope',
                    label: 'Scop',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Echipamente, Training, Infrastructură',
                    required: true,
                    maxLength: 255
                }
            ]
        },
        {
            title: "Detalii financiare",
            columns: 2,
            fields: [
                {
                    name: 'estimatedAmount',
                    label: 'Sumă estimată',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 50000',
                    required: true,
                    min: 0,
                    step: 0.01
                },
                {
                    name: 'currency',
                    label: 'Moneda',
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: 'RON', label: 'Lei Românești (RON)' },
                        { value: 'EUR', label: 'Euro (EUR)' },
                        { value: 'USD', label: 'Dolari Americani (USD)' }
                    ]
                },
                {
                    name: 'paymentMethod',
                    label: 'Metodă de plată',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Transfer bancar, Cec',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'estimatedDate',
                    label: 'Data estimată',
                    type: FieldType.DATE,
                    placeholder: 'Selectează data estimată',
                    required: true
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
                    placeholder: 'https://example.com/contract.pdf'
                },
                {
                    name: 'notes',
                    label: 'Note',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note despre finanțare...',
                    maxLength: 511,
                    rows: 3
                }
            ]
        }
    ],
    submitButtonText: 'Adaugă finanțare',
    cancelButtonText: 'Anulează'
});

export const updateProjectFundFormConfig = (): DynamicFormConfig => ({
    ...createProjectFundFormConfig(),
    submitButtonText: 'Actualizează finanțare'
});