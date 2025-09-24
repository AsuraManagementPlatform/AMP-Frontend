import {DynamicFormConfig, FieldType, SelectOption} from "@/types/form.types.ts";
import {ExpenseCategory, ExpenseStatus, IncomeCategory, IncomeStatus} from "@/types/financial.types.ts";

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

const getExpenseStatusOptions = (): SelectOption[] => [
    { value: ExpenseStatus.DRAFT, label: 'Draft' },
    { value: ExpenseStatus.PENDING_APPROVAL, label: 'În așteptare aprobare' },
    { value: ExpenseStatus.APPROVED, label: 'Aprobat' },
    { value: ExpenseStatus.PAID, label: 'Plătit' },
    { value: ExpenseStatus.REJECTED, label: 'Respins' },
    { value: ExpenseStatus.CANCELLED, label: 'Anulat' }
];

const getIncomeCategoryOptions = (): SelectOption[] => [
    { value: IncomeCategory.GRANT, label: 'Grant' },
    { value: IncomeCategory.DONATION, label: 'Donație' },
    { value: IncomeCategory.SPONSORSHIP, label: 'Sponsorizare' },
    { value: IncomeCategory.SERVICE_FEE, label: 'Taxa servicii' },
    { value: IncomeCategory.PRODUCT_SALE, label: 'Vânzare produse' },
    { value: IncomeCategory.MEMBERSHIP_FEE, label: 'Taxa membru' },
    { value: IncomeCategory.OTHER, label: 'Altele' }
];

const getIncomeStatusOptions = (): SelectOption[] => [
    { value: IncomeStatus.EXPECTED, label: 'Așteptat' },
    { value: IncomeStatus.RECEIVED, label: 'Primit' },
    { value: IncomeStatus.CANCELLED, label: 'Anulat' },
    { value: IncomeStatus.OVERDUE, label: 'Întârziat' }
];

export const createExpenseFormConfig = (
    projectId?: string,
    availableProjects: { id: string; name: string }[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații cheltuială",
            columns: 2,
            fields: [
                {
                    name: 'projectId',
                    label: 'Proiect',
                    type: FieldType.SELECT,
                    required: true,
                    disabled: !!projectId,
                    options: projectId 
                        ? availableProjects.filter(p => p.id === projectId).map(p => ({ value: p.id, label: p.name }))
                        : [
                            { value: '', label: 'Selectează proiect' },
                            ...availableProjects.map(project => ({
                                value: project.id,
                                label: project.name
                            }))
                        ]
                },
                {
                    name: 'category',
                    label: 'Categoria cheltuielii',
                    type: FieldType.SELECT,
                    required: true,
                    options: getExpenseCategoryOptions()
                },
                {
                    name: 'description',
                    label: 'Descriere',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Descriere detaliată a cheltuielii...',
                    required: true,
                    maxLength: 500,
                    rows: 2,
                    gridColumn: 'full'
                },
                {
                    name: 'amount',
                    label: 'Suma',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 500.00',
                    required: true,
                    min: 0.01,
                    step: 0.01
                },
                {
                    name: 'currency',
                    label: 'Moneda',
                    type: FieldType.TEXT,
                    placeholder: 'RON',
                    required: true,
                    maxLength: 3,
                    minLength: 3
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    options: getExpenseStatusOptions()
                },
                {
                    name: 'expenseDate',
                    label: 'Data cheltuielii',
                    type: FieldType.DATE,
                    required: true
                },
                {
                    name: 'vendor',
                    label: 'Furnizor',
                    type: FieldType.TEXT,
                    placeholder: 'Numele furnizorului',
                    maxLength: 255
                },
                {
                    name: 'receiptUrl',
                    label: 'URL bon/factură',
                    type: FieldType.TEXT,
                    placeholder: 'https://...'
                },
                {
                    name: 'notes',
                    label: 'Note suplimentare',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note suplimentare...',
                    maxLength: 1000,
                    rows: 2,
                    gridColumn: 'full'
                }
            ]
        }
    ],
    submitButtonText: 'Înregistrează cheltuiala',
    cancelButtonText: 'Anulează'
});

export const createIncomeFormConfig = (
    projectId?: string,
    availableProjects: { id: string; name: string }[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații venit",
            columns: 2,
            fields: [
                {
                    name: 'projectId',
                    label: 'Proiect',
                    type: FieldType.SELECT,
                    required: true,
                    disabled: !!projectId,
                    options: projectId 
                        ? availableProjects.filter(p => p.id === projectId).map(p => ({ value: p.id, label: p.name }))
                        : [
                            { value: '', label: 'Selectează proiect' },
                            ...availableProjects.map(project => ({
                                value: project.id,
                                label: project.name
                            }))
                        ]
                },
                {
                    name: 'category',
                    label: 'Categoria venitului',
                    type: FieldType.SELECT,
                    required: true,
                    options: getIncomeCategoryOptions()
                },
                {
                    name: 'description',
                    label: 'Descriere',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Descriere detaliată a venitului...',
                    required: true,
                    maxLength: 500,
                    rows: 2,
                    gridColumn: 'full'
                },
                {
                    name: 'amount',
                    label: 'Suma',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 1500.00',
                    required: true,
                    min: 0.01,
                    step: 0.01
                },
                {
                    name: 'currency',
                    label: 'Moneda',
                    type: FieldType.TEXT,
                    placeholder: 'RON',
                    required: true,
                    maxLength: 3,
                    minLength: 3
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    options: getIncomeStatusOptions()
                },
                {
                    name: 'source',
                    label: 'Sursa venitului',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Fundația ABC',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'expectedDate',
                    label: 'Data estimată',
                    type: FieldType.DATE
                },
                {
                    name: 'receivedDate',
                    label: 'Data primirii',
                    type: FieldType.DATE
                },
                {
                    name: 'invoiceNumber',
                    label: 'Numărul facturii',
                    type: FieldType.TEXT,
                    placeholder: 'ex: INV-2024-001',
                    maxLength: 100
                },
                {
                    name: 'contractReference',
                    label: 'Referința contractului',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Contract-123/2024',
                    maxLength: 255
                },
                {
                    name: 'notes',
                    label: 'Note suplimentare',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note suplimentare...',
                    maxLength: 1000,
                    rows: 2,
                    gridColumn: 'full'
                }
            ]
        }
    ],
    submitButtonText: 'Înregistrează venitul',
    cancelButtonText: 'Anulează'
});