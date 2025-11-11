import {CommunicationType, DynamicFormConfig, FieldType, SelectOption} from '@/types/index.types';


export const createEntityCommunicationFormConfig = (
    entities: SelectOption[] = [],
    organizationMembers: SelectOption[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații de bază",
            columns: 2,
            fields: [
                {
                    name: 'entity',
                    label: 'Entitate',
                    type: FieldType.SELECT,
                    required: true,
                    placeholder: 'Selectați entitatea',
                    options: entities,
                    helperText: 'Selectează entitatea cu care se comunică'
                },
                {
                    name: 'responsible',
                    label: 'Responsabil',
                    type: FieldType.SELECT,
                    required: true,
                    options: organizationMembers,
                },
                {
                    name: 'date',
                    label: 'Data comunicării',
                    type: FieldType.DATE,
                    required: true,
                    helperText: 'Data când a avut loc sau va avea loc comunicarea'
                },
                {
                    name: 'type',
                    label: 'Tip comunicare',
                    type: FieldType.SELECT,
                    required: true,
                    placeholder: 'Selectați tipul',
                    options: getCommunicationTypeOptions()
                },
            ]
        },
        {
            title: "Detalii comunicare",
            columns: 1,
            fields: [
                {
                    name: 'topic',
                    label: 'Subiect / Scop',
                    type: FieldType.TEXT,
                    required: true,
                    placeholder: 'ex: Discuție sponsorizare proiect',
                    maxLength: 500,
                    helperText: 'Descriere scurtă a scopului comunicării'
                },
                {
                    name: 'content',
                    label: 'Rezumat conținut / Notițe',
                    type: FieldType.TEXTAREA,
                    required: true,
                    placeholder: 'Detalii despre comunicare, ce s-a discutat, concluzii...',
                    rows: 4,
                    helperText: 'Notează detalii importante despre comunicare'
                }
            ]
        },
        {
            title: "Acțiuni de follow-up",
            columns: 1,
            fields: [
                {
                    name: 'next_steps',
                    label: 'Următorii pași',
                    type: FieldType.TEXTAREA,
                    required: false,
                    placeholder: 'ex: Trimite ofertă formală, Programează întâlnire de follow-up...',
                    rows: 3,
                    helperText: 'Ce trebuie făcut în continuare'
                }
            ]
        }
    ]
});

export const updateEntityCommunicationFormConfig = (
    organizationMembers: SelectOption[] = [],
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații de bază",
            columns: 2,
            fields: [
                {
                    name: 'entity',
                    label: 'Entitate',
                    type: FieldType.HIDDEN,
                    required: true,
                },
                {
                    name: 'responsible',
                    label: 'Responsabil',
                    type: FieldType.SELECT,
                    required: true,
                    options: organizationMembers,
                },
                {
                    name: 'date',
                    label: 'Data comunicării',
                    type: FieldType.DATE,
                    required: true,
                    helperText: 'Data când a avut loc sau va avea loc comunicarea'
                },
                {
                    name: 'type',
                    label: 'Tip comunicare',
                    type: FieldType.SELECT,
                    required: true,
                    placeholder: 'Selectați tipul',
                    options: getCommunicationTypeOptions()
                },
            ]
        },
        {
            title: "Detalii comunicare",
            columns: 1,
            fields: [
                {
                    name: 'topic',
                    label: 'Subiect / Scop',
                    type: FieldType.TEXT,
                    required: true,
                    placeholder: 'ex: Discuție sponsorizare proiect',
                    maxLength: 500,
                    helperText: 'Descriere scurtă a scopului comunicării'
                },
                {
                    name: 'content',
                    label: 'Rezumat conținut / Notițe',
                    type: FieldType.TEXTAREA,
                    required: true,
                    placeholder: 'Detalii despre comunicare, ce s-a discutat, concluzii...',
                    rows: 4,
                    helperText: 'Notează detalii importante despre comunicare'
                }
            ]
        },
        {
            title: "Acțiuni de follow-up",
            columns: 1,
            fields: [
                {
                    name: 'next_steps',
                    label: 'Următorii pași',
                    type: FieldType.TEXTAREA,
                    required: false,
                    placeholder: 'ex: Trimite ofertă formală, Programează întâlnire de follow-up...',
                    rows: 3,
                    helperText: 'Ce trebuie făcut în continuare'
                }
            ]
        }
    ]
});

export function getCommunicationTypeOptions(): SelectOption[] {
    return [
        { value: CommunicationType.EMAIL, label: 'Email' },
        { value: CommunicationType.PHONE, label: 'Telefon' },
        { value: CommunicationType.MEETING, label: 'Întâlnire' },
        { value: CommunicationType.LETTER, label: 'Scrisoare' },
        { value: CommunicationType.NEWSLETTER, label: 'Newsletter' },
        { value: CommunicationType.OTHER, label: 'Altul' }
    ];
}
