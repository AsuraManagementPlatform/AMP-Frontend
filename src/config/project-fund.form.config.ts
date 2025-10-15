import { DynamicFormConfig, FieldType } from "@/types/form.types.ts";

export const createProjectFundFormConfig = (_project?: string): DynamicFormConfig => ({
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
                    name: 'source_name',
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
                    name: 'estimated_amount',
                    label: 'Sumă estimată',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 50000',
                    required: true,
                    min: 0
                },
                {
                    name: 'amount',
                    label: 'Sumă reală',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 48000',
                    required: true,
                    min: 0
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
                    name: 'payment_method',
                    label: 'Metodă de plată',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Transfer bancar, Cec',
                    required: true,
                    maxLength: 255
                }
            ]
        },
        {
            title: "Perioada",
            columns: 2,
            fields: [
                {
                    name: 'estimated_date',
                    label: 'Data estimată',
                    type: FieldType.DATE,
                    placeholder: 'Selectează data estimată',
                    required: true
                },
                {
                    name: 'date',
                    label: 'Data efectivă',
                    type: FieldType.DATE,
                    placeholder: 'Selectează data efectivă',
                    required: true
                }
            ]
        },
        {
            title: "Detalii suplimentare",
            columns: 1,
            fields: [
                {
                    name: 'document_reference',
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

export const updateProjectFundFormConfig = (project?: string): DynamicFormConfig => ({
    ...createProjectFundFormConfig(project),
    submitButtonText: 'Actualizează finanțare'
});