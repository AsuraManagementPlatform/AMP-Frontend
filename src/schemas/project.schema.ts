import { z } from 'zod';
import { ProjectStatus } from '@/types/project.types';

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
                return value.length <= 511;
            },
            'Descrierea nu poate depăși 511 caractere'
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
    
    startingDate: z.string()
        .min(1, 'Data de început este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data de început nu este validă'
        ),
    
    endingDate: z.string()
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
            if (value === '' || value === null || value === undefined) {
                return 0;
            }
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
        .min(1, 'Data planificării bugetului este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data planificării bugetului nu este validă'
        ),
    
    organization: z.string()
        .min(1, 'ID-ul organizației este obligatoriu'),
    
    budgetResponsible: z.string()
        .min(1, 'Responsabilul bugetului este obligatoriu'),
    
    budgetNotes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 511;
            },
            'Notele buget nu pot depăși 511 caractere'
        )
}).refine((data) => {
    if (data.startingDate && data.endingDate) {
        const startDate = new Date(data.startingDate);
        const endDate = new Date(data.endingDate);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
        }
        
        return startDate <= endDate;
    }
    return true;
}, {
    message: 'Data de sfârșit trebuie să fie după data de început',
    path: ['ending_date']
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial().extend({
    id: z.string().optional()
});

export type UpdateProjectData = z.infer<typeof updateProjectSchema>;

export const getCreateProjectDefaultValues = (): CreateProjectData => ({
    name: '',
    description: '',
    category: '',
    location: '',
    status: ProjectStatus.DRAFT,
    startingDate: '',
    endingDate: '',
    budget: 0,
    currency: 'RON',
    budgetPlanningDate: '',
    organization: '',
    budgetResponsible: '',
    budgetNotes: ''
});
