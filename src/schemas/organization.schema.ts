import { z } from 'zod';
import { OrganizationType, OrganizationStatus } from '@/types/organization.types';

const ROMANIAN_PHONE_REGEX = /^(\+40|0)[0-9]{9}$/;
const CUI_REGEX = /^(RO)?[0-9]{2,10}$/;
const POSTAL_CODE_REGEX = /^[0-9]{6}$/;
const WEBSITE_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

export const createOrganizationSchema = z.object({
    name: z.string()
        .min(2, 'Numele organizației trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Numele organizației nu poate depăși 255 de caractere'),
    
    legal_name: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            { message: 'Numele legal nu poate depăși 255 de caractere' }
        ),
    
    short_name: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 50,
            { message: 'Numele scurt nu poate depăși 50 de caractere' }
        ),
    cui: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return CUI_REGEX.test(value);
            },
            { message: 'CUI-ul trebuie să fie în format valid (ex: RO12345678 sau 12345678)' }
        ),
    
    registration_number: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 50,
            { message: 'Numărul de înregistrare nu poate depăși 50 de caractere' }
        ),
    email: z.string()
        .email('Email-ul nu este valid')
        .min(1, 'Email-ul este obligatoriu'),
    
    phone_number: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return ROMANIAN_PHONE_REGEX.test(value.replace(/[\s\-\(\)]/g, ''));
            },
            { message: 'Numărul de telefon trebuie să fie în format românesc (ex: +40712345678, 0712345678)' }
        ),
    
    secondary_phone: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return ROMANIAN_PHONE_REGEX.test(value.replace(/[\s\-\(\)]/g, ''));
            },
            { message: 'Numărul secundar de telefon trebuie să fie în format românesc' }
        ),
    
    fax_number: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return ROMANIAN_PHONE_REGEX.test(value.replace(/[\s\-\(\)]/g, ''));
            },
            { message: 'Numărul de fax trebuie să fie în format românesc' }
        ),
    
    website: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return WEBSITE_REGEX.test(value);
            },
            { message: 'Website-ul trebuie să fie o adresă URL validă (ex: https://organizatia.ro)' }
        ),
    address: z.string()
        .min(5, 'Adresa trebuie să aibă cel puțin 5 caractere')
        .max(500, 'Adresa nu poate depăși 500 de caractere'),
    
    address2: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 500,
            { message: 'Adresa secundară nu poate depăși 500 de caractere' }
        ),
    
    city: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: 'Orașul nu poate depăși 100 de caractere' }
        ),
    
    county: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: 'Județul nu poate depăși 100 de caractere' }
        ),
    
    postal_code: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return POSTAL_CODE_REGEX.test(value);
            },
            { message: 'Codul poștal trebuie să fie format din 6 cifre' }
        ),
    
    country: z.string()
        .optional()
        .or(z.literal(''))
        .default('Romania'),
    organization_type: z.enum([
        OrganizationType.NGO,
        OrganizationType.ASSOCIATION,
        OrganizationType.FOUNDATION,
        OrganizationType.COMPANY,
        OrganizationType.COOPERATIVE,
        OrganizationType.OTHER
    ], {
        message: 'Tipul organizației trebuie să fie unul din valorile predefinite'
    }).default(OrganizationType.NGO),
    
    industry_sector: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: 'Sectorul de activitate nu poate depăși 100 de caractere' }
        ),
    
    description: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 1000,
            { message: 'Descrierea nu poate depăși 1000 de caractere' }
        ),
    budget: z.number()
        .optional()
        .refine(
            (value) => value === undefined || value >= 0,
            { message: 'Bugetul anual trebuie să fie pozitiv' }
        ),
    
    funding_sources: z.array(z.string())
        .optional()
        .default([]),
    registration_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(value)) return false;
                const date = new Date(value);
                return date instanceof Date && !isNaN(date.getTime());
            },
            { message: 'Data înregistrării trebuie să fie în format valid (YYYY-MM-DD)' }
        ),
    
    tax_exempt_status: z.boolean()
        .optional()
        .default(false),
    
    tax_percentage: z.number()
        .optional()
        .refine(
            (value) => value === undefined || value === null || (value >= 0 && value <= 1),
            { message: 'Procentul TVA trebuie să fie între 0 și 1 (ex: 0.19 pentru 19%)' }
        ),
    
    employee_count: z.number()
        .optional()
        .refine(
            (value) => value === undefined || (value >= 0 && Number.isInteger(value)),
            { message: 'Numărul de angajați trebuie să fie un număr întreg pozitiv' }
        ),
    
    volunteer_count: z.number()
        .optional()
        .refine(
            (value) => value === undefined || (value >= 0 && Number.isInteger(value)),
            { message: 'Numărul de voluntari trebuie să fie un număr întreg pozitiv' }
        ),
    
    member_count: z.number()
        .optional()
        .refine(
            (value) => value === undefined || (value >= 0 && Number.isInteger(value)),
            { message: 'Numărul de membri trebuie să fie un număr întreg pozitiv' }
        ),
    status: z.enum([OrganizationStatus.ACTIVE, OrganizationStatus.INACTIVE, OrganizationStatus.PENDING], {
        message: 'Statusul trebuie să fie ACTIVE, INACTIVE sau PENDING'
    }),
    
    admin_user: z.string()
        .min(1, 'Administratorul organizației este obligatoriu')
        .refine(
            (value) => value !== '',
            { message: 'Trebuie să selectați un administrator pentru organizație' }
        ),
    
    is_verified: z.boolean()
        .optional()
        .default(false),
    social_media_links: z.record(z.string(), z.string())
        .optional()
        .default({})
});

export type CreateOrganizationData = z.infer<typeof createOrganizationSchema>;
export const updateOrganizationSchema = z.object({
    name: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || (value.length >= 2 && value.length <= 255),
            { message: 'Numele organizației trebuie să aibă între 2 și 255 caractere' }
        ),
    
    legal_name: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 255,
            { message: 'Numele legal nu poate depăși 255 de caractere' }
        ),
    
    short_name: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 50,
            { message: 'Numele scurt nu poate depăși 50 de caractere' }
        ),
    cui: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return CUI_REGEX.test(value);
            },
            { message: 'CUI-ul trebuie să fie în format valid (ex: RO12345678 sau 12345678)' }
        ),
    
    registration_number: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 50,
            { message: 'Numărul de înregistrare nu poate depăși 50 de caractere' }
        ),
    email: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return z.string().email().safeParse(value).success;
            },
            { message: 'Email-ul nu este valid' }
        ),
    
    phone_number: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return ROMANIAN_PHONE_REGEX.test(value.replace(/[\s\-\(\)]/g, ''));
            },
            { message: 'Numărul de telefon trebuie să fie în format românesc (ex: +40712345678, 0712345678)' }
        ),
    
    secondary_phone: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return ROMANIAN_PHONE_REGEX.test(value.replace(/[\s\-\(\)]/g, ''));
            },
            { message: 'Numărul secundar de telefon trebuie să fie în format românesc' }
        ),
    
    fax_number: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return ROMANIAN_PHONE_REGEX.test(value.replace(/[\s\-\(\)]/g, ''));
            },
            { message: 'Numărul de fax trebuie să fie în format românesc' }
        ),
    
    website: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return WEBSITE_REGEX.test(value);
            },
            { message: 'Website-ul trebuie să fie o adresă URL validă (ex: https://organizatia.ro)' }
        ),
    address: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || (value.length >= 5 && value.length <= 500),
            { message: 'Adresa trebuie să aibă între 5 și 500 caractere' }
        ),
    
    address2: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 500,
            { message: 'Adresa secundară nu poate depăși 500 de caractere' }
        ),
    
    city: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: 'Orașul nu poate depăși 100 de caractere' }
        ),
    
    county: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: 'Județul nu poate depăși 100 de caractere' }
        ),
    
    postal_code: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return POSTAL_CODE_REGEX.test(value);
            },
            { message: 'Codul poștal trebuie să fie format din 6 cifre' }
        ),
    
    country: z.string()
        .optional()
        .or(z.literal('')),
    organization_type: z.enum([
        OrganizationType.NGO,
        OrganizationType.ASSOCIATION,
        OrganizationType.FOUNDATION,
        OrganizationType.COMPANY,
        OrganizationType.COOPERATIVE,
        OrganizationType.OTHER
    ], {
        message: 'Tipul organizației trebuie să fie unul din valorile predefinite'
    }).optional(),
    
    industry_sector: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: 'Sectorul de activitate nu poate depăși 100 de caractere' }
        ),
    
    description: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 1000,
            { message: 'Descrierea nu poate depăși 1000 de caractere' }
        ),
    budget: z.number()
        .optional()
        .refine(
            (value) => value === undefined || value >= 0,
            { message: 'Bugetul anual trebuie să fie pozitiv' }
        ),
    
    funding_sources: z.array(z.string())
        .optional(),
    registration_date: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(value)) return false;
                const date = new Date(value);
                return date instanceof Date && !isNaN(date.getTime());
            },
            { message: 'Data înregistrării trebuie să fie în format valid (YYYY-MM-DD)' }
        ),
    
    tax_exempt_status: z.boolean()
        .optional(),
    employee_count: z.number()
        .optional()
        .refine(
            (value) => value === undefined || (value >= 0 && Number.isInteger(value)),
            { message: 'Numărul de angajați trebuie să fie un număr întreg pozitiv' }
        ),
    
    volunteer_count: z.number()
        .optional()
        .refine(
            (value) => value === undefined || (value >= 0 && Number.isInteger(value)),
            { message: 'Numărul de voluntari trebuie să fie un număr întreg pozitiv' }
        ),
    
    member_count: z.number()
        .optional()
        .refine(
            (value) => value === undefined || (value >= 0 && Number.isInteger(value)),
            { message: 'Numărul de membri trebuie să fie un număr întreg pozitiv' }
        ),
    status: z.enum([OrganizationStatus.ACTIVE, OrganizationStatus.INACTIVE, OrganizationStatus.PENDING], {
        message: 'Statusul trebuie să fie ACTIVE, INACTIVE sau PENDING'
    }).optional(),
    
    admin_user: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value !== '',
            { message: 'Administratorul organizației nu poate fi gol dacă este specificat' }
        ),
    
    is_verified: z.boolean()
        .optional(),
    social_media_links: z.record(z.string(), z.string())
        .optional()
});

export type UpdateOrganizationData = z.infer<typeof updateOrganizationSchema>;

export const getCreateOrganizationDefaultValues = (preselectedUser?: { id: string; company_name?: string; company_number?: string } | null): CreateOrganizationData => ({
    name: preselectedUser?.company_name || '',
    legal_name: preselectedUser?.company_name || '',
    short_name: '',
    cui: preselectedUser?.company_number || '',
    registration_number: '',
    email: '',
    phone_number: '',
    secondary_phone: '',
    fax_number: '',
    website: '',
    address: '',
    address2: '',
    city: '',
    county: '',
    postal_code: '',
    country: 'Romania',
    organization_type: OrganizationType.NGO,
    industry_sector: '',
    description: '',
    budget: undefined,
    funding_sources: [],
    tax_exempt_status: false,
    employee_count: undefined,
    volunteer_count: undefined,
    member_count: undefined,
    status: OrganizationStatus.ACTIVE,
    admin_user: preselectedUser?.id || '',
    is_verified: false,
    social_media_links: {}
});
