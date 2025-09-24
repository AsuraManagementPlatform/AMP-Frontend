import {DynamicFormConfig, FieldType, SelectOption} from "@/types/form.types.ts";
import {ActivityStatus, ActivityType} from "@/types/activity.types.ts";

const getActivityStatusOptions = (): SelectOption[] => [
    { value: ActivityStatus.PLANNED, label: 'Planificat' },
    { value: ActivityStatus.IN_PROGRESS, label: 'În progres' },
    { value: ActivityStatus.COMPLETED, label: 'Finalizat' },
    { value: ActivityStatus.CANCELLED, label: 'Anulat' },
    { value: ActivityStatus.POSTPONED, label: 'Amânat' }
];

const getActivityTypeOptions = (): SelectOption[] => [
    { value: ActivityType.MEETING, label: 'Întâlnire' },
    { value: ActivityType.WORKSHOP, label: 'Workshop' },
    { value: ActivityType.EVENT, label: 'Eveniment' },
    { value: ActivityType.TASK, label: 'Sarcină' },
    { value: ActivityType.MILESTONE, label: 'Milestone' },
    { value: ActivityType.REVIEW, label: 'Review' }
];

export const createActivityFormConfig = (
    projectId?: string,
    availableProjects: { id: string; name: string }[] = [],
    _availableUsers: { id: string; name: string }[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații activitate",
            columns: 2,
            fields: [
                {
                    name: 'title',
                    label: 'Titlu activitate',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Întâlnire echipă săptămânală',
                    required: true,
                    maxLength: 255,
                    gridColumn: 'full'
                },
                {
                    name: 'description',
                    label: 'Descriere',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Descriere detaliată a activității...',
                    maxLength: 1000,
                    rows: 3,
                    gridColumn: 'full'
                },
                {
                    name: 'type',
                    label: 'Tip activitate',
                    type: FieldType.SELECT,
                    required: true,
                    options: getActivityTypeOptions()
                },
                {
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    options: getActivityStatusOptions()
                },
                {
                    name: 'startDate',
                    label: 'Data de început',
                    type: FieldType.DATE,
                    placeholder: 'Selectează data de început',
                    required: true
                },
                {
                    name: 'endDate',
                    label: 'Data de sfârșit',
                    type: FieldType.DATE,
                    placeholder: 'Selectează data de sfârșit'
                },
                {
                    name: 'location',
                    label: 'Locație',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Sala de conferințe A',
                    maxLength: 255
                },
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
                    name: 'estimatedHours',
                    label: 'Ore estimate',
                    type: FieldType.NUMBER,
                    placeholder: 'ex: 4',
                    min: 0,
                    step: 0.5
                },
                {
                    name: 'notes',
                    label: 'Notițe',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Notițe suplimentare...',
                    maxLength: 500,
                    rows: 2,
                    gridColumn: 'full'
                }
            ]
        }
    ],
    submitButtonText: 'Creează activitate',
    cancelButtonText: 'Anulează'
});

export const updateActivityFormConfig = (
    projectId?: string,
    availableProjects: { id: string; name: string }[] = [],
    _availableUsers: { id: string; name: string }[] = []
): DynamicFormConfig => ({
    ...createActivityFormConfig(projectId, availableProjects, _availableUsers),
    submitButtonText: 'Actualizează activitate'
});