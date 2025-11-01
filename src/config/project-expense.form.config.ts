import {
    Activity,
    DynamicFormConfig,
    ExpenseCategory, FieldType,
    SelectOption,
    Unit, Vat
} from "@/types/index.types.ts";
import {t} from "i18next";

const getExpenseCategoryOptions = (): SelectOption[] => [
    { value: ExpenseCategory.PERSONNEL, label: t('label.expense_category.personnel') },
    { value: ExpenseCategory.EQUIPMENT, label: t('label.expense_category.equipment') },
    { value: ExpenseCategory.MATERIALS, label: t('label.expense_category.materials') },
    { value: ExpenseCategory.SERVICES, label: t('label.expense_category.services') },
    { value: ExpenseCategory.TRAVEL, label: t('label.expense_category.travel') },
    { value: ExpenseCategory.UTILITIES, label: t('label.expense_category.utilities') },
    { value: ExpenseCategory.MARKETING, label: t('label.expense_category.marketing') },
    { value: ExpenseCategory.ADMINISTRATIVE, label: t('label.expense_category.administrative') },
    { value: ExpenseCategory.OTHER, label: t('label.expense_category.other') }
];

const getUnitTypeOptions = (): SelectOption[] => [
    { value: Unit.HOUR, label: t('label.unit_type.hour') },
    { value: Unit.DAY, label: t('label.unit_type.day') },
    { value: Unit.NUMBER, label: t('label.unit_type.number') },
    { value: Unit.BATCH, label: t('label.unit_type.batch') }
];

export const createProjectExpenseFormConfig = (activities: Activity[] = [], vats: Vat[]): DynamicFormConfig => ({
    sections: [
        {
            title: t('form.project_expense.section_info'),
            columns: 1,
            fields: [
                {
                    name: 'project',
                    label: t('label.project_expense.project'),
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'activity',
                    label: t('label.project_expense.activity'),
                    type: FieldType.SELECT,
                    required: false,
                    options: [
                        { value: '', label: t('label.project_expense.select_activity') },
                        ...activities.map(activity => ({
                            value: activity.id,
                            label: activity.title
                        }))
                    ]
                },
                {
                    name: 'vat',
                    label: t('label.project_expense.vat'),
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: '', label: t('label.project_expense.select_vat') },
                        ...vats.map(vat => ({
                            value: vat.id,
                            label: vat.name
                        }))
                    ]
                },
                {
                    name: 'name',
                    label: t('label.project_expense.name'),
                    type: FieldType.TEXT,
                    placeholder: t('label.project_expense.name_placeholder'),
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'category',
                    label: t('label.project_expense.category'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getExpenseCategoryOptions()
                }
            ]
        },
        {
            title: t('form.project_expense.section_financial'),
            columns: 2,
            fields: [
                {
                    name: 'unitType',
                    label: t('label.project_expense.unit_type'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getUnitTypeOptions()
                },
                {
                    name: 'quantity',
                    label: t('label.project_expense.quantity'),
                    type: FieldType.NUMBER,
                    placeholder: t('label.project_expense.quantity_placeholder'),
                    required: true,
                    min: 0,
                    step: 0.01
                },
                {
                    name: 'unitPrice',
                    label: t('label.project_expense.unit_price'),
                    type: FieldType.NUMBER,
                    placeholder: t('label.project_expense.unit_price_placeholder'),
                    required: true,
                    min: 0,
                    step: 0.01
                },
                {
                    name: 'currency',
                    label: t('label.project_expense.currency'),
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: 'RON', label: t('label.currency.ron') },
                        { value: 'EUR', label: t('label.currency.eur') },
                        { value: 'USD', label: t('label.currency.usd') }
                    ]
                }
            ]
        }
    ],
    submitButtonText: t('form.project_expense.submit_create'),
    cancelButtonText: t('form.project_expense.cancel')
});

export const updateProjectExpenseFormConfig = (activities: Activity[] = [], vats: Vat[]): DynamicFormConfig => ({
    ...createProjectExpenseFormConfig(activities, vats),
    submitButtonText: t('form.project_expense.submit_update')
});

export const executeProjectExpenseFormConfig = (vats: Vat[]): DynamicFormConfig => ({
    sections: [
        {
            title: t('form.project_expense.section_execute'),
            columns: 1,
            fields: [
                {
                    name: 'vat',
                    label: t('label.project_expense.vat'),
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: '', label: t('label.project_expense.select_vat') },
                        ...vats.map(vat => ({
                            value: vat.id,
                            label: vat.name
                        }))
                    ]
                },
                {
                    name: 'quantity',
                    label: t('label.project_expense.quantity'),
                    type: FieldType.NUMBER,
                    placeholder: t('label.project_expense.quantity_placeholder'),
                    required: true,
                    min: 0,
                    step: 0.01
                },
                {
                    name: 'unitPrice',
                    label: t('label.project_expense.unit_price'),
                    type: FieldType.NUMBER,
                    placeholder: t('label.project_expense.unit_price_placeholder'),
                    required: true,
                    min: 0,
                    step: 0.01
                },
                {
                    name: 'date',
                    label: t('label.project_expense.execution_date'),
                    type: FieldType.DATE,
                    placeholder: t('label.project_expense.execution_date'),
                    required: true
                }
            ]
        }
    ],
    submitButtonText: t('form.project_expense.submit_execute'),
    cancelButtonText: t('form.project_expense.cancel')
});