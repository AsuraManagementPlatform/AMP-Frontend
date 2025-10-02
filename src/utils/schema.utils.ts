import { z } from 'zod';

/**
 * Creates a reusable number field preprocessor for form schemas
 * Handles string-to-number conversion for form inputs while maintaining type safety
 * 
 * @param options - Configuration options for the number field
 * @param options.min - Minimum allowed value (default: 0)
 * @param options.required - Whether the field is required (default: false)
 * @param options.errorMessage - Custom error message for invalid numbers
 * @returns Zod schema with preprocessing for number conversion
 */
export const createNumberField = (options: {
    min?: number;
    max?: number;
    required?: boolean;
    errorMessage?: string;
} = {}) => {
    const {
        min = 0,
        max,
        required = false,
        errorMessage = 'Trebuie să fie un număr valid'
    } = options;

    const preprocessor = (value: unknown) => {
        if (value === '' || value === null || value === undefined) {
            return required ? undefined : undefined;
        }
        const parsed = Number(value);
        return isNaN(parsed) ? value : parsed;
    };

    let baseSchema = z.number({
        message: errorMessage
    });

    if (min !== undefined) {
        baseSchema = baseSchema.min(min, `Valoarea trebuie să fie cel puțin ${min}`);
    }

    if (max !== undefined) {
        baseSchema = baseSchema.max(max, `Valoarea nu poate depăși ${max}`);
    }

    const finalSchema = required ? baseSchema : baseSchema.optional();

    return z.preprocess(preprocessor, finalSchema);
};

/**
 * Creates a positive number field for amounts, budgets, etc.
 */
export const createAmountField = (options: {
    required?: boolean;
    max?: number;
    errorMessage?: string;
} = {}) => {
    return createNumberField({
        min: 0,
        ...options,
        errorMessage: options.errorMessage || 'Suma trebuie să fie un număr pozitiv'
    });
};

/**
 * Creates a currency amount field (positive with 2 decimal precision)
 */
export const createCurrencyField = (options: {
    required?: boolean;
    max?: number;
} = {}) => {
    const preprocessor = (value: unknown) => {
        if (value === '' || value === null || value === undefined) {
            return options.required ? undefined : undefined;
        }
        const parsed = Number(value);
        if (isNaN(parsed)) return value;
        return Math.round(parsed * 100) / 100;
    };

    let baseSchema = z.number({
        message: 'Suma trebuie să fie un număr valid'
    }).min(0, 'Suma trebuie să fie pozitivă');

    if (options.max !== undefined) {
        baseSchema = baseSchema.max(options.max, `Suma nu poate depăși ${options.max}`);
    }

    const finalSchema = options.required ? baseSchema : baseSchema.optional();

    return z.preprocess(preprocessor, finalSchema);
};
