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
    
    category: z.string()
        .min(1, 'Categoria este obligatorie'),
    
    location: z.string()
        .min(1, 'Locația este obligatorie')
        .max(255, 'Locația nu poate depăși 255 de caractere'),
    
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
        .min(1, 'Data de început este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data de început nu este validă'
        ),
    
    endDate: z.string()
        .min(1, 'Data de sfârșit este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data de sfârșit nu este validă'
        ),
    
    budget: z.union([
        z.number(),
        z.string()
    ]).transform((value) => {
        if (typeof value === 'string') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error('Bugetul trebuie să fie un număr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value >= 0,
        'Bugetul trebuie să fie un număr pozitiv'
    ),
    
    currency: z.enum(['RON', 'EUR', 'USD'], {
        message: 'Moneda selectată nu este validă'
    }),
    
    budgetPlanningDate: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return !isNaN(Date.parse(value));
            },
            'Data planificare buget nu este validă'
        ),
    
    organizationId: z.string()
        .min(1, 'ID-ul organizației este obligatoriu'),
    
    managerId: z.string()
        .min(1, 'Managerul proiectului este obligatoriu'),
    
    budgetNotes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 500;
            },
            'Notele buget nu pot depăși 500 de caractere'
        ),
    
    tags: z.array(z.string())
        .optional()
}).refine((data) => {
    if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
        }
        
        return startDate <= endDate;
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
    category: '',
    location: '',
    status: ProjectStatus.DRAFT,
    priority: ProjectPriority.MEDIUM,
    startDate: '',
    endDate: '',
    budget: 0,
    currency: 'RON',
    budgetPlanningDate: '',
    organizationId: '',
    managerId: '',
    budgetNotes: '',
    tags: []
});
