import { z } from 'zod';
import { ProjectStatus, ProjectPriority } from '@/types/project.types';

export const createProjectSchema = z.object({
    name: z.string()
        .min(2, 'Numele proiectului trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Numele proiectului nu poate depăși 255 de caractere'),
    
    description: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 1000;
            },
            'Descrierea nu poate depăși 1000 de caractere'
        ),
    
    status: z.enum([
        ProjectStatus.DRAFT,
        ProjectStatus.ACTIVE,
        ProjectStatus.COMPLETED,
        ProjectStatus.CANCELLED,
        ProjectStatus.ON_HOLD
    ], {
        message: 'Statusul proiectului este invalid'
    }),
    
    priority: z.enum([
        ProjectPriority.LOW,
        ProjectPriority.MEDIUM,
        ProjectPriority.HIGH,
        ProjectPriority.URGENT
    ], {
        message: 'Prioritatea proiectului este invalidă'
    }),
    
    startDate: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return !isNaN(Date.parse(value));
            },
            'Data de început nu este validă'
        ),
    
    endDate: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return !isNaN(Date.parse(value));
            },
            'Data de sfârșit nu este validă'
        ),
    
    budget: z.number()
        .optional()
        .refine(
            (value) => {
                if (value === undefined) return true;
                return value >= 0;
            },
            'Bugetul trebuie să fie un număr pozitiv'
        ),
    
    organizationId: z.string()
        .min(1, 'ID-ul organizației este obligatoriu'),
    
    managerId: z.string()
        .optional()
        .or(z.literal('')),
    
    tags: z.array(z.string())
        .optional()
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, {
    message: 'Data de sfârșit trebuie să fie după data de început',
    path: ['endDate']
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;

export const getCreateProjectDefaultValues = (): CreateProjectData => ({
    name: '',
    description: '',
    status: ProjectStatus.DRAFT,
    priority: ProjectPriority.MEDIUM,
    startDate: '',
    endDate: '',
    budget: undefined,
    organizationId: '',
    managerId: '',
    tags: []
});