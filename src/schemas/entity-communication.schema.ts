import {z} from 'zod';
import {CommunicationType, EntityCommunication} from '@/types/entity-communication.types.ts';
import {t} from "i18next";

export const COMMUNICATION_TYPES = Object.values(CommunicationType);

export const createEntityCommunicationSchema = z.object({
    entity: z.uuid('Entitatea este obligatorie'),
    responsible: z.uuid('Responsabilul este obligatorie'),

    date: z.string()
        .min(1, 'Data comunicării este obligatorie')
        .refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, 'Data introdusă nu este validă'),
    
    type: z.enum(COMMUNICATION_TYPES as [CommunicationType, ...CommunicationType[]]),

    topic: z.string()
        .min(2, 'Subiectul trebuie să conțină cel puțin 2 caractere')
        .max(500, 'Subiectul nu poate depăși 500 de caractere'),
    
    content: z.string()
        .min(5, 'Conținutul trebuie să conțină cel puțin 5 caractere')
        .max(2000, 'Conținutul nu poate depăși 2000 de caractere'),

    notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 511;
            },
            t('schema.entity_communication.notes_max_length')
        ),

    nextSteps: z.string().optional()
});

export type CreateEntityCommunicationData = z.infer<typeof createEntityCommunicationSchema>;

export const updateEntityCommunicationSchema = createEntityCommunicationSchema.extend({
    id: z.string(),
});

export type UpdateEntityCommunicationData = z.infer<typeof updateEntityCommunicationSchema>;

export const getDefaultEntityCommunicationValues = (entityId: string): CreateEntityCommunicationData => ({
    entity: entityId,
    responsible: '',
    date: new Date().toISOString().split('T')[0],
    type: CommunicationType.EMAIL,
    topic: '',
    content: '',
    notes: '',
    nextSteps: '',
});

export const getUpdateEntityCommunicationValues = (entityCommunication: EntityCommunication): UpdateEntityCommunicationData => ({
    id: entityCommunication.id,
    entity: entityCommunication.entity,
    responsible: entityCommunication.responsible,
    date: entityCommunication.date || new Date().toISOString().split('T')[0],
    type: entityCommunication.type || CommunicationType.EMAIL,
    topic: entityCommunication.topic || '',
    content: entityCommunication.content || '',
    notes: entityCommunication.notes || '',
    nextSteps: entityCommunication.nextStep || '',
});