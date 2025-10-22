import {z} from 'zod';
import {DocumentType} from '@/types/organization-document.types';

export const DOCUMENT_TYPES = Object.values(DocumentType);

export const createOrganizationDocumentSchema = z.object({
    organization: z.string()
        .min(1, 'Organizația este obligatorie'),

    name: z.string()
        .min(2, 'Numele trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Numele nu poate depăși 255 de caractere'),

    document_type: z.enum(DOCUMENT_TYPES as [string, ...string[]], {
        message: 'Tipul de document selectat nu este valid'
    }),

    description: z.string()
        .max(1000, 'Descrierea nu poate depăși 1000 de caractere')
        .optional()
        .or(z.literal('')),

    document_number: z.string()
        .max(100, 'Numărul documentului nu poate depăși 100 de caractere')
        .optional()
        .or(z.literal('')),

    issue_date: z.string()
        .optional()
        .or(z.literal('')),

    expiry_date: z.string()
        .optional()
        .or(z.literal('')),

    issued_by: z.string()
        .max(255, 'Emitentul nu poate depăși 255 de caractere')
        .optional()
        .or(z.literal('')),

    notes: z.string()
        .max(1000, 'Notele nu pot depăși 1000 de caractere')
        .optional()
        .or(z.literal('')),

    is_active: z.union([z.boolean(), z.string()])
        .transform((value) => {
            if (typeof value === 'string') {
                return value === 'true';
            }
            return value;
        })
        .default(true)
});

export type CreateOrganizationDocumentData = z.infer<typeof createOrganizationDocumentSchema>;

export const updateOrganizationDocumentSchema = z.object({
    organization: z.string()
        .optional()
        .or(z.literal('')),

    name: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || (value.length >= 2 && value.length <= 255),
            'Numele trebuie să aibă între 2 și 255 caractere'
        ),

    document_type: z.enum(DOCUMENT_TYPES as [string, ...string[]], {
        message: 'Tipul de document selectat nu este valid'
    }).optional(),

    description: z.string()
        .max(1000, 'Descrierea nu poate depăși 1000 de caractere')
        .optional()
        .or(z.literal('')),

    document_number: z.string()
        .max(100, 'Numărul documentului nu poate depăși 100 de caractere')
        .optional()
        .or(z.literal('')),

    issue_date: z.string()
        .optional()
        .or(z.literal('')),

    expiry_date: z.string()
        .optional()
        .or(z.literal('')),

    issued_by: z.string()
        .max(255, 'Emitentul nu poate depăși 255 de caractere')
        .optional()
        .or(z.literal('')),

    notes: z.string()
        .max(1000, 'Notele nu pot depăși 1000 de caractere')
        .optional()
        .or(z.literal('')),

    is_active: z.union([z.boolean(), z.string()])
        .optional()
        .transform((value) => {
            if (value === undefined || value === null) {
                return undefined;
            }
            if (typeof value === 'string') {
                return value === 'true';
            }
            return value;
        })
});

export type UpdateOrganizationDocumentData = z.infer<typeof updateOrganizationDocumentSchema>;

export const getCreateOrganizationDocumentDefaultValues = (organizationId?: string): CreateOrganizationDocumentData => ({
    organization: organizationId || '',
    name: '',
    document_type: DocumentType.OTHER,
    description: '',
    document_number: '',
    issue_date: '',
    expiry_date: '',
    issued_by: '',
    notes: '',
    is_active: 'true' as any
});
