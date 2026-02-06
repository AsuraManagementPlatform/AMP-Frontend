import {DynamicFormConfig, FieldType, SelectOption} from "@/types/form.types";
import {EngagementLevel} from "@/types/project-partner.types";
import {Entity} from "@/types/entity.types";
import i18next from 'i18next';

const getEngagementOptions = (): SelectOption[] => [
    { value: EngagementLevel.NONE, label: i18next.t('label.project_partner.engagement_none') },
    { value: EngagementLevel.PARTIAL, label: i18next.t('label.project_partner.engagement_partial') },
    { value: EngagementLevel.FULLY, label: i18next.t('label.project_partner.engagement_fully') },
];

export const createProjectPartnerFormConfig = (entities: Entity[] = []): DynamicFormConfig => ({
    sections: [
        {
            title: i18next.t('form.project_partner.section_info'),
            columns: 1,
            fields: [
                {
                    name: 'project',
                    label: i18next.t('label.project_partner.project'),
                    type: FieldType.HIDDEN,
                    required: true
                },
                {
                    name: 'entity',
                    label: i18next.t('label.project_partner.entity'),
                    type: FieldType.SELECT,
                    required: true,
                    placeholder: i18next.t('label.project_partner.select_entity'),
                    options: [
                        ...entities.map(entity => ({
                            value: entity.id,
                            label: entity.name
                        }))
                    ]
                },
                {
                    name: 'engagementLevel',
                    label: i18next.t('label.project_partner.engagement_level'),
                    type: FieldType.SELECT,
                    required: false,
                    options: getEngagementOptions()
                },
                {
                    name: 'budget',
                    label: i18next.t('label.project_partner.budget'),
                    type: FieldType.NUMBER,
                    required: false,
                    placeholder: i18next.t('label.project_partner.budget_placeholder'),
                    min: 0
                },
            ]
        },
    ],
    submitButtonText: i18next.t('form.project_partner.submit_create'),
    cancelButtonText: i18next.t('form.project_partner.cancel')
});

export const updateProjectPartnerFormConfig = (): DynamicFormConfig => ({
    sections: [
        {
            title: i18next.t('form.project_partner.update_title'),
            columns: 1,
            fields: [
                {
                    name: 'engagementLevel',
                    label: i18next.t('label.project_partner.engagement_level'),
                    type: FieldType.SELECT,
                    required: false,
                    options: getEngagementOptions()
                },
                {
                    name: 'budget',
                    label: i18next.t('label.project_partner.budget'),
                    type: FieldType.NUMBER,
                    required: false,
                    placeholder: i18next.t('label.project_partner.budget_placeholder'),
                    min: 0
                },
            ]
        },
    ],
    submitButtonText: i18next.t('form.project_partner.submit_update'),
    cancelButtonText: i18next.t('form.project_partner.cancel')
});