import {z} from 'zod';
import {PROJECT_CATEGORIES, ProjectStatus, ProjectPriority} from '@/types/project.types';

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

    category: z.enum(PROJECT_CATEGORIES, {
        message: 'Categoria selectată nu este validă'
    }),

    location: z.string()
        .min(1, 'Locația este obligatorie')
        .max(255, 'Locația nu poate depăși 255 de caractere'),

    starting_date: z.string()
        .min(1, 'Data de început este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data de început nu este validă'
        ),

    ending_date: z.string()
        .min(1, 'Data de sfârșit este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data de sfârșit nu este validă'
        ),

    status: z.enum([
        ProjectStatus.DRAFT,
        ProjectStatus.ACTIVE,
        ProjectStatus.COMPLETED,
        ProjectStatus.CANCELLED,
        ProjectStatus.ON_HOLD
    ], {
        message: 'Statusul proiectului este invalid'
    }).default(ProjectStatus.DRAFT),

    priority: z.enum([
        ProjectPriority.LOW,
        ProjectPriority.MEDIUM,
        ProjectPriority.HIGH,
        ProjectPriority.URGENT
    ], {
        message: 'Prioritatea proiectului este invalidă'
    }).default(ProjectPriority.MEDIUM),

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

    budget_planning_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return !isNaN(Date.parse(value));
            },
            'Data planificare buget nu este validă'
        ),

    organization: z.string()
        .min(1, 'ID-ul organizației este obligatoriu'),

    budget_responsible: z.string()
        .min(1, 'Responsabilul proiectului este obligatoriu'),

    budget_notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 500;
            },
            'Notele buget nu pot depăși 500 de caractere'
        ),

    sustainability: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 255;
            },
            'Sustenabilitatea nu poate depăși 255 de caractere'
        )
}).refine((data) => {
    if (data.starting_date && data.ending_date) {
        const startDate = new Date(data.starting_date);
        const endDate = new Date(data.ending_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
        }

        return endDate > startDate;
    }
    return true;
}, {
    message: 'Data de sfârșit trebuie să fie după data de început',
    path: ['ending_date']
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
    name: z.string()
        .optional()
        .refine(
            (value) => !value || (value.length >= 2 && value.length <= 255),
            'Numele proiectului trebuie să aibă între 2 și 255 caractere'
        ),

    description: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 1000,
            'Descrierea nu poate depăși 1000 de caractere'
        ),

    category: z.enum(PROJECT_CATEGORIES, {
        message: 'Categoria selectată nu este validă'
    }).optional(),

    location: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            'Locația nu poate depăși 255 de caractere'
        ),

    status: z.enum([
        ProjectStatus.DRAFT,
        ProjectStatus.ACTIVE,
        ProjectStatus.COMPLETED,
        ProjectStatus.CANCELLED,
        ProjectStatus.ON_HOLD
    ], {
        message: 'Statusul proiectului este invalid'
    }).optional(),

    priority: z.enum([
        ProjectPriority.LOW,
        ProjectPriority.MEDIUM,
        ProjectPriority.HIGH,
        ProjectPriority.URGENT
    ], {
        message: 'Prioritatea proiectului este invalidă'
    }).optional(),

    starting_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data de început nu este validă'
        ),

    ending_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data de sfârșit nu este validă'
        ),

    budget: z.union([
        z.number(),
        z.string()
    ]).optional().transform((value) => {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        if (typeof value === 'string') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error('Bugetul trebuie să fie un număr valid');
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value === undefined || value >= 0,
        'Bugetul trebuie să fie un număr pozitiv'
    ),

    currency: z.enum(['RON', 'EUR', 'USD'], {
        message: 'Moneda selectată nu este validă'
    }).optional(),

    budget_planning_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data planificare buget nu este validă'
        ),

    organization: z.string()
        .optional()
        .or(z.literal('')),

    budget_responsible: z.string()
        .optional()
        .or(z.literal('')),

    budget_notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 500,
            'Notele buget nu pot depăși 500 de caractere'
        ),

    sustainability: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            'Sustenabilitatea nu poate depăși 255 de caractere'
        )
}).refine((data) => {
    if (data.starting_date && data.ending_date) {
        const startDate = new Date(data.starting_date);
        const endDate = new Date(data.ending_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return true;
        }
        return endDate > startDate;
    }
    return true;
}, {
    message: 'Data de sfârșit trebuie să fie după data de început',
    path: ['ending_date']
});

export type UpdateProjectData = z.infer<typeof updateProjectSchema>;

export const getCreateProjectDefaultValues = (): CreateProjectData => ({
    name: '',
    description: '',
    category: 'educatie',
    location: '',
    status: ProjectStatus.DRAFT,
    priority: ProjectPriority.MEDIUM,
    starting_date: '',
    ending_date: '',
    budget: 0,
    currency: 'RON',
    budget_planning_date: '',
    organization: '',
    budget_responsible: '',
    budget_notes: '',
    sustainability: ''
});