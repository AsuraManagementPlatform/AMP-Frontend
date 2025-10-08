import {DynamicFormConfig, FieldType, SelectOption} from "@/types/form.types.ts";
import {ProjectStatus, PROJECT_CATEGORY_OPTIONS, ProjectPriority} from "@/types/project.types.ts";

const getProjectStatusOptions = (): SelectOption[] => [
    { value: ProjectStatus.DRAFT, label: 'Draft' },
    { value: ProjectStatus.ACTIVE, label: 'Activ' },
    { value: ProjectStatus.COMPLETED, label: 'Finalizat' },
    { value: ProjectStatus.CANCELLED, label: 'Anulat' },
    { value: ProjectStatus.ON_HOLD, label: 'Suspendat' }
];

export const createProjectFormConfig = (
    _organizationId?: string,
    availableManagers: { id: string; name: string }[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații proiect",
            columns: 1,
            fields: [
                {
                    name: 'name',
                    label: 'Nume proiect',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Implementare sistem management',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'description',
                    label: 'Descriere',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Descriere detaliată a proiectului...',
                    maxLength: 1000,
                    rows: 3
                },
                {
                    name: 'sustainability',
                    label: 'Sustenabilitate',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Proiect sustenabil prin...',
                    maxLength: 255
                },
                {
                    name: 'category',
                    label: 'Categorie',
                    type: FieldType.SELECT,
                    required: true,
                    options: PROJECT_CATEGORY_OPTIONS
                },
                {
                    name: 'location',
                    label: 'Locație',
                    type: FieldType.TEXT,
                    placeholder: 'ex: București, România',
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    options: getProjectStatusOptions()
                },
                {
                    name: 'priority',
                    label: 'Prioritate',
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: ProjectPriority.LOW, label: 'Scăzută' },
                        { value: ProjectPriority.MEDIUM, label: 'Medie' },
                        { value: ProjectPriority.HIGH, label: 'Înaltă' },
                        { value: ProjectPriority.URGENT, label: 'Urgentă' }
                    ]
                },
                {
                    name: 'starting_date',
                    label: 'Data de început',
                    type: FieldType.DATE,
                    placeholder: 'Selectează data de început',
                    required: true
                },
                {
                    name: 'ending_date',
                    label: 'Data de sfârșit',
                    type: FieldType.DATE,
                    placeholder: 'Selectează data de sfârșit',
                    required: true
                }
            ]
        },
        {
            title: "Buget proiect",
            columns: 2,
            fields: [
                {
                    name: 'budget',
                    label: 'Buget',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 50000',
                    min: 0,
                    required: true
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
                }
            ]
        },
        {
            title: "Planificare și management",
            columns: 1,
            fields: [
                {
                    name: 'organization',
                    label: 'Organizație',
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'budget_responsible',
                    label: 'Manager proiect',
                    type: FieldType.SELECT,
                    required: true,
                    options: [
                        { value: '', label: 'Selectează managerul...' },
                        ...availableManagers.map(manager => ({
                            value: manager.id,
                            label: manager.name
                        }))
                    ]
                },
                {
                    name: 'budget_notes',
                    label: 'Note buget',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note despre managementul bugetului...',
                    maxLength: 500,
                    rows: 2
                }
            ]
        }
    ],
    submitButtonText: 'Creează proiect',
    cancelButtonText: 'Anulează'
});

export const updateProjectFormConfig = (
    _organizationId?: string,
    availableManagers: { id: string; name: string }[] = []
): DynamicFormConfig => ({
    ...createProjectFormConfig(_organizationId, availableManagers),
    submitButtonText: 'Actualizează proiect'
});