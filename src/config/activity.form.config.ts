import {DynamicFormConfig, FieldType, SelectOption} from "@/types/form.types.ts";
import {ActivityStatus, ActivityType} from "@/types/activity.types.ts";

const getActivityTypeOptions = (): SelectOption[] => [
    { value: ActivityType.MEETING, label: 'Întâlnire' },
    { value: ActivityType.WORKSHOP, label: 'Workshop' },
    { value: ActivityType.TRAINING, label: 'Training' },
    { value: ActivityType.CONFERENCE, label: 'Conferință' },
    { value: ActivityType.PRESENTATION, label: 'Prezentare' },
    { value: ActivityType.EVENT, label: 'Eveniment' },
    { value: ActivityType.TASK, label: 'Sarcină' },
    { value: ActivityType.MILESTONE, label: 'Obiectiv' },
    { value: ActivityType.REVIEW, label: 'Revizuire' },
    { value: ActivityType.OTHER, label: 'Altele' }
];

const getActivityStatusOptions = (): SelectOption[] => [
    { value: ActivityStatus.PLANNED, label: 'Planificat' },
    { value: ActivityStatus.IN_PROGRESS, label: 'În progres' },
    { value: ActivityStatus.COMPLETED, label: 'Finalizat' },
    { value: ActivityStatus.CANCELLED, label: 'Anulat' },
    { value: ActivityStatus.POSTPONED, label: 'Amânat' }
];

export const createActivityFormConfig = (): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații activitate",
            columns: 1,
            fields: [
                {
                    name: 'project',
                    label: 'Proiect',
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'title',
                    label: 'Titlu activitate',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Workshop educație civică',
                    required: true,
                    maxLength: 255
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
                    name: 'description',
                    label: 'Descriere',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Descriere detaliată a activității...',
                    maxLength: 511,
                    rows: 3
                },
                {
                    name: 'location',
                    label: 'Locație',
                    type: FieldType.TEXT,
                    placeholder: 'ex: Sala de conferințe, București',
                    maxLength: 255
                }
            ]
        },
        {
            title: "Planificare",
            columns: 2,
            fields: [
                {
                    name: 'starting_date',
                    label: 'Data de început',
                    type: FieldType.DATE,
                    placeholder: 'Selectează data de început',
                    required: true
                },
                {
                    name: 'estimated_ending_date',
                    label: 'Data estimată de sfârșit',
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
                    name: 'results',
                    label: 'Rezultate',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Rezultatele activității...',
                    maxLength: 511,
                    rows: 3
                },
                {
                    name: 'indicators',
                    label: 'Indicatori',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Indicatorii de performanță...',
                    maxLength: 511,
                    rows: 3
                },
                {
                    name: 'observation',
                    label: 'Observații',
                    type: FieldType.TEXTAREA,
                    placeholder: 'Note sau observații despre activitate...',
                    maxLength: 511,
                    rows: 2
                }
            ]
        }
    ],
    submitButtonText: 'Creează activitate',
    cancelButtonText: 'Anulează'
});

export const updateActivityFormConfig = (): DynamicFormConfig => ({
    ...createActivityFormConfig(),
    submitButtonText: 'Actualizează activitate'
});