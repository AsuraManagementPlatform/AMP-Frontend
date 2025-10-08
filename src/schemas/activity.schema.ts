import { z } from 'zod';
import { ActivityStatus, ActivityType } from '@/types/activity.types';

export const createActivitySchema = z.object({
    project: z.string()
        .min(1, 'Proiectul este obligatoriu'),

    project_objective: z.string()
        .optional()
        .or(z.literal('')),

    title: z.string()
        .min(2, 'Titlul trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Titlul nu poate depăși 255 de caractere'),

    description: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            'Descrierea nu poate depăși 511 caractere'
        ),

    starting_date: z.string()
        .min(1, 'Data de început este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data de început nu este validă'
        ),

    estimated_ending_date: z.string()
        .min(1, 'Data estimată de sfârșit este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data estimată de sfârșit nu este validă'
        ),

    ending_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data de sfârșit nu este validă'
        ),

    status: z.enum([
        ActivityStatus.PLANNED,
        ActivityStatus.IN_PROGRESS,
        ActivityStatus.COMPLETED,
        ActivityStatus.CANCELLED,
        ActivityStatus.POSTPONED
    ], {
        message: 'Statusul activității este invalid'
    }).default(ActivityStatus.PLANNED),

    type: z.enum([
        ActivityType.MEETING,
        ActivityType.WORKSHOP,
        ActivityType.TRAINING,
        ActivityType.CONFERENCE,
        ActivityType.PRESENTATION,
        ActivityType.EVENT,
        ActivityType.TASK,
        ActivityType.MILESTONE,
        ActivityType.REVIEW,
        ActivityType.OTHER
    ], {
        message: 'Tipul activității este invalid'
    }),

    location: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            'Locația nu poate depăși 255 de caractere'
        ),

    observation: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            'Observația nu poate depăși 511 caractere'
        ),

    results: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            'Rezultatele nu pot depăși 511 caractere'
        ),

    indicators: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            'Indicatorii nu pot depăși 511 caractere'
        )
}).refine((data) => {
    if (data.starting_date && data.estimated_ending_date) {
        const startDate = new Date(data.starting_date);
        const endDate = new Date(data.estimated_ending_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
        }
        return endDate > startDate;
    }
    return true;
}, {
    message: 'Data estimată de sfârșit trebuie să fie după data de început',
    path: ['estimated_ending_date']
});

export type CreateActivityData = z.infer<typeof createActivitySchema>;

export const updateActivitySchema = z.object({
    project: z.string()
        .optional()
        .or(z.literal('')),

    project_objective: z.string()
        .optional()
        .or(z.literal('')),

    title: z.string()
        .optional()
        .refine(
            (value) => !value || (value.length >= 2 && value.length <= 255),
            'Titlul trebuie să aibă între 2 și 255 caractere'
        ),

    description: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            'Descrierea nu poate depăși 511 caractere'
        ),

    starting_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data de început nu este validă'
        ),

    estimated_ending_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data estimată de sfârșit nu este validă'
        ),

    ending_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data de sfârșit nu este validă'
        ),

    status: z.enum([
        ActivityStatus.PLANNED,
        ActivityStatus.IN_PROGRESS,
        ActivityStatus.COMPLETED,
        ActivityStatus.CANCELLED,
        ActivityStatus.POSTPONED
    ], {
        message: 'Statusul activității este invalid'
    }).optional(),

    type: z.enum([
        ActivityType.MEETING,
        ActivityType.WORKSHOP,
        ActivityType.TRAINING,
        ActivityType.CONFERENCE,
        ActivityType.PRESENTATION,
        ActivityType.EVENT,
        ActivityType.TASK,
        ActivityType.MILESTONE,
        ActivityType.REVIEW,
        ActivityType.OTHER
    ], {
        message: 'Tipul activității este invalid'
    }).optional(),

    location: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            'Locația nu poate depăși 255 de caractere'
        ),

    observation: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            'Observația nu poate depăși 511 caractere'
        ),

    results: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            'Rezultatele nu pot depăși 511 caractere'
        ),

    indicators: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            'Indicatorii nu pot depăși 511 caractere'
        )
}).refine((data) => {
    if (data.starting_date && data.estimated_ending_date) {
        const startDate = new Date(data.starting_date);
        const endDate = new Date(data.estimated_ending_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return true;
        }
        return endDate > startDate;
    }
    return true;
}, {
    message: 'Data estimată de sfârșit trebuie să fie după data de început',
    path: ['estimated_ending_date']
});

export type UpdateActivityData = z.infer<typeof updateActivitySchema>;

export const getCreateActivityDefaultValues = (projectId?: string): CreateActivityData => ({
    project: projectId || '',
    project_objective: '',
    title: '',
    description: '',
    starting_date: '',
    estimated_ending_date: '',
    ending_date: '',
    status: ActivityStatus.PLANNED,
    type: ActivityType.EVENT,
    location: '',
    observation: '',
    results: '',
    indicators: ''
});