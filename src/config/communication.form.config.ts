import { DynamicFormConfig, FieldType, SelectOption } from '@/types/index.types';
import { UserCommunicationType, CommunicationPriority } from '@/types/communication.types';

export const createCommunicationFormConfig = (
    admins: SelectOption[] = [],
    projects: SelectOption[] = [],
    activities: SelectOption[] = [],
    isOrganizationAdmin: boolean = false
): DynamicFormConfig => ({
    sections: [
        {
            title: "Informații de bază",
            columns: 2,
            fields: [
                {
                    name: 'type',
                    label: 'Tip Mesaj',
                    type: FieldType.SELECT,
                    required: true,
                    placeholder: 'Selectează tipul mesajului',
                    options: getCommunicationTypeOptions(isOrganizationAdmin),
                    helperText: 'Alege categoria mesajului'
                },
                {
                    name: 'recipient',
                    label: 'Destinatar',
                    type: FieldType.SELECT,
                    required: false,
                    placeholder: 'Selectează destinatarul',
                    options: admins,
                    helperText: 'Administrator care va primi mesajul (opțional pentru broadcast)',
                    condition: (formValues: any) => formValues.type !== UserCommunicationType.BROADCAST_TO_ORGANIZATION
                },
                {
                    name: 'priority',
                    label: 'Prioritate',
                    type: FieldType.SELECT,
                    required: false,
                    placeholder: 'Selectează prioritatea',
                    options: getPriorityOptions(),
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
            title: "Conținut Mesaj",
            columns: 1,
            fields: [
                {
                    name: 'subject',
                    label: 'Subiect',
                    type: FieldType.TEXT,
                    required: true,
                    placeholder: 'Subiectul mesajului',
                    maxLength: 255,
                    helperText: 'Titlul mesajului tău'
                },
                {
                    name: 'initialMessage',
                    label: 'Mesaj',
                    type: FieldType.TEXTAREA,
                    required: true,
                    placeholder: 'Scrie mesajul tău aici...',
                    rows: 6,
                    helperText: 'Descrie în detaliu mesajul tău'
                }
            ]
        },
        {
            title: "Detalii suplimentare (opțional)",
            columns: 2,
            condition: (formValues: any) => {
                const type = formValues.type;
                return type === UserCommunicationType.PERMISSION_REQUEST || 
                       type === UserCommunicationType.FEEDBACK ||
                       type === UserCommunicationType.REPORT_ISSUE;
            },
            fields: [
                {
                    name: 'relatedProject',
                    label: 'Proiect asociat',
                    type: FieldType.SELECT,
                    required: false,
                    placeholder: 'Selectează proiectul (opțional)',
                    options: projects,
                    helperText: 'Dacă mesajul este legat de un proiect'
                },
                {
                    name: 'relatedActivity',
                    label: 'Activitate asociată',
                    type: FieldType.SELECT,
                    required: false,
                    placeholder: 'Selectează activitatea (opțional)',
                    options: activities,
                    helperText: 'Dacă mesajul este legat de o activitate'
                }
            ]
        }
    ]
});

export function getCommunicationTypeOptions(isOrganizationAdmin: boolean = false): SelectOption[] {
    const baseOptions: SelectOption[] = [
        { value: UserCommunicationType.GENERAL_MESSAGE, label: 'Mesaj General' },
        { value: UserCommunicationType.QUESTION_TO_ADMIN, label: 'Întrebare către Admin' },
        { value: UserCommunicationType.SUPPORT_REQUEST, label: 'Cerere de Asistență' },
        { value: UserCommunicationType.PERMISSION_REQUEST, label: 'Cerere de Permisiune' },
        { value: UserCommunicationType.FEEDBACK, label: 'Feedback' },
        { value: UserCommunicationType.REPORT_ISSUE, label: 'Raportare Problemă' },
        { value: UserCommunicationType.MEMBERSHIP_INQUIRY, label: 'Întrebare despre Membru' },
        { value: UserCommunicationType.SURVEY_QUESTION, label: 'Întrebare Sondaj' },
        { value: UserCommunicationType.POLL_QUESTION, label: 'Întrebare Poll' },
        { value: UserCommunicationType.OTHER, label: 'Altele' }
    ];
    
    if (isOrganizationAdmin) {
        baseOptions.push({ 
            value: UserCommunicationType.BROADCAST_TO_ORGANIZATION, 
            label: '📢 Anunț' 
        });
    }
    
    return baseOptions;
}

export function getPriorityOptions(): SelectOption[] {
    return [
        { value: CommunicationPriority.LOW, label: 'Scăzută' },
        { value: CommunicationPriority.NORMAL, label: 'Normală' },
        { value: CommunicationPriority.HIGH, label: 'Ridicată' },
        { value: CommunicationPriority.URGENT, label: 'Urgentă' }
    ];
}
