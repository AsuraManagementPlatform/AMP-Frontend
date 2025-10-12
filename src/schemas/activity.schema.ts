import { z } from 'zod';
import { ActivityStatus, ActivityType } from '@/types/activity.types';

export const createActivitySchema = z.object({
    project: z.string()
        .min(1, 'ID-ul proiectului este obligatoriu'),
    
    project_objective: z.string()
        .optional()
        .or(z.literal('')),
    
    title: z.string()
        .min(2, 'Titlul activității trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Titlul activității nu poate depăși 255 de caractere'),
    
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
    
    type: z.enum([
        ActivityType.MEETING,
        ActivityType.WORKSHOP,
        ActivityType.EVENT,
        ActivityType.TASK,
        ActivityType.MILESTONE,
        ActivityType.REVIEW
    ], {
        message: 'Tipul activității este invalid'
    }),
    
    status: z.enum([
        ActivityStatus.PLANNED,
        ActivityStatus.IN_PROGRESS,
        ActivityStatus.COMPLETED,
        ActivityStatus.CANCELLED,
        ActivityStatus.POSTPONED
    ], {
        message: 'Statusul activității este invalid'
    }),
    
    starting_date: z.string()
        .min(1, 'Data de început este obligatorie')
        .refine(
            (value) => {
                return !isNaN(Date.parse(value));
            },
            'Data de început nu este validă'
        ),
    
    estimated_ending_date: z.string()
        .min(1, 'Data estimată de sfârșit este obligatorie')
        .refine(
            (value) => {
                return !isNaN(Date.parse(value));
            },
            'Data estimată de sfârșit nu este validă'
        ),
    
    ending_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return !isNaN(Date.parse(value));
            },
            'Data de sfârșit nu este validă'
        ),
    
    location: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 255;
            },
            'Locația nu poate depăși 255 de caractere'
        ),
    
    observation: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 511;
            },
            'Observațiile nu pot depăși 511 caractere'
        )
}).refine((data) => {
    if (data.starting_date && data.ending_date) {
        return new Date(data.starting_date) <= new Date(data.ending_date);
    }
    return true;
}, {
    message: 'Data de sfârșit trebuie să fie după data de început',
    path: ['ending_date']
});

export type CreateActivityData = z.infer<typeof createActivitySchema>;

export const updateActivitySchema = createActivitySchema.partial().extend({
    id: z.string().optional()
});

export type UpdateActivityData = z.infer<typeof updateActivitySchema>;

export const getCreateActivityDefaultValues = (): CreateActivityData => ({
    project: '',
    project_objective: '',
    title: '',
    description: '',
    type: ActivityType.TASK,
    status: ActivityStatus.PLANNED,
    starting_date: '',
    estimated_ending_date: '',
    ending_date: '',
    location: '',
    observation: ''
});