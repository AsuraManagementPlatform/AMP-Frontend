import {DynamicFormConfig, FieldType, SelectOption} from "@/types/form.types.ts";
import {ProjectStatus, ProjectPriority} from "@/types/project.types.ts";

const getProjectStatusOptions = (): SelectOption[] => [
    { value: ProjectStatus.DRAFT, label: 'Draft' },
    { value: ProjectStatus.ACTIVE, label: 'Activ' },
    { value: ProjectStatus.COMPLETED, label: 'Finalizat' },
    { value: ProjectStatus.CANCELLED, label: 'Anulat' },
    { value: ProjectStatus.ON_HOLD, label: 'Suspendat' }
];

const getProjectPriorityOptions = (): SelectOption[] => [
    { value: ProjectPriority.LOW, label: 'Scăzută' },
    { value: ProjectPriority.MEDIUM, label: 'Medie' },
    { value: ProjectPriority.HIGH, label: 'Înaltă' },
    { value: ProjectPriority.URGENT, label: 'Urgentă' }
];

export const createProjectFormConfig = (
    _organizationId?: string,
    availableManagers: { id: string; name: string }[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații proiect",
            columns: 2,
            fields: [
                {
                    name: 'name',
                    label: 'Nume proiect',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Implementare sistem management',
                    required: true,
                    maxLength: 255,
                    gridColumn: 'full'
                },
                {
                    name: 'description',
                    label: 'Descriere',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Descriere detaliată a proiectului...',
                    maxLength: 1000,
                    rows: 3,
                    gridColumn: 'full'
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
                    options: getProjectPriorityOptions()
                },
                {
                    name: 'startDate',
                    label: 'Data de început',
                    type: FieldType.DATE,
                    placeholder: 'Selectează data de început'
                },
                {
                    name: 'endDate',
                    label: 'Data de sfârșit',
                    type: FieldType.DATE,
                    placeholder: 'Selectează data de sfârșit'
                },
                {
                    name: 'budget',
                    label: 'Buget (RON)',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 50000',
                    min: 0
                },
                {
                    name: 'managerId',
                    label: 'Manager proiect',
                    type: FieldType.SELECT,
                    options: [
                        { value: '', label: 'Selectează manager' },
                        ...availableManagers.map(manager => ({
                            value: manager.id,
                            label: manager.name
                        }))
                    ]
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