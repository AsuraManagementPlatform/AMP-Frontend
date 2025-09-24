import { z } from 'zod';
import { OrganizationStatus } from '@/types/organization.types';

export const createOrganizationSchema = z.object({
    name: z.string()
        .min(2, 'Numele organizației trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Numele organizației nu poate depăși 255 de caractere'),
    
    email: z.string()
        .email('Email-ul nu este valid')
        .min(1, 'Email-ul este obligatoriu'),
    
    phone_number: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                
                const cleanNumber = value.replace(/[\s\-\(\)\.]/g, '');
                return /^(\+\d{1,4}|00\d{1,4}|\d{1,4}|0)\d{6,15}$/.test(cleanNumber);
            },
            'Numărul de telefon nu este valid (ex: +40729669208, 0729669208)'
        ),
    
    unique_code: z.string()
        .min(2, 'Codul unic trebuie să aibă cel puțin 2 caractere')
        .max(50, 'Codul unic nu poate depăși 50 de caractere')
        .regex(/^[A-Z0-9_-]+$/i, 'Codul unic poate conține doar litere, cifre, liniuțe și underscore'),
    
    address: z.string()
        .min(5, 'Adresa trebuie să aibă cel puțin 5 caractere')
        .max(500, 'Adresa nu poate depăși 500 de caractere'),
    
    address2: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 500;
            },
            'Adresa secundară nu poate depăși 500 de caractere'
        ),
    
    status: z.enum([OrganizationStatus.ACTIVE, OrganizationStatus.INACTIVE, OrganizationStatus.PENDING], {
        message: 'Statusul trebuie să fie ACTIVE, INACTIVE sau PENDING'
    }),
    
    admin_user: z.string()
        .min(1, 'Administratorul organizației este obligatoriu')
        .refine(
            (value) => {
                return value !== '';
            },
            'Trebuie să selectați un administrator pentru organizație'
        )
});

export type CreateOrganizationData = z.infer<typeof createOrganizationSchema>;

export const getCreateOrganizationDefaultValues = (preselectedUser?: { id: string } | null): CreateOrganizationData => ({
    name: '',
    email: '',
    phone_number: '',
    unique_code: '',
    address: '',
    address2: '',
    status: OrganizationStatus.ACTIVE,
    admin_user: preselectedUser?.id || ''
});