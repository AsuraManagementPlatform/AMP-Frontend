import { DynamicFormConfig, FieldType } from "@/types/form.types.ts";
import i18next from 'i18next';

const t = (key: string) => i18next.t(key);

export const createLeaveRequestFormConfig = (): DynamicFormConfig => ({
    sections: [
        {
            title: t('label.leave_request.section_dates'),
            columns: 2,
            fields: [
                {
                    name: 'date',
                    label: t('label.leave_request.start_date'),
                    type: FieldType.DATE,
                    placeholder: t('label.leave_request.start_date_placeholder'),
                    required: true
                },
                {
                    name: 'endDate',
                    label: t('label.leave_request.end_date'),
                    type: FieldType.DATE,
                    placeholder: t('label.leave_request.end_date_placeholder'),
                    required: false
                }
            ]
        },
        {
            title: t('label.leave_request.section_additional'),
            columns: 1,
            fields: [
                {
                    name: 'notes',
                    label: t('label.leave_request.notes'),
                    type: FieldType.TEXTAREA,
                    placeholder: t('label.leave_request.notes_placeholder'),
                    required: false,
                    maxLength: 500,
                    rows: 3
                }
            ]
        }
    ]
});

export const editLeaveRequestFormConfig = createLeaveRequestFormConfig;
