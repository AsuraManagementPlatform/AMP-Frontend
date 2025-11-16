import { DynamicFormConfig, FieldType, SelectOption } from '@/types/form.types';
import { QuestionType } from '@/types/survey.types';
import { t } from 'i18next';

export const getQuestionTypeOptions = (): SelectOption[] => [
  { value: QuestionType.TEXT, label: t('label.survey.question_type_text') },
  { value: QuestionType.SINGLE_CHOICE, label: t('label.survey.question_type_single') },
  { value: QuestionType.MULTIPLE_CHOICE, label: t('label.survey.question_type_multiple') },
  { value: QuestionType.RATING, label: t('label.survey.question_type_rating') },
  { value: QuestionType.YES_NO, label: t('label.survey.question_type_yes_no') }
];

export const surveyFormConfig: DynamicFormConfig = {
  sections: [
    {
      title: t('label.survey.basic_info'),
      fields: [
        {
          name: 'title',
          label: t('label.survey.title'),
          type: FieldType.TEXT,
          required: true,
          placeholder: t('label.survey.title_placeholder'),
          gridColumn: 'full'
        },
        {
          name: 'description',
          label: t('label.survey.description'),
          type: FieldType.TEXTAREA,
          required: true,
          placeholder: t('label.survey.description_placeholder'),
          rows: 4,
          gridColumn: 'full'
        },
        {
          name: 'start_date',
          label: t('label.survey.start_date'),
          type: FieldType.DATE,
          required: true,
          gridColumn: 'half'
        },
        {
          name: 'end_date',
          label: t('label.survey.end_date'),
          type: FieldType.DATE,
          required: true,
          gridColumn: 'half'
        },
        {
          name: 'is_anonymous',
          label: t('label.survey.is_anonymous'),
          type: FieldType.CHECKBOX,
          required: false,
          gridColumn: 'full'
        }
      ]
    }
  ]
};
