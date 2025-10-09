import { z } from 'zod';
import { ProjectMemberStatus, ProjectMemberType } from '@/types/project-member.types';

export const PROJECT_MEMBER_STATUSES = Object.values(ProjectMemberStatus);
export const PROJECT_MEMBER_TYPES = Object.values(ProjectMemberType);

export const createProjectMemberSchema = z.object({
    project: z.string()
        .min(1, 'Proiectul este obligatoriu'),

    member: z.string()
        .min(1, 'Membrul este obligatoriu'),

    user_role: z.string()
        .min(2, 'Rolul trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Rolul nu poate depăși 255 de caractere'),

    added_to_project: z.string()
        .min(1, 'Data adăugării este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data adăugării nu este validă'
        ),

    status: z.enum(PROJECT_MEMBER_STATUSES as [string, ...string[]], {
        message: 'Statusul selectat nu este valid'
    }).default(ProjectMemberStatus.ACTIVE),

    type: z.enum(PROJECT_MEMBER_TYPES as [string, ...string[]], {
        message: 'Tipul selectat nu este valid'
    }),

    contractual_document_number: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            'Numărul contractului nu poate depăși 255 de caractere'
        ),

    active_from: z.string()
        .min(1, 'Data de început este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data de început nu este validă'
        ),

    active_to: z.string()
        .min(1, 'Data de sfârșit este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data de sfârșit nu este validă'
        )
}).refine((data) => {
    if (data.active_from && data.active_to) {
        const fromDate = new Date(data.active_from);
        const toDate = new Date(data.active_to);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return false;
        }
        return toDate > fromDate;
    }
    return true;
}, {
    message: 'Data de sfârșit trebuie să fie după data de început',
    path: ['active_to']
});

export type CreateProjectMemberData = z.infer<typeof createProjectMemberSchema>;

export const updateProjectMemberSchema = z.object({
    project: z.string()
        .optional()
        .or(z.literal('')),

    member: z.string()
        .optional()
        .or(z.literal('')),

    user_role: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || (value.length >= 2 && value.length <= 255),
            'Rolul trebuie să aibă între 2 și 255 caractere'
        ),

    added_to_project: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data adăugării nu este validă'
        ),

    status: z.enum(PROJECT_MEMBER_STATUSES as [string, ...string[]], {
        message: 'Statusul selectat nu este valid'
    }).optional(),

    type: z.enum(PROJECT_MEMBER_TYPES as [string, ...string[]], {
        message: 'Tipul selectat nu este valid'
    }).optional(),

    contractual_document_number: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            'Numărul contractului nu poate depăși 255 de caractere'
        ),

    active_from: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data de început nu este validă'
        ),

    active_to: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data de sfârșit nu este validă'
        )
}).refine((data) => {
    if (data.active_from && data.active_to) {
        const fromDate = new Date(data.active_from);
        const toDate = new Date(data.active_to);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            return true;
        }
        return toDate > fromDate;
    }
    return true;
}, {
    message: 'Data de sfârșit trebuie să fie după data de început',
    path: ['active_to']
});

export type UpdateProjectMemberData = z.infer<typeof updateProjectMemberSchema>;

export const getCreateProjectMemberDefaultValues = (projectId?: string): CreateProjectMemberData => ({
    project: projectId || '',
    member: '',
    user_role: '',
    added_to_project: new Date().toISOString().split('T')[0],
    status: ProjectMemberStatus.ACTIVE,
    type: ProjectMemberType.EMPLOYEE,
    contractual_document_number: '',
    active_from: new Date().toISOString().split('T')[0],
    active_to: ''
});