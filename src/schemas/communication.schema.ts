import { z } from 'zod';
import { CommunicationType, CommunicationStatus } from '@/types/communication.types';

export const communicationSchema = z.object({
    entity_id: z.string()
        .min(1, 'Entitatea este obligatorie'),
    
    date: z.string()
        .min(1, 'Data comunicării este obligatorie')
        .refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, 'Data introdusă nu este validă'),
    
    type: z.nativeEnum(CommunicationType),
    
    status: z.nativeEnum(CommunicationStatus),
    
    subject: z.string()
        .min(2, 'Subiectul trebuie să conțină cel puțin 2 caractere')
        .max(500, 'Subiectul nu poate depăși 500 de caractere'),
    
    content: z.string()
        .min(5, 'Conținutul trebuie să conțină cel puțin 5 caractere')
        .max(2000, 'Conținutul nu poate depăși 2000 de caractere'),
    
    contact_person: z.string()
        .max(255, 'Numele persoanei de contact nu poate depăși 255 de caractere')
        .optional(),
    
    project_id: z.string()
        .optional(),
    
    next_steps: z.string()
        .max(1000, 'Următorii pași nu pot depăși 1000 de caractere')
        .optional()
});

export type CommunicationFormData = z.infer<typeof communicationSchema>;

export const getDefaultCommunicationValues = (): Partial<CommunicationFormData> => ({
    status: CommunicationStatus.PLANNED,
    date: new Date().toISOString().split('T')[0],
    type: CommunicationType.EMAIL
});