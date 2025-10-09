import { z } from 'zod';

export const createEventSchema = z.object({
    title: z.string()
        .min(1, 'Titlul este obligatoriu')
        .max(200, 'Titlul nu poate depăși 200 de caractere'),
    description: z.string()
        .max(1000, 'Descrierea nu poate depăși 1000 de caractere')
        .optional(),
    start_date: z.string()
        .min(1, 'Data de început este obligatorie'),
    end_date: z.string()
        .min(1, 'Data de sfârșit este obligatorie'),
    event_type: z.enum(['CALENDAR_NOTE', 'VOTE_SCHEDULING', 'MEETING', 'EVENT', 'ADMIN_NOTIFICATION']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    location: z.string()
        .max(200, 'Locația nu poate depăși 200 de caractere')
        .optional(),
    attendees: z.array(z.string().email('Email invalid')).optional(),
    all_day: z.boolean(),
    is_recurring: z.boolean().optional(),
    recurrence_pattern: z.enum(['NONE', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY']).optional(),
    recurrence_duration_months: z.number()
        .int('Durata trebuie să fie un număr întreg de luni')
        .min(1, 'Durata trebuie să fie cel puțin 1 lună')
        .max(120, 'Durata nu poate depăși 120 luni (10 ani)')
        .nullable()
        .optional(),
    reminder_minutes: z.number()
        .int('Numărul de minute trebuie să fie întreg')
        .min(0, 'Numărul de minute trebuie să fie pozitiv')
        .max(10080, 'Numărul de minute nu poate depăși 1 săptămână')
        .optional(),
    organization_id: z.string().uuid('ID organizație invalid').optional(),
    is_organization_event: z.boolean().optional()
}).refine((data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end >= start;
}, {
    message: 'Data de sfârșit trebuie să fie după data de început',
    path: ['end_date']
}).refine((data) => {
    if (data.is_recurring && (!data.recurrence_pattern || data.recurrence_pattern === 'NONE')) {
        return false;
    }
    return true;
}, {
    message: 'Trebuie să selectezi un pattern de recurență pentru evenimentele recurente',
    path: ['recurrence_pattern']
});

export const updateEventSchema = createEventSchema.partial().extend({
    id: z.string().uuid('ID eveniment invalid')
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
