import { z } from 'zod';
import { UserCommunicationType, CommunicationPriority } from '@/types/communication.types';

export const COMMUNICATION_TYPES = Object.values(UserCommunicationType);
export const COMMUNICATION_PRIORITIES = Object.values(CommunicationPriority);

export const createCommunicationSchema = z.object({
    type: z.enum(COMMUNICATION_TYPES as [UserCommunicationType, ...UserCommunicationType[]]),
    recipient: z.string().min(1, 'Destinatarul este obligatoriu'),
    organization: z.string().min(1, 'Organizația este obligatorie'),
    subject: z.string()
        .min(3, 'Subiectul trebuie să conțină cel puțin 3 caractere')
        .max(255, 'Subiectul nu poate depăși 255 de caractere'),
    initialMessage: z.string()
        .min(10, 'Mesajul trebuie să conțină cel puțin 10 caractere')
        .max(2000, 'Mesajul nu poate depăși 2000 de caractere'),
    priority: z.enum(COMMUNICATION_PRIORITIES as [CommunicationPriority, ...CommunicationPriority[]]).optional(),
    relatedProject: z.string().optional(),
    relatedActivity: z.string().optional(),
});

export type CreateCommunicationData = z.infer<typeof createCommunicationSchema>;

export const getDefaultCommunicationValues = (organizationId?: string, firstAdminId?: string): CreateCommunicationData => ({
    type: UserCommunicationType.QUESTION_TO_ADMIN,
    recipient: firstAdminId || '',
    organization: organizationId || '',
    subject: '',
    initialMessage: '',
    priority: CommunicationPriority.NORMAL,
    relatedProject: undefined,
    relatedActivity: undefined,
});
