import { DynamicFormConfig, FieldType, SelectOption } from '@/types/index.types';

export const createActivityProposalFormConfig = (
    projects: SelectOption[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații proiect",
            columns: 2,
            fields: [
                {
                    name: 'project',
                    label: 'Proiect',
                    type: FieldType.SELECT,
                    required: true,
                    placeholder: 'Selectează proiectul',
                    options: projects,
                    helperText: 'Proiectul în care vrei să adaugi activitatea'
                },
                {
                    name: 'organization',
                    label: 'Organizație',
                    type: FieldType.HIDDEN,
                    required: true,
                }
            ]
        },
        {
            title: "Detalii activitate propusă",
            columns: 1,
            fields: [
                {
                    name: 'activityTitle',
                    label: 'Titlu Activitate',
                    type: FieldType.TEXT,
                    required: true,
                    placeholder: 'ex: Workshop educațional pentru copii',
                    maxLength: 255,
                    helperText: 'Numele activității propuse'
                },
                {
                    name: 'description',
                    label: 'Descriere',
                    type: FieldType.TEXTAREA,
                    required: true,
                    placeholder: 'Descrie activitatea în detaliu...',
                    rows: 5,
                    helperText: 'Explică ce implică activitatea și ce obiective are'
                }
            ]
        },
        {
            title: "Programare și buget",
            columns: 2,
            fields: [
                {
                    name: 'startDate',
                    label: 'Data de început',
                    type: FieldType.DATE,
                    required: true,
                    helperText: 'Când ar trebui să înceapă activitatea'
                },
                {
                    name: 'endDate',
                    label: 'Data de sfârșit',
                    type: FieldType.DATE,
                    required: true,
                    helperText: 'Când se va finaliza activitatea'
                },
                {
                    name: 'estimatedBudget',
                    label: 'Buget estimat (RON)',
                    type: FieldType.NUMBER,
                    required: false,
                    placeholder: '0',
                    helperText: 'Bugetul necesar pentru activitate (opțional)'
                }
            ]
        },
        {
            title: "Justificare",
            columns: 1,
            fields: [
                {
                    name: 'justification',
                    label: 'Justificare (opțional)',
                    type: FieldType.TEXTAREA,
                    required: false,
                    placeholder: 'De ce este importantă această activitate?',
                    rows: 4,
                    helperText: 'Explică importanța și beneficiile activității propuse'
                }
            ]
        }
    ]
});
