import { DynamicFormConfig, FieldType, SelectOption } from '@/types/form.types';
import { CommunicationType, CommunicationStatus } from '@/types/communication.types';

export const createCommunicationFormConfig = (
    entities: SelectOption[] = [],
    projects: SelectOption[] = []
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații de bază",
            columns: 2,
            fields: [
                {
                    name: 'entity_id',
                    label: 'Entitate',
                    type: FieldType.SELECT,
                    required: true,
                    placeholder: 'Selectați entitatea',
                    options: entities,
                    helperText: 'Selectează entitatea cu care se comunică'
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
                {
                    name: 'status',
                    label: 'Status',
                    type: FieldType.SELECT,
                    required: true,
                    placeholder: 'Selectați statusul',
                    options: getCommunicationStatusOptions()
                },
                {
                    name: 'contact_person',
                    label: 'Persoană de contact',
                    type: FieldType.TEXT,
                    required: false,
                    placeholder: 'ex: Ion Popescu',
                    maxLength: 255,
                    helperText: 'Persoana de contact din entitate'
                },
                {
                    name: 'project_id',
                    label: 'Proiect asociat',
                    type: FieldType.SELECT,
                    required: false,
                    placeholder: 'Selectați proiectul (opțional)',
                    options: projects,
                    helperText: 'Opțional - proiectul legat de această comunicare'
                }
            ]
        },
        {
            title: "Detalii comunicare",
            columns: 1,
            fields: [
                {
                    name: 'subject',
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

export const updateCommunicationFormConfig = (
    entities: SelectOption[] = [],
    projects: SelectOption[] = []
): DynamicFormConfig => createCommunicationFormConfig(entities, projects);

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

export function getCommunicationStatusOptions(): SelectOption[] {
    return [
        { value: CommunicationStatus.PLANNED, label: 'Planificat' },
        { value: CommunicationStatus.COMPLETED, label: 'Finalizat' },
        { value: CommunicationStatus.CANCELLED, label: 'Anulat' }
    ];
}

export function getCommunicationTypeLabel(type: CommunicationType): string {
    const labels = {
        [CommunicationType.EMAIL]: 'Email',
        [CommunicationType.PHONE]: 'Telefon',
        [CommunicationType.MEETING]: 'Întâlnire',
        [CommunicationType.LETTER]: 'Scrisoare',
        [CommunicationType.NEWSLETTER]: 'Newsletter',
        [CommunicationType.OTHER]: 'Altul'
    };
    return labels[type] || type;
}

export function getCommunicationStatusLabel(status: CommunicationStatus): string {
    const labels = {
        [CommunicationStatus.PLANNED]: 'Planificat',
        [CommunicationStatus.COMPLETED]: 'Finalizat',
        [CommunicationStatus.CANCELLED]: 'Anulat'
    };
    return labels[status] || status;
}