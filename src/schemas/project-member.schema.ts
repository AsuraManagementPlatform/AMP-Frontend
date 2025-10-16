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
        .min(2, 'Rolul trebuie s─â aib─â cel pu╚¢in 2 caractere')
        .max(255, 'Rolul nu poate dep─â╚Öi 255 de caractere'),

    added_to_project: z.string()
        .min(1, 'Data ad─âug─ârii este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data ad─âug─ârii nu este valid─â'
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
            'Num─ârul contractului nu poate dep─â╚Öi 255 de caractere'
        ),

    active_from: z.string()
        .min(1, 'Data de ├«nceput este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data de ├«nceput nu este valid─â'
        ),

    active_to: z.string()
        .min(1, 'Data de sf├ór╚Öit este obligatorie')
        .refine(
            (value) => !isNaN(Date.parse(value)),
            'Data de sf├ór╚Öit nu este valid─â'
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
    message: 'Data de sf├ór╚Öit trebuie s─â fie dup─â data de ├«nceput',
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
            'Rolul trebuie s─â aib─â ├«ntre 2 ╚Öi 255 caractere'
        ),

    added_to_project: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data ad─âug─ârii nu este valid─â'
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
            'Num─ârul contractului nu poate dep─â╚Öi 255 de caractere'
        ),

    active_from: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data de ├«nceput nu este valid─â'
        ),

    active_to: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || !isNaN(Date.parse(value)),
            'Data de sf├ór╚Öit nu este valid─â'
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
    message: 'Data de sf├ór╚Öit trebuie s─â fie dup─â data de ├«nceput',
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
