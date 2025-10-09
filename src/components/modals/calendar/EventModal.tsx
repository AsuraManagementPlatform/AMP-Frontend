import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEventSchema, CreateEventFormData } from '@/schemas/calendar.schema';
import { EventTypeOptions, EventPriorityOptions, CalendarEvent, RecurrencePatternOptions, RecurrenceDurationOptions } from '@/types/calendar.types';
import { FormModal } from '@/components/ui/Modal';
import { ModalButton } from '@/components/ui/ModalButton';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateEventFormData) => Promise<void>;
    onDelete?: (eventId: string) => Promise<void>;
    event?: CalendarEvent | null;
    defaultDate?: Date;
    userGroups?: string[];
}

export const EventModal: React.FC<EventModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    event,
    defaultDate,
    userGroups = []
}) => {
    const [startTime, setStartTime] = React.useState('09:00');
    const [endTime, setEndTime] = React.useState('10:00');
    
    const isAdmin = userGroups.some(g => g.toLowerCase() === 'admin');
    const isOrgAdmin = userGroups.some(g => g.toLowerCase() === 'organization_admin');
    const isMemberOnly = !isAdmin && !isOrgAdmin;
    
    const filteredEventTypeOptions = React.useMemo(() => {
        if (isAdmin) {
            return EventTypeOptions.filter(opt => 
                opt.value === 'CALENDAR_NOTE' || 
                opt.value === 'MEETING' || 
                opt.value === 'ADMIN_NOTIFICATION'
            );
        } else if (isOrgAdmin) {
            return EventTypeOptions.filter(opt => 
                opt.value !== 'ADMIN_NOTIFICATION'
            );
        } else {
            return EventTypeOptions.filter(opt => opt.value === 'CALENDAR_NOTE');
        }
    }, [isAdmin, isOrgAdmin]);
    
    const canCreateOrgEvent = isOrgAdmin;
    
    const timeOptions = React.useMemo(() => {
        const options: string[] = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                options.push(timeStr);
            }
        }
        return options;
    }, []);
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue
    } = useForm<CreateEventFormData>({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            event_type: 'CALENDAR_NOTE',
            priority: 'MEDIUM',
            all_day: false,
            is_organization_event: false,
            is_recurring: false,
            recurrence_pattern: 'NONE'
        }
    });

    const allDay = watch('all_day');
    const isRecurring = watch('is_recurring');

    useEffect(() => {
        if (event) {
            const startDateTime = new Date(event.start_date);
            const endDateTime = new Date(event.end_date);
            
            const startDateStr = startDateTime.toISOString().split('T')[0];
            const endDateStr = endDateTime.toISOString().split('T')[0];
            
            const startTimeStr = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}`;
            const endTimeStr = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`;
            
            setStartTime(startTimeStr);
            setEndTime(endTimeStr);
            
            reset({
                title: event.title,
                description: event.description || '',
                start_date: startDateStr,
                end_date: endDateStr,
                event_type: event.event_type,
                priority: event.priority,
                location: event.location || '',
                all_day: event.all_day,
                reminder_minutes: event.reminder_minutes,
                is_organization_event: event.is_organization_event,
                is_recurring: event.is_recurring || false,
                recurrence_pattern: event.recurrence_pattern || 'NONE',
                recurrence_duration_months: event.recurrence_duration_months || null
            });
        } else if (defaultDate) {
            const year = defaultDate.getFullYear();
            const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
            const day = String(defaultDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            setStartTime('09:00');
            setEndTime('10:00');
            
            setValue('start_date', dateStr);
            setValue('end_date', dateStr);
        }
    }, [event, defaultDate, reset, setValue]);

    const handleFormSubmit = async (data: CreateEventFormData) => {
        const formattedData = { ...data };
        
        if (!data.all_day) {
            formattedData.start_date = `${data.start_date}T${startTime}`;
            formattedData.end_date = `${data.end_date}T${endTime}`;
        }
        
        await onSubmit(formattedData);
        reset();
        onClose();
    };

    const handleDelete = async () => {
        if (event && onDelete && confirm('Ești sigur că vrei să ștergi acest eveniment?')) {
            await onDelete(event.id);
            reset();
            onClose();
        }
    };

    const handleReset = () => {
        if (event) {
            const startDateTime = new Date(event.start_date);
            const endDateTime = new Date(event.end_date);
            
            const startDateStr = startDateTime.toISOString().split('T')[0];
            const endDateStr = endDateTime.toISOString().split('T')[0];
            
            const startTimeStr = `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}`;
            const endTimeStr = `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`;
            
            setStartTime(startTimeStr);
            setEndTime(endTimeStr);
            
            reset({
                title: event.title,
                description: event.description || '',
                start_date: startDateStr,
                end_date: endDateStr,
                event_type: event.event_type,
                priority: event.priority,
                location: event.location || '',
                all_day: event.all_day,
                reminder_minutes: event.reminder_minutes,
                is_organization_event: event.is_organization_event,
                is_recurring: event.is_recurring || false,
                recurrence_pattern: event.recurrence_pattern || 'NONE',
                recurrence_duration_months: event.recurrence_duration_months || null
            });
        } else if (defaultDate) {
            const year = defaultDate.getFullYear();
            const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
            const day = String(defaultDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            setStartTime('09:00');
            setEndTime('10:00');
            
            reset({
                title: '',
                description: '',
                location: '',
                event_type: 'CALENDAR_NOTE',
                priority: 'MEDIUM',
                all_day: false,
                is_organization_event: false,
                is_recurring: false,
                recurrence_pattern: 'NONE',
                reminder_minutes: undefined,
                start_date: dateStr,
                end_date: dateStr
            });
        } else {
            setStartTime('09:00');
            setEndTime('10:00');
            reset({
                title: '',
                description: '',
                location: '',
                event_type: 'CALENDAR_NOTE',
                priority: 'MEDIUM',
                all_day: false,
                is_organization_event: false,
                is_recurring: false,
                recurrence_pattern: 'NONE',
                reminder_minutes: undefined
            });
        }
    };

    if (!isOpen) return null;

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title={event ? 'Editează eveniment' : 'Eveniment nou'}
            size="lg"
            onReset={handleReset}
        >
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Titlu *
                        </label>
                        <input
                            {...register('title')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Introdu titlul evenimentului"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descriere
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Adaugă o descriere (opțional)"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tip eveniment *
                            </label>
                            <select
                                {...register('event_type')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            >
                                {filteredEventTypeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {isMemberOnly && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Poți crea doar note personale de calendar
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prioritate *
                            </label>
                            <select
                                {...register('priority')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            >
                                {EventPriorityOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data de început *
                            </label>
                            <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                                <input
                                    {...register('start_date')}
                                    type="date"
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                />
                                {!allDay && (
                                    <select
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-[140px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white"
                                    >
                                        {timeOptions.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <label className="flex items-center cursor-pointer whitespace-nowrap w-[100px]">
                                    <input
                                        {...register('all_day')}
                                        type="checkbox"
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Toată ziua
                                    </span>
                                </label>
                            </div>
                            {errors.start_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data de sfârșit *
                            </label>
                            <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                                <input
                                    {...register('end_date')}
                                    type="date"
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                />
                                {!allDay && (
                                    <select
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-[140px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white"
                                    >
                                        {timeOptions.map((time) => (
                                            <option key={time} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <div className="w-[100px]"></div>
                            </div>
                            {errors.end_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                            )}
                        </div>
                    </div>

                    {canCreateOrgEvent && (
                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    {...register('is_organization_event')}
                                    type="checkbox"
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 block text-sm text-gray-900">
                                    Eveniment organizație
                                </span>
                            </label>
                            <p className="ml-6 mt-1 text-xs text-gray-500">
                                Evenimentul va fi vizibil pentru toți membrii organizației
                            </p>
                        </div>
                    )}

                    <div className="space-y-3 border-t border-gray-200 pt-4">
                        <div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    {...register('is_recurring')}
                                    type="checkbox"
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    onChange={(e) => {
                                        setValue('is_recurring', e.target.checked);
                                        if (!e.target.checked) {
                                            setValue('recurrence_pattern', 'NONE');
                                            setValue('recurrence_duration_months', null);
                                        }
                                    }}
                                />
                                <span className="ml-2 block text-sm text-gray-900">
                                    Eveniment recurent
                                </span>
                            </label>
                        </div>

                        {isRecurring && (
                            <div className="ml-6 space-y-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipul de recurență *
                                    </label>
                                    <select
                                        {...register('recurrence_pattern')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white"
                                    >
                                        {RecurrencePatternOptions.filter(opt => opt.value !== 'NONE').map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label} - {option.description}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.recurrence_pattern && (
                                        <p className="mt-1 text-sm text-red-600">{errors.recurrence_pattern.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Durata recurenței
                                    </label>
                                    <select
                                        {...register('recurrence_duration_months', {
                                            setValueAs: (value) => value === '' || value === 'null' ? null : parseInt(value, 10)
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white"
                                    >
                                        {RecurrenceDurationOptions.map(option => (
                                            <option key={option.value?.toString() || 'unlimited'} value={option.value === null ? 'null' : option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.recurrence_duration_months && (
                                        <p className="mt-1 text-sm text-red-600">{errors.recurrence_duration_months.message}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Selectează câte luni va dura recurența, sau lasă "Fără limită de timp"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Locație
                        </label>
                        <input
                            {...register('location')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Adaugă locația (opțional)"
                        />
                        {errors.location && (
                            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                        )}
                    </div>

                    <div className="hidden">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reminder (minute înainte)
                        </label>
                        <select
                            {...register('reminder_minutes', { 
                                setValueAs: (value) => value === '' ? undefined : parseInt(value, 10)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="">Fără reminder</option>
                            <option value="15">15 minute</option>
                            <option value="30">30 minute</option>
                            <option value="60">1 oră</option>
                            <option value="1440">1 zi</option>
                            <option value="10080">1 săptămână</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                    <div className="flex gap-2">
                        <ModalButton
                            type="button"
                            onClick={onClose}
                            variant="cancel"
                            disabled={isSubmitting}
                        >
                            Anulează
                        </ModalButton>
                        {event && onDelete && (
                            <ModalButton
                                type="button"
                                onClick={handleDelete}
                                variant="danger"
                                disabled={isSubmitting}
                            >
                                Șterge
                            </ModalButton>
                        )}
                    </div>
                    <ModalButton
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                    >
                        {event ? 'Actualizează' : 'Creează'}
                    </ModalButton>
                </div>
            </form>
        </FormModal>
    );
};
