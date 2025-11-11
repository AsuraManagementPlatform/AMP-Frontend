import { z } from 'zod';
import { ProjectStatus, ProjectPriority } from '@/types/project.types';
import { t } from 'i18next';

export const createProjectSchema = z.object({
    name: z.string()
        .min(2, t('schema.project.name_min'))
        .max(255, t('schema.project.name_max')),

    description: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 511;
            },
            t('schema.project.description_max')
        ),

    category: z.string()
        .min(1, t('schema.project.category_required')),

    location: z.string()
        .min(1, t('schema.project.location_required'))
        .max(255, t('schema.project.location_max')),

    status: z.enum([
        ProjectStatus.DRAFT,
        ProjectStatus.ACTIVE,
        ProjectStatus.COMPLETED,
        ProjectStatus.CANCELLED,
        ProjectStatus.ON_HOLD
    ] as [ProjectStatus, ...ProjectStatus[]], {
        message: t('schema.project.status_invalid')
    }),

    priority: z.enum([
        ProjectPriority.LOW,
        ProjectPriority.MEDIUM,
        ProjectPriority.HIGH,
        ProjectPriority.URGENT
    ] as [ProjectPriority, ...ProjectPriority[]], {
        message: t('schema.project.priority_invalid')
    }),

    startingDate: z.string()
        .min(1, t('schema.project.starting_date_required'))
        .refine(
            (value) => !isNaN(Date.parse(value)),
            t('schema.project.starting_date_invalid')
        ),

    endingDate: z.string()
        .min(1, t('schema.project.ending_date_required'))
        .refine(
            (value) => !isNaN(Date.parse(value)),
            t('schema.project.ending_date_invalid')
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
                throw new Error(t('schema.project.budget_must_be_number'));
            }
            return num;
        }
        return value;
    }).refine(
        (value) => value >= 0,
        t('schema.project.budget_must_be_positive')
    ),

    currency: z.enum(['RON', 'EUR', 'USD'], {
        message: t('schema.project.currency_invalid')
    }),

    budgetPlanningDate: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return !isNaN(Date.parse(value));
            },
            t('schema.project.budget_planning_date_invalid')
        ),

    organization: z.string()
        .min(1, t('schema.project.organization_required')),

    budgetResponsible: z.string()
        .min(1, t('schema.project.budget_responsible_required')),

    budgetNotes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 511;
            },
            t('schema.project.budget_notes_max')
        ),

    sustainability: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 511;
            },
            t('schema.project.sustainability_max')
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
    message: t('schema.project.ending_date_after_starting'),
    path: ['endingDate']
});

export type CreateProjectData = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial().extend({
    id: z.string()
});

export type UpdateProjectData = z.infer<typeof updateProjectSchema>;

export const getCreateProjectDefaultValues = (): CreateProjectData => ({
    name: '',
    description: '',
    category: '',
    location: '',
    status: ProjectStatus.DRAFT,
    priority: ProjectPriority.MEDIUM,
    startingDate: '',
    endingDate: '',
    budget: 0,
    currency: 'RON',
    budgetPlanningDate: '',
    organization: '',
    budgetResponsible: '',
    budgetNotes: '',
    sustainability: ''
});