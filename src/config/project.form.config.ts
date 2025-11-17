import {DynamicFormConfig, FieldType, SelectOption} from "@/types/form.types.ts";
import {ProjectStatus, ProjectPriority} from "@/types/project.types.ts";
import {t} from "i18next";

const getProjectStatusOptions = (): SelectOption[] => [
    { value: ProjectStatus.DRAFT, label: t('label.project.status_draft') },
    { value: ProjectStatus.ACTIVE, label: t('label.project.status_active') },
    { value: ProjectStatus.COMPLETED, label: t('label.project.status_completed') },
    { value: ProjectStatus.CANCELLED, label: t('label.project.status_cancelled') },
    { value: ProjectStatus.ON_HOLD, label: t('label.project.status_on_hold') }
];

const getProjectPriorityOptions = (): SelectOption[] => [
    { value: ProjectPriority.LOW, label: t('label.project.priority_low') },
    { value: ProjectPriority.MEDIUM, label: t('label.project.priority_medium') },
    { value: ProjectPriority.HIGH, label: t('label.project.priority_high') },
    { value: ProjectPriority.URGENT, label: t('label.project.priority_urgent') }
];

const getCategoryOptions = (): SelectOption[] => [
    { value: 'educatie', label: t('label.project.category_education') },
    { value: 'mediu', label: t('label.project.category_environment') },
    { value: 'social', label: t('label.project.category_social') },
    { value: 'cultura', label: t('label.project.category_culture') },
    { value: 'sanatate', label: t('label.project.category_health') },
    { value: 'tehnologie', label: t('label.project.category_technology') },
    { value: 'altele', label: t('label.project.category_other') }
];

const getCurrencyOptions = (): SelectOption[] => [
    { value: 'RON', label: t('label.currency.ron') },
    { value: 'EUR', label: t('label.currency.eur') },
    { value: 'USD', label: t('label.currency.usd') }
];

export const createProjectFormConfig = (
    _organizationId?: string,
    availableManagers: { id: string; name: string }[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: t('form.project.section_basic'),
            columns: 1,
            fields: [
                {
                    name: 'name',
                    label: t('label.project.name'),
                    type: FieldType.TEXT,
                    placeholder: t('label.project.name_placeholder'),
                    required: true,
                    maxLength: 255
                },
                {
                    name: 'description',
                    label: t('label.project.description'),
                    type: FieldType.TEXTAREA,
                    placeholder: t('label.project.description_placeholder'),
                    maxLength: 511,
                    rows: 3
                },
                {
                    name: 'category',
                    label: t('label.project.category'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getCategoryOptions()
                },
                {
                    name: 'location',
                    label: t('label.project.location'),
                    type: FieldType.TEXT,
                    placeholder: t('label.project.location_placeholder'),
                    required: true,
                    maxLength: 255
                }
            ]
        },
        {
            title: t('form.project.section_planning'),
            columns: 2,
            fields: [
                {
                    name: 'status',
                    label: t('label.project.status'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getProjectStatusOptions()
                },
                {
                    name: 'priority',
                    label: t('label.project.priority'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getProjectPriorityOptions()
                },
                {
                    name: 'startingDate',
                    label: t('label.project.starting_date'),
                    type: FieldType.DATE,
                    placeholder: t('label.project.starting_date_placeholder'),
                    required: true
                },
                {
                    name: 'endingDate',
                    label: t('label.project.ending_date'),
                    type: FieldType.DATE,
                    placeholder: t('label.project.ending_date_placeholder'),
                    required: true
                }
            ]
        },
        {
            title: t('form.project.section_budget'),
            columns: 2,
            fields: [
                {
                    name: 'budget',
                    label: t('label.project.budget'),
                    type: FieldType.NUMBER,
                    placeholder: t('label.project.budget_placeholder'),
                    min: 0,
                    required: true
                },
                {
                    name: 'currency',
                    label: t('label.project.currency'),
                    type: FieldType.SELECT,
                    required: true,
                    options: getCurrencyOptions()
                }
            ]
        },
        {
            title: t('form.project.section_management'),
            columns: 1,
            fields: [
                {
                    name: 'organization',
                    label: t('label.project.organization'),
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'budgetResponsible',
                    label: t('label.project.budget_responsible'),
                    type: FieldType.SELECT,
                    required: true,
                    helperText: availableManagers.length === 0 
                        ? t('label.project.no_managers_helper') 
                        : undefined,
                    options: availableManagers.length > 0 ? [
                        { value: '', label: t('label.project.select_budget_responsible') },
                        ...availableManagers.map(manager => ({
                            value: manager.id,
                            label: manager.name
                        }))
                    ] : [
                        { value: '', label: t('label.project.no_managers_available') }
                    ]
                },
                {
                    name: 'budgetNotes',
                    label: t('label.project.budget_notes'),
                    type: FieldType.TEXTAREA,
                    placeholder: t('label.project.budget_notes_placeholder'),
                    maxLength: 511,
                    rows: 2
                },
                {
                    name: 'sustainability',
                    label: t('label.project.sustainability'),
                    type: FieldType.TEXTAREA,
                    placeholder: t('label.project.sustainability_placeholder'),
                    maxLength: 511,
                    rows: 2
                }
            ]
        }
    ],
    submitButtonText: t('form.project.submit_create'),
    cancelButtonText: t('form.project.cancel')
});

export const updateProjectFormConfig = (
    _organizationId?: string,
    availableManagers: { id: string; name: string }[] = []
): DynamicFormConfig => ({
    ...createProjectFormConfig(_organizationId, availableManagers),
    submitButtonText: t('form.project.submit_update')
});