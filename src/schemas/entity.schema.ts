import {z} from 'zod';
import {EntityStatus, EntityType, LegalType} from '@/types/entity.types';

const ROMANIAN_PHONE_REGEX = /^(\+40|0)[0-9]{9}$/;

export const createEntitySchema = z.object({
    organization: z.string().min(1),

    legalType: z.enum([
        LegalType.FIZICA,
        LegalType.JURIDICA
    ], {
        message: 'Tipul legal este obligatoriu'
    }),
    
    name: z.string()
        .min(2, 'Numele entității trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Numele entității nu poate depăși 255 de caractere'),
    
    identificationNumber: z.string()
        .min(1, 'CNP/CUI este obligatoriu')
        .max(255, 'CNP/CUI nu poate depăși 255 de caractere'),
    
    email: z.string()
        .email('Email-ul nu este valid'),
    
    phone: z.string()
        .refine(
            (value) => ROMANIAN_PHONE_REGEX.test(value.replace(/[\s\-\(\)]/g, '')),
            {
                message: 'Numărul de telefon trebuie să fie în format românesc (ex: +40712345678, 0712345678)'
            }
        ),
    
    address: z.string()
        .min(1, 'Adresa este obligatorie')
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
    
    type: z.enum([
        EntityType.DONOR,
        EntityType.SPONSOR,
        EntityType.PARTNER,
        EntityType.VOLUNTEER,
        EntityType.BENEFICIARY,
        EntityType.OTHER
    ], {
        message: 'Tipul entității este invalid'
    }),
    
    status: z.enum([
        EntityStatus.ACTIV,
        EntityStatus.INACTIV,
        EntityStatus.POTENTIAL,
        EntityStatus.BLOCAT
    ], {
        message: 'Statusul entității este invalid'
    }).optional(),
    
    observation: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                return value.length <= 511;
            },
            'Observația nu poate depăși 511 caractere'
        ),
});

export type CreateEntityData = z.infer<typeof createEntitySchema>;

export const updateEntitySchema = createEntitySchema.partial().extend({
    id: z.string()
});

export type UpdateEntityData = z.infer<typeof updateEntitySchema>;


export const getCreateEntityDefaultValues = (organization: string): CreateEntityData => ({
    organization: organization,
    legalType: LegalType.FIZICA,
    name: '',
    identificationNumber: '',
    email: '',
    phone: '',
    address: '',
    address2: '',
    type: EntityType.DONOR,
    status: EntityStatus.ACTIV,
    observation: '',
});
