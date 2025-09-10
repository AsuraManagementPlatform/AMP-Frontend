import { z } from 'zod';

export const createUserSchema = z.object({
    full_name: z.string()
        .min(2, 'Numele complet trebuie să aibă cel puțin 2 caractere')
        .max(100, 'Numele complet nu poate avea mai mult de 100 caractere'),
    
    email: z.string()
        .min(1, 'Email-ul este obligatoriu')
        .refine(
            (email) => email.includes('@') && email.split('@')[1].includes('.'),
            'Email-ul trebuie să conțină simbolul @ și un domeniu valid'
        )
        .email('Adresa de email nu este validă'),
    
    personal_numerical_number: z.string()
        .min(1, 'CNP-ul este obligatoriu')
        .refine(
            (value) => {
                if (!value) return false;
                
                if (!/^\d{13}$/.test(value)) return false;
                
                const firstDigit = parseInt(value[0], 10);
                const year = parseInt(value.substring(1, 3), 10);
                const month = parseInt(value.substring(3, 5), 10);
                const day = parseInt(value.substring(5, 7), 10);
                const countyCode = parseInt(value.substring(7, 9), 10);

                if (firstDigit < 1 || firstDigit > 9) return false;
                
                if (month < 1 || month > 12) return false;
                
                if (countyCode < 1 || countyCode > 52) return false;
                
                let fullYear;
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
                    sum += parseInt(value[i], 10) * weights[i];
                }
                
                let controlDigit = sum % 11;
                if (controlDigit === 10) controlDigit = 1;
                
                return controlDigit === parseInt(value[12], 10);
            },
            'CNP-ul introdus nu este valid conform standardelor românești'
        ),
    
    group: z.string()
        .min(1, 'Vă rugăm să selectați un grup de utilizator'),
    
    phone_number: z.string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) => {
                if (!value) return true;
                
                const cleanNumber = value.replace(/[\s\-\(\)]/g, '');

                return /^(\+\d{1,4}|00\d{1,4}|\d{1,4}|0)\d{6,15}$/.test(cleanNumber);
            },
            'Numărul de telefon nu este valid (ex: +4071111111, +1555123456, 0729669208)'
        ),
    
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING'])
        .default('ACTIVE'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
