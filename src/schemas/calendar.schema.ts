import { z } from 'zod';

export const createEventSchema = z.object({
    title: z.string()
        .min(1, 'Titlul este obligatoriu')
        .max(200, 'Titlul nu poate depăși 200 de caractere'),
    description: z.string()
        .max(1000, 'Descrierea nu poate depăși 1000 de caractere')
        .optional(),
    startDate: z.string()
        .min(1, 'Data de început este obligatorie'),
    endDate: z.string()
        .min(1, 'Data de sfârșit este obligatorie'),
    eventType: z.enum(['CALENDAR_NOTE', 'VOTE_SCHEDULING', 'MEETING', 'EVENT', 'ADMIN_NOTIFICATION', 'SURVEY', 'ACTIVITY', 'VACATION']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    location: z.string()
        .max(200, 'Locația nu poate depăși 200 de caractere')
        .optional(),
    attendees: z.array(z.string().email('Email invalid')).optional(),
    allDay: z.boolean(),
    isRecurring: z.boolean().optional(),
    recurrencePattern: z.enum(['NONE', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY']).optional(),
    recurrenceDurationMonths: z.number()
        .int('Durata trebuie să fie un număr întreg de luni')
        .min(1, 'Durata trebuie să fie cel puțin 1 lună')
        .max(120, 'Durata nu poate depăși 120 luni (10 ani)')
        .nullable()
        .optional(),
    reminderMinutes: z.number()
        .int('Numărul de minute trebuie să fie întreg')
        .min(0, 'Numărul de minute trebuie să fie pozitiv')
        .max(10080, 'Numărul de minute nu poate depăși 1 săptămână')
        .optional(),
    organizationId: z.string().uuid('ID organizație invalid').optional(),
    isOrganizationEvent: z.boolean().optional()
}).refine((data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
}, {
    message: 'Data de sfârșit trebuie să fie după data de început',
    path: ['endDate']
}).refine((data) => {
    if (data.isRecurring && (!data.recurrencePattern || data.recurrencePattern === 'NONE')) {
        return false;
    }
    return true;
}, {
    message: 'Trebuie să selectezi un pattern de recurență pentru evenimentele recurente',
    path: ['recurrencePattern']
});

export const updateEventSchema = createEventSchema.partial().extend({
    id: z.string().uuid('ID eveniment invalid')
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
