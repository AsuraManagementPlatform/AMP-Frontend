import { DynamicFormConfig, FieldType, SelectOption } from "@/types/form.types.ts";
import { ExpenseCategory, UnitType } from "@/types/project-expense.types.ts";
import {TransactionStatus} from "@/types/transaction.types.ts";
import {Activity} from "@/types/activity.types.ts";

const getExpenseCategoryOptions = (): SelectOption[] => [
    { value: ExpenseCategory.PERSONNEL, label: 'Personal' },
    { value: ExpenseCategory.EQUIPMENT, label: 'Echipamente' },
    { value: ExpenseCategory.MATERIALS, label: 'Materiale' },
    { value: ExpenseCategory.SERVICES, label: 'Servicii' },
    { value: ExpenseCategory.TRAVEL, label: 'Deplas─âri' },
    { value: ExpenseCategory.UTILITIES, label: 'Utilit─â╚¢i' },
    { value: ExpenseCategory.MARKETING, label: 'Marketing' },
    { value: ExpenseCategory.ADMINISTRATIVE, label: 'Administrative' },
    { value: ExpenseCategory.OTHER, label: 'Altele' }
];

const getUnitTypeOptions = (): SelectOption[] => [
    { value: UnitType.HOUR, label: 'Or─â' },
    { value: UnitType.DAY, label: 'Zi' },
    { value: UnitType.NUMBER, label: 'Bucat─â' },
    { value: UnitType.BATCH, label: 'Lot' }
];

const getTransactionStatusOptions = (): SelectOption[] => [
    { value: TransactionStatus.DRAFT, label: 'Draft' },
    { value: TransactionStatus.PENDING_APPROVAL, label: '├Än aprobare' },
    { value: TransactionStatus.APPROVED, label: 'Aprobat' },
    { value: TransactionStatus.PAID, label: 'Pl─âtit' },
    { value: TransactionStatus.REJECTED, label: 'Respins' },
    { value: TransactionStatus.CANCELLED, label: 'Anulat' }
];

export const createProjectExpenseFormConfig = (activities: Activity[] = []): DynamicFormConfig => ({
    sections: [
        {
            title: "Informa╚¢ii cheltuial─â",
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
                        { value: '', label: 'Selecteaz─â activitatea' },
                        ...activities.map(activity => ({
                            value: activity.id,
                            label: activity.title
                        }))
                    ]
                },
                {
                    name: 'name',
                    label: 'Nume cheltuial─â',
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
                    name: 'unit_type',
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
                    name: 'unit_price',
                    label: 'Pre╚¢ unitar',
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
                        { value: 'RON', label: 'Lei Rom├óne╚Öti (RON)' },
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
    submitButtonText: 'Adaug─â cheltuial─â',
    cancelButtonText: 'Anuleaz─â'
});

export const updateProjectExpenseFormConfig = (activities: Activity[] = []): DynamicFormConfig => ({
    ...createProjectExpenseFormConfig(activities),
    submitButtonText: 'Actualizeaz─â cheltuial─â'
});
