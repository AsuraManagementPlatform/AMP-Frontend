import { z } from 'zod';
import { UserStatus } from "@/types/user.types.ts";
import {UserGroup} from "@/types/auth.types.ts";

const ROMANIAN_PHONE_REGEX = /^(\+40|0)[0-9]{9}$/;
const NAME_REGEX = /^[a-zA-ZăâîțșĂÂÎȚȘ\s-'\.]+$/;
const CUI_REGEX = /^(RO)?[0-9]{2,10}$/;
const POSTAL_CODE_REGEX = /^[0-9]{6}$/;

const validateCNP = (cnp: string): boolean => {
    if (!/^\d{13}$/.test(cnp)) return false;

    const firstDigit = parseInt(cnp[0], 10);
    if (firstDigit < 1 || firstDigit > 9) return false;

    const year = parseInt(cnp.substring(1, 3), 10);
    const month = parseInt(cnp.substring(3, 5), 10);
    const day = parseInt(cnp.substring(5, 7), 10);
    const countyCode = parseInt(cnp.substring(7, 9), 10);

    if (month < 1 || month > 12) return false;
    if (countyCode < 1 || countyCode > 52) return false;

    let fullYear: number;
    if (firstDigit === 1 || firstDigit === 2) {
        fullYear = 1900 + year;
    } else if (firstDigit === 3 || firstDigit === 4) {
        fullYear = 1800 + year;
    } else if (firstDigit === 5 || firstDigit === 6) {
        fullYear = 2000 + year;
    } else {
        fullYear = 1900 + year;
    }

    const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((fullYear % 4 === 0 && fullYear % 100 !== 0) || fullYear % 400 === 0) {
        daysInMonth[2] = 29;
    }

    if (day < 1 || day > daysInMonth[month]) return false;

    const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cnp[i], 10) * weights[i];
    }

    let controlDigit = sum % 11;
    if (controlDigit === 10) controlDigit = 1;

    return controlDigit === parseInt(cnp[12], 10);
};
export const createUserSchema = z.object({
    full_name: z
        .string()
        .min(1, 'Numele complet este obligatoriu')
        .min(2, 'Numele complet trebuie să aibă cel puțin 2 caractere')
        .max(255, 'Numele complet nu poate avea mai mult de 255 caractere')
        .regex(NAME_REGEX, 'Numele poate conține doar litere, spații, apostrofuri și cratime'),

    first_name: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: 'Prenumele nu poate avea mai mult de 100 caractere' }
        ),

    last_name: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: 'Numele de familie nu poate avea mai mult de 100 caractere' }
        ),

    email: z
        .string()
        .min(1, 'Email-ul este obligatoriu')
        .email('Adresa de email nu este validă')
        .max(255, 'Email-ul nu poate avea mai mult de 255 caractere'),
    cnp: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return validateCNP(value);
            },
            { message: 'CNP-ul introdus nu este valid conform standardelor românești' }
        ),

    personal_numerical_number: z
        .string()
        .min(1, 'CNP-ul este obligatoriu')
        .length(13, 'CNP-ul trebuie să aibă exact 13 cifre')
        .regex(/^\d+$/, 'CNP-ul poate conține doar cifre')
        .refine(validateCNP, {
            message: 'CNP-ul introdus nu este valid conform standardelor românești'
        }),
    phone_number: z
        .string()
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

    secondary_phone: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return ROMANIAN_PHONE_REGEX.test(value.replace(/[\s\-\(\)]/g, ''));
            },
            { message: 'Numărul secundar de telefon trebuie să fie în format românesc' }
        ),
    address: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 500,
            { message: 'Adresa nu poate avea mai mult de 500 caractere' }
        ),

    city: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: 'Orașul nu poate avea mai mult de 100 caractere' }
        ),

    county: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: 'Județul nu poate avea mai mult de 100 caractere' }
        ),

    postal_code: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return POSTAL_CODE_REGEX.test(value);
            },
            { message: 'Codul poștal trebuie să fie format din 6 cifre' }
        ),

    country: z
        .string()
        .optional()
        .or(z.literal(''))
        .default('Romania'),
    isLegalEntity: z.boolean().default(false),

    company_number: z
        .string()
        .optional()
        .or(z.literal('')),

    company_name: z
        .string()
        .optional()
        .or(z.literal('')),

    cui: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return CUI_REGEX.test(value);
            },
            { message: 'CUI-ul trebuie să fie în format valid (ex: RO12345678 sau 12345678)' }
        ),
    profession: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 200,
            { message: 'Profesia nu poate avea mai mult de 200 caractere' }
        ),

    bio: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 1000,
            { message: 'Biografia nu poate avea mai mult de 1000 caractere' }
        ),
    group: z.string().min(1, 'Grupul utilizator este obligatoriu'),
    status: z.string().min(1, 'Statusul este obligatoriu'),
    is_active: z.boolean().default(true),
});

export type UserCreateRequest = z.infer<typeof createUserSchema>;

export const getCreateUserDefaultValues = (isAdmin: boolean, isOrgAdmin: boolean = false): Partial<UserCreateRequest> => {
    let defaultGroup = '';
    if (isAdmin) {
        defaultGroup = UserGroup.ORGANIZATION_ADMIN;
    } else if (isOrgAdmin) {
        defaultGroup = UserGroup.EMPLOYEE;
    }
    
    return {
        full_name: '',
        email: '',
        personal_numerical_number: '',
        phone_number: '',
        isLegalEntity: false,
        company_number: '',
        company_name: '',
        group: defaultGroup,
        status: UserStatus.DRAFT
    };
};
