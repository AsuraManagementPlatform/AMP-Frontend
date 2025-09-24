import { z } from 'zod';
import { EntityType, EntityStatus } from '@/types/entity.types';

const ROMANIAN_PHONE_REGEX = /^(\+40|0)[0-9]{9}$/;

export const createEntitySchema = z.object({
    name: z.string()
        .min(2, 'Numele entității trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Numele entității nu poate depăși 255 de caractere'),
    
    type: z.enum([
        EntityType.DONATOR,
        EntityType.SPONSOR,
        EntityType.PARTNER
    ], {
        message: 'Tipul entității este invalid'
    }),
    
    status: z.enum([
        EntityStatus.ACTIVE,
        EntityStatus.INACTIVE,
        EntityStatus.PENDING,
        EntityStatus.SUSPENDED
    ], {
        message: 'Statusul entității este invalid'
    }),
    
    email: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            'Email-ul nu este valid'
        ),
    
    phoneNumber: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return ROMANIAN_PHONE_REGEX.test(value.replace(/[\s\-\(\)]/g, ''));
            },
            {
                message: 'Numărul de telefon trebuie să fie în format românesc (ex: +40712345678, 0712345678)'
            }
        ),
    
    address: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 500;
            },
            'Adresa nu poate depăși 500 de caractere'
        ),
    
    contactPerson: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 255;
            },
            'Numele persoanei de contact nu poate depăși 255 de caractere'
        ),
    
    website: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return /^https?:\/\/.+/.test(value);
            },
            'Website-ul trebuie să înceapă cu http:// sau https://'
        ),
    
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
    
    organizationId: z.string()
        .min(1, 'ID-ul organizației este obligatoriu'),
    
    userId: z.string()
        .optional()
        .or(z.literal('')),
    
    taxId: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 50;
            },
            'Codul fiscal nu poate depăși 50 de caractere'
        ),
    
    registrationNumber: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 50;
            },
            'Numărul de înregistrare nu poate depăși 50 de caractere'
        )
});

export type CreateEntityData = z.infer<typeof createEntitySchema>;

export const getCreateEntityDefaultValues = (): CreateEntityData => ({
    name: '',
    type: EntityType.DONATOR,
    status: EntityStatus.ACTIVE,
    email: '',
    phoneNumber: '',
    address: '',
    contactPerson: '',
    website: '',
    description: '',
    organizationId: '',
    userId: '',
    taxId: '',
    registrationNumber: ''
});