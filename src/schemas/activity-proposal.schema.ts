import { z } from 'zod';

export const createActivityProposalSchema = z.object({
    project: z.string().min(1, 'Proiectul este obligatoriu'),
    organization: z.string().min(1, 'Organizația este obligatorie'),
    activityTitle: z.string()
        .min(3, 'Titlul trebuie să conțină cel puțin 3 caractere')
        .max(255, 'Titlul nu poate depăși 255 de caractere'),
    description: z.string()
        .min(10, 'Descrierea trebuie să conțină cel puțin 10 caractere')
        .max(2000, 'Descrierea nu poate depăși 2000 de caractere'),
    startDate: z.string()
        .min(1, 'Data de început este obligatorie')
        .refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, 'Data introdusă nu este validă'),
    endDate: z.string()
        .min(1, 'Data de sfârșit este obligatorie')
        .refine((date) => {
            const parsedDate = new Date(date);
            return !isNaN(parsedDate.getTime());
        }, 'Data introdusă nu este validă'),
    estimatedBudget: z.number().min(0, 'Bugetul nu poate fi negativ').optional(),
    justification: z.string()
        .max(1000, 'Justificarea nu poate depăși 1000 de caractere')
        .optional(),
}).refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    {
        message: 'Data de sfârșit trebuie să fie după data de început',
        path: ['endDate'],
    }
);

export type CreateActivityProposalData = z.infer<typeof createActivityProposalSchema>;

export const getDefaultActivityProposalValues = (projectId?: string, organizationId?: string): CreateActivityProposalData => ({
    project: projectId || '',
    organization: organizationId || '',
    activityTitle: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    estimatedBudget: undefined,
    justification: '',
});
