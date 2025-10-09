export type EventType = 'CALENDAR_NOTE' | 'VOTE_SCHEDULING' | 'MEETING' | 'EVENT' | 'ADMIN_NOTIFICATION';

export const EventTypeOptions: { value: EventType; label: string; color: string }[] = [
    { value: 'CALENDAR_NOTE', label: 'Notă calendar', color: 'blue' },
    { value: 'VOTE_SCHEDULING', label: 'Programare vot', color: 'purple' },
    { value: 'MEETING', label: 'Întâlnire', color: 'green' },
    { value: 'EVENT', label: 'Eveniment', color: 'orange' },
    { value: 'ADMIN_NOTIFICATION', label: 'Notificare administratori', color: 'red' }
];

export type EventPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const EventPriorityOptions: { value: EventPriority; label: string; color: string }[] = [
    { value: 'LOW', label: 'Scăzută', color: 'text-gray-600' },
    { value: 'MEDIUM', label: 'Medie', color: 'text-blue-600' },
    { value: 'HIGH', label: 'Înaltă', color: 'text-orange-600' },
    { value: 'URGENT', label: 'Urgentă', color: 'text-red-600' }
];

export type RecurrencePattern = 'NONE' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';

export const RecurrencePatternOptions: { value: RecurrencePattern; label: string; description: string }[] = [
    { value: 'NONE', label: 'Fără recurență', description: 'Eveniment unic' },
    { value: 'DAILY', label: 'Zilnic', description: 'Se repetă în fiecare zi' },
    { value: 'WEEKLY', label: 'Săptămânal', description: 'Se repetă în fiecare săptămână' },
    { value: 'BIWEEKLY', label: 'La două săptămâni', description: 'Se repetă la fiecare 2 săptămâni' },
    { value: 'MONTHLY', label: 'Lunar', description: 'Se repetă în fiecare lună' },
    { value: 'YEARLY', label: 'Anual', description: 'Se repetă în fiecare an' }
];

export const RecurrenceDurationOptions: { value: number | null; label: string }[] = [
    { value: null, label: 'Fără limită de timp' },
    { value: 1, label: '1 lună' },
    { value: 3, label: '3 luni' },
    { value: 6, label: '6 luni' },
    { value: 12, label: '1 an' },
    { value: 24, label: '2 ani' },
    { value: 36, label: '3 ani' }
];

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    event_type: EventType;
    priority: EventPriority;
    location?: string;
    attendees?: string[];
    all_day: boolean;
    is_recurring: boolean;
    recurrence_pattern?: RecurrencePattern;
    recurrence_duration_months?: number | null;
    reminder_minutes?: number;
    created_by?: string;
    organization_id: string;
    is_organization_event: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateEventData {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    event_type: EventType;
    priority: EventPriority;
    location?: string;
    attendees?: string[];
    all_day?: boolean;
    is_recurring?: boolean;
    recurrence_pattern?: RecurrencePattern;
    recurrence_duration_months?: number | null;
    reminder_minutes?: number;
    organization_id?: string;
    is_organization_event?: boolean;
}

export interface UpdateEventData extends Partial<CreateEventData> {
    id: string;
}

export interface CalendarFilters {
    start_date?: string;
    end_date?: string;
    event_type?: EventType;
    priority?: EventPriority;
    organization_id?: string;
}

export interface CalendarViewMode {
    type: 'month' | 'week' | 'day' | 'list';
    currentDate: Date;
}
