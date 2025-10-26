import {
    Activity,
    DynamicFormConfig,
    ExpenseCategory, FieldType,
    ProjectExpenseStatus,
    SelectOption,
    Unit, Vat
} from "@/types/index.types.ts";
import {t} from "i18next";

const getExpenseCategoryOptions = (): SelectOption[] => [
    { value: ExpenseCategory.PERSONNEL, label: 'Personal' },
    { value: ExpenseCategory.EQUIPMENT, label: 'Echipamente' },
    { value: ExpenseCategory.MATERIALS, label: 'Materiale' },
    { value: ExpenseCategory.SERVICES, label: 'Servicii' },
    { value: ExpenseCategory.TRAVEL, label: 'Deplasări' },
    { value: ExpenseCategory.UTILITIES, label: 'Utilități' },
    { value: ExpenseCategory.MARKETING, label: 'Marketing' },
    { value: ExpenseCategory.ADMINISTRATIVE, label: 'Administrative' },
    { value: ExpenseCategory.OTHER, label: 'Altele' }
];

const getUnitTypeOptions = (): SelectOption[] => [
    { value: Unit.HOUR, label: 'Oră' },
    { value: Unit.DAY, label: 'Zi' },
    { value: Unit.NUMBER, label: 'Bucată' },
    { value: Unit.BATCH, label: 'Lot' }
];

const getTransactionStatusOptions = (): SelectOption[] => [
    { value: ProjectExpenseStatus.PLANNED, label: `${t('label.project_expense.planned')}` },
    { value: ProjectExpenseStatus.PAID, label: `${t('label.project_expense.paid')}` },
    { value: ProjectExpenseStatus.CANCELLED, label: `${t('label.project_expense.cancelled')}` }
];

export const createProjectExpenseFormConfig = (activities: Activity[] = [], vats: Vat[]): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații cheltuială",
            columns: 1,
            fields: [
                {
                    name: 'project',
                    label: 'Proiect',
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'activity',
                    label: 'Activitate',
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: '', label: 'Selectează activitatea' },
                        ...activities.map(activity => ({
                            value: activity.id,
                            label: activity.title
                        }))
                    ]
                },
                {
                    name: 'vat',
                    label: 'TVA',
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: '', label: 'Selectează o opțiune' },
                        ...vats.map(vat => ({
                            value: vat.id,
                            label: vat.name
                        }))
                    ]
                },
                {
                    name: 'name',
                    label: 'Nume cheltuială',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Materiale de birou',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'category',
                    label: 'Categorie',
                    type: FieldType.SELECT,
                    required: true,
                    options: getExpenseCategoryOptions()
                }
            ]
        },
        {
            title: "Detalii financiare",
            columns: 2,
            fields: [
                {
                    name: 'unitType',
                    label: 'Tip unitate',
                    type: FieldType.SELECT,
                    required: true,
                    options: getUnitTypeOptions()
                },
                {
                    name: 'quantity',
                    label: 'Cantitate',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 10',
                    required: true,
                    min: 0,
                    step: 0.01
                },
                {
                    name: 'unitPrice',
                    label: 'Preț unitar',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 150',
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
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    options: getTransactionStatusOptions()
                }
            ]
        }
    ],
    submitButtonText: 'Adaugă cheltuială',
    cancelButtonText: 'Anulează'
});

export const updateProjectExpenseFormConfig = (activities: Activity[] = [], vats: Vat[]): DynamicFormConfig => ({
    ...createProjectExpenseFormConfig(activities, vats),
    submitButtonText: 'Actualizează cheltuială'
});
