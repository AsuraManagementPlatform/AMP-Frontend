import { z } from 'zod';
import { ActivityStatus, ActivityType } from '@/types/activity.types';

export const createActivitySchema = z.object({
    title: z.string()
        .min(2, 'Titlul activității trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Titlul activității nu poate depăși 255 de caractere'),
    
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
    
    startDate: z.string()
        .min(1, 'Data de început este obligatorie')
        .refine(
            (value) => {
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
    
    projectId: z.string()
        .min(1, 'ID-ul proiectului este obligatoriu'),
    
    assignedTo: z.array(z.string())
        .optional(),
    
    estimatedHours: z.number()
        .optional()
        .refine(
            (value) => {
                if (value === undefined) return true;
                return value > 0;
            },
            'Orele estimate trebuie să fie un număr pozitiv'
        ),
    
    notes: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 500;
            },
            'Notele nu pot depăși 500 de caractere'
        )
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, {
    message: 'Data de sfârșit trebuie să fie după data de început',
    path: ['endDate']
});

export type CreateActivityData = z.infer<typeof createActivitySchema>;

export const getCreateActivityDefaultValues = (): CreateActivityData => ({
    title: '',
    description: '',
    type: ActivityType.TASK,
    status: ActivityStatus.PLANNED,
    startDate: '',
    endDate: '',
    location: '',
    projectId: '',
    assignedTo: [],
    estimatedHours: undefined,
    notes: ''
});