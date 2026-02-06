import {DynamicFormConfig, FieldType, SelectOption} from "@/types/form.types.ts";
import {ActivityType} from "@/types/activity.types.ts";
import i18next from 'i18next';

const t = (key: string) => i18next.t(key);

const getActivityTypeOptions = (): SelectOption[] => [
    { value: ActivityType.MEETING, label: t('label.activity.type_meeting') },
    { value: ActivityType.WORKSHOP, label: t('label.activity.type_workshop') },
    { value: ActivityType.TRAINING, label: t('label.activity.type_training') },
    { value: ActivityType.CONFERENCE, label: t('label.activity.type_conference') },
    { value: ActivityType.PRESENTATION, label: t('label.activity.type_presentation') },
    { value: ActivityType.EVENT, label: t('label.activity.type_event') },
    { value: ActivityType.TASK, label: t('label.activity.type_task') },
    { value: ActivityType.MILESTONE, label: t('label.activity.type_milestone') },
    { value: ActivityType.REVIEW, label: t('label.activity.type_review') },
    { value: ActivityType.OTHER, label: t('label.activity.type_other') }
];

export const createActivityFormConfig = (parentActivityOptions: SelectOption[] = []): DynamicFormConfig => ({
    sections: [
        {
            title: t('label.activity.section_info'),
            columns: 1,
            fields: [
                {
                    name: 'project',
                    label: t('label.activity.project'),
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'isSubActivity',
                    label: t('label.activity.is_sub_activity'),
                    type: FieldType.CHECKBOX,
                    required: false
                },
                {
                    name: 'parentActivity',
                    label: t('label.activity.parent_activity'),
                    type: FieldType.SEARCHABLE_SELECT,
                    required: false,
                    placeholder: t('label.activity.parent_activity_placeholder'),
                    options: parentActivityOptions,
                    condition: (formValues: any) => formValues.isSubActivity === true
                },
                {
                    name: 'title',
                    label: t('label.activity.title'),
                    type: FieldType.TEXT,
                    placeholder: t('label.activity.title_placeholder'),
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'type',
                    label: t('label.activity.type'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getActivityTypeOptions()
                },
                {
                    name: 'description',
                    label: t('label.activity.description'),
                    type: FieldType.TEXTAREA,
                    required: true,
                    placeholder: t('label.activity.description_placeholder'),
                    maxLength: 511,
                    rows: 3
                },
                {
                    name: 'location',
                    label: t('label.activity.location'),
                    type: FieldType.TEXT,
                    required: true,
                    placeholder: t('label.activity.location_placeholder'),
                    maxLength: 255
                }
            ]
        },
        {
            title: t('label.activity.section_planning'),
            columns: 2,
            fields: [
                {
                    name: 'startingDate',
                    label: t('label.activity.starting_date'),
                    type: FieldType.DATE,
                    placeholder: t('label.activity.starting_date_placeholder'),
                    required: true
                },
                {
                    name: 'estimatedEndingDate',
                    label: t('label.activity.estimated_ending_date'),
                    type: FieldType.DATE,
                    placeholder: t('label.activity.estimated_ending_date_placeholder'),
                    required: true
                }
            ]
        },
        {
            title: t('label.activity.section_additional'),
            columns: 1,
            fields: [
                {
                    name: 'results',
                    label: t('label.activity.results'),
                    type: FieldType.TEXTAREA,
                    placeholder: t('label.activity.results_placeholder'),
                    maxLength: 511,
                    rows: 3
                },
                {
                    name: 'indicators',
                    label: t('label.activity.indicators'),
                    type: FieldType.TEXTAREA,
                    placeholder: t('label.activity.indicators_placeholder'),
                    maxLength: 511,
                    rows: 3
                },
                {
                    name: 'observation',
                    label: t('label.activity.observation'),
                    type: FieldType.TEXTAREA,
                    required: true,
                    placeholder: t('label.activity.observation_placeholder'),
                    maxLength: 511,
                    rows: 2
                }
            ]
        }
    ],
    submitButtonText: t('form.activity.submit_create'),
    cancelButtonText: t('form.activity.cancel')
});

export const updateActivityFormConfig = (parentActivityOptions: SelectOption[] = []): DynamicFormConfig => ({
    ...createActivityFormConfig(parentActivityOptions),
    submitButtonText: t('form.activity.submit_update')
});

export const completeActivityFormConfig = (): DynamicFormConfig => ({
    sections: [
        {
            title: t('label.activity.section_complete'),
            columns: 1,
            fields: [
                {
                    name: 'project',
                    label: t('label.activity.project'),
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'startingDate',
                    label: t('label.activity.starting_date'),
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'endingDate',
                    label: t('label.activity.ending_date'),
                    type: FieldType.DATE,
                    placeholder: t('label.activity.ending_date_placeholder'),
                    required: true,
                    helperText: t('label.activity.ending_date_helper')
                },
            ]
        },
    ],
    submitButtonText: t('form.activity.submit_complete'),
    cancelButtonText: t('form.activity.cancel')
});