import {z} from 'zod';
import {ActivityStatus, ActivityType} from '@/types/activity.types';
import {t} from "i18next";

export const createActivitySchema = z.object({
    project: z.string()
        .min(1, t('schema.activity.project_required')),

    projectObjective: z.string()
        .optional()
        .or(z.literal('')),

    isSubActivity: z.boolean()
        .default(false),

    parentActivity: z.string()
        .optional()
        .or(z.literal('')),

    title: z.string()
        .min(2, t('schema.activity.title_min'))
        .max(255, t('schema.activity.title_max')),

    description: z.string()
        .min(1, t('schema.activity.description_required'))
        .max(511, t('schema.activity.description_max')),

    startingDate: z.string()
        .min(1, t('schema.activity.starting_date_required'))
        .refine(
            (value) => !isNaN(Date.parse(value)),
            t('schema.activity.starting_date_invalid')
        ),

    estimatedEndingDate: z.string()
        .min(1, t('schema.activity.estimated_ending_date_required'))
        .refine(
            (value) => !isNaN(Date.parse(value)),
            t('schema.activity.estimated_ending_date_invalid')
        ),

    endingDate: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            t('schema.activity.ending_date_invalid')
        ),

    status: z.enum([
        ActivityStatus.PLANNED,
        ActivityStatus.IN_PROGRESS,
        ActivityStatus.COMPLETED,
        ActivityStatus.CANCELLED,
        ActivityStatus.POSTPONED
    ], {
        message: t('schema.activity.status_invalid')
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
        message: t('schema.activity.type_invalid')
    }),

    location: z.string()
        .min(1, t('schema.activity.location_required'))
        .max(255, t('schema.activity.location_max')),

    observation: z.string()
        .min(1, t('schema.activity.observation_required'))
        .max(511, t('schema.activity.observation_max')),

    results: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            t('schema.activity.results_max')
        ),

    indicators: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 511,
            t('schema.activity.indicators_max')
        )
}).refine((data) => {
    if (data.startingDate && data.estimatedEndingDate) {
        const startDate = new Date(data.startingDate);
        const endDate = new Date(data.estimatedEndingDate);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
        }
        return endDate >= startDate;
    }
    return true;
}, {
    message: t('schema.activity.estimated_ending_date_after_starting'),
    path: ['estimatedEndingDate']
});

export type CreateActivityData = z.infer<typeof createActivitySchema>;

export const createActivitySchemaWithProjectDates = (projectStartDate?: string, projectEndDate?: string) => {
    const baseSchema = createActivitySchema;
    
    if (!projectStartDate || !projectEndDate) {
        return baseSchema;
    }
    
    return baseSchema
        .refine((data) => {
            if (data.startingDate && projectStartDate) {
                const activityStart = new Date(data.startingDate);
                const projectStart = new Date(projectStartDate);
                return activityStart >= projectStart;
            }
            return true;
        }, {
            message: t('schema.activity.starting_date_before_project'),
            path: ['startingDate']
        })
        .refine((data) => {
            if (data.estimatedEndingDate && projectEndDate) {
                const activityEnd = new Date(data.estimatedEndingDate);
                const projectEnd = new Date(projectEndDate);
                return activityEnd <= projectEnd;
            }
            return true;
        }, {
            message: t('schema.activity.estimated_ending_date_after_project'),
            path: ['estimatedEndingDate']
        });
};

export const updateActivitySchema = createActivitySchema.partial().extend({
    id: z.string()
});

export type UpdateActivityData = z.infer<typeof updateActivitySchema>;

export const updateActivitySchemaWithProjectDates = (projectStartDate?: string, projectEndDate?: string) => {
    const baseSchema = updateActivitySchema;
    
    if (!projectStartDate || !projectEndDate) {
        return baseSchema;
    }
    
    return baseSchema
        .refine((data) => {
            if (data.startingDate && projectStartDate) {
                const activityStart = new Date(data.startingDate);
                const projectStart = new Date(projectStartDate);
                return activityStart >= projectStart;
            }
            return true;
        }, {
            message: t('schema.activity.starting_date_before_project'),
            path: ['startingDate']
        })
        .refine((data) => {
            if (data.estimatedEndingDate && projectEndDate) {
                const activityEnd = new Date(data.estimatedEndingDate);
                const projectEnd = new Date(projectEndDate);
                return activityEnd <= projectEnd;
            }
            return true;
        }, {
            message: t('schema.activity.estimated_ending_date_after_project'),
            path: ['estimatedEndingDate']
        });
};

export const getCreateActivityDefaultValues = (project?: string): CreateActivityData => ({
    project: project || '',
    projectObjective: '',
    isSubActivity: false,
    parentActivity: '',
    title: '',
    description: '',
    startingDate: '',
    estimatedEndingDate: '',
    endingDate: '',
    status: ActivityStatus.PLANNED,
    type: ActivityType.EVENT,
    location: '',
    observation: '',
    results: '',
    indicators: ''
});

export const completeActivitySchema = z.object({
    id: z.uuid(t('schema.activity.id_invalid')),

    project: z.uuid(t('schema.activity.project_invalid')),

    startingDate: z.string(),

    endingDate: z.string()
        .min(1, t('schema.activity.ending_date_required'))
        .refine(
            (value) => !isNaN(Date.parse(value)),
            t('schema.activity.ending_date_invalid')
        ),
}).refine((data) => {
    if (data.startingDate && data.endingDate) {
        const startDate = new Date(data.startingDate);
        const endDate = new Date(data.endingDate);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
        }
        return endDate >= startDate;
    }
    return true;
}, {
    message: t('schema.activity.ending_date_after_starting'),
    path: ['endingDate']
});

export type CompleteActivityData = z.infer<typeof completeActivitySchema>;