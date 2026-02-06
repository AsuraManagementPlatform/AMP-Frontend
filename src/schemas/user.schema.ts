import { z } from 'zod';
import { t } from 'i18next';
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
        .min(1, t('schema.user.full_name_required'))
        .min(2, t('schema.user.full_name_min'))
        .max(255, t('schema.user.full_name_max'))
        .regex(NAME_REGEX, t('schema.user.full_name_regex')),

    first_name: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: t('schema.user.first_name_max') }
        ),

    last_name: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: t('schema.user.last_name_max') }
        ),

    email: z
        .string()
        .min(1, t('schema.user.email_required'))
        .email(t('schema.user.email_invalid'))
        .max(255, t('schema.user.email_max')),
    cnp: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value || value.trim() === '') return true;
                return validateCNP(value);
            },
            { message: t('schema.user.cnp_invalid') }
        ),

    personal_numerical_number: z
        .string()
        .min(1, t('schema.user.cnp_required'))
        .length(13, t('schema.user.cnp_length'))
        .regex(/^\d+$/, t('schema.user.cnp_digits_only'))
        .refine(validateCNP, {
            message: t('schema.user.cnp_invalid')
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
                message: t('schema.user.phone_format')
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
            { message: t('schema.user.secondary_phone_format') }
        ),
    address: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 500,
            { message: t('schema.user.address_max') }
        ),

    city: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: t('schema.user.city_max') }
        ),

    county: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: t('schema.user.county_max') }
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
            { message: t('schema.user.postal_code_format') }
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
            { message: t('schema.user.cui_format') }
        ),
    profession: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 200,
            { message: t('schema.user.profession_max') }
        ),

    bio: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 1000,
            { message: t('schema.user.bio_max') }
        ),
    branch: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 100,
            { message: t('schema.user.branch_max') }
        ),
    registration_number: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => !value || value.length <= 50,
            { message: t('schema.user.registration_number_max') }
        ),
    group: z.string().min(1, t('schema.user.group_required')),
    status: z.string().min(1, t('schema.user.status_required')),
    is_active: z.boolean().default(true),
    is_contributor: z.boolean().default(false),
    auto_generate_fees: z.boolean().default(true),
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
        status: UserStatus.DRAFT,
        is_contributor: false,
        auto_generate_fees: true
    };
};
