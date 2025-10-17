import { DynamicFormConfig, FieldType, SelectOption } from "@/types/form.types.ts";
import { BudgetStatus } from "@/types/budget.types.ts";

const getBudgetStatusOptions = (): SelectOption[] => [
    { value: BudgetStatus.DRAFT, label: 'Draft' },
    { value: BudgetStatus.APPROVED, label: 'Aprobat' },
    { value: BudgetStatus.ACTIVE, label: 'Activ' },
    { value: BudgetStatus.COMPLETED, label: 'Finalizat' },
    { value: BudgetStatus.CANCELLED, label: 'Anulat' }
];

const getProjectOptions = (availableProjects: { id: string; name: string }[]): SelectOption[] => {
    return [
        { value: '', label: 'Selectează proiect' },
        ...availableProjects.map(project => ({
            value: project.id,
            label: project.name
        }))
    ];
};

export const createBudgetFormConfig = (
    availableProjects: { id: string; name: string }[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații buget",
            columns: 2,
            fields: [
                {
                    name: 'project',
                    label: 'Proiect',
                    type: FieldType.SELECT,
                    required: true,
                    options: getProjectOptions(availableProjects),
                    gridColumn: 'full'
                },
                {
                    name: 'currency',
                    label: 'Monedă',
                    type: FieldType.TEXT,
                    placeholder: 'RON',
                    required: true,
                    maxLength: 3
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    options: getBudgetStatusOptions()
                },
                {
                    name: 'notes',
                    label: 'Note',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note despre buget (opțional)',
                    maxLength: 1000,
                    rows: 3,
                    gridColumn: 'full'
                }
            ]
        }
    ],
    submitButtonText: 'Creează buget',
    cancelButtonText: 'Anulează'
});