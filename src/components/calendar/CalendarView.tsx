import React, { useMemo } from 'react';
import { CalendarEvent, EventTypeOptions } from '@/types/calendar.types';
import { Button } from '@/components/ui/Button';

interface CalendarViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateChange: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
    onDateClick: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
    currentDate,
    events,
    onDateChange,
    onEventClick,
    onDateClick
}) => {
    const monthNames = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
    const dayNames = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const startingDayOfWeek = (firstDay.getDay() + 6) % 7;
        const totalDays = lastDay.getDate();
        
        const days: (Date | null)[] = [];
        
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        for (let day = 1; day <= totalDays; day++) {
            days.push(new Date(year, month, day));
        }
        
        return days;
    }, [currentDate]);

    const getEventsForDate = (date: Date | null): CalendarEvent[] => {
        if (!date) return [];
        
        return events.filter(event => {
            const eventStart = new Date(event.start_date);
            const eventEnd = new Date(event.end_date);
            
            const dateStr = date.toDateString();
            const startStr = eventStart.toDateString();
            const endStr = eventEnd.toDateString();
            
            return dateStr === startStr || dateStr === endStr || (date > eventStart && date < eventEnd);
        });
    };

    const isToday = (date: Date | null): boolean => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const goToPreviousMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        onDateChange(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        onDateChange(newDate);
    };

    const goToToday = () => {
        onDateChange(new Date());
    };

    const getEventTypeLabel = (type: string): string => {
        const typeOption = EventTypeOptions.find(t => t.value === type);
        return typeOption?.label || type;
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={goToToday} size="sm">
                            Astăzi
                        </Button>
                        <Button variant="outline" onClick={goToPreviousMonth} size="sm">
                            ←
                        </Button>
                        <Button variant="outline" onClick={goToNextMonth} size="sm">
                            →
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                    {dayNames.map(day => (
                        <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                            {day}
                        </div>
                    ))}
                    
                    {calendarDays.map((date, index) => {
                        const dayEvents = getEventsForDate(date);
                        const isCurrentDay = isToday(date);
                        
                        return (
                            <div
                                key={index}
                                className={`bg-white min-h-32 p-2 ${
                                    date ? 'cursor-pointer hover:bg-gray-50' : ''
                                } ${isCurrentDay ? 'bg-orange-50' : ''}`}
                                onClick={() => date && onDateClick(date)}
                            >
                                {date && (
                                    <>
                                        <div className={`text-sm font-medium mb-1 ${
                                            isCurrentDay ? 'text-orange-600' : 'text-gray-900'
                                        }`}>
                                            {date.getDate()}
                                        </div>
                                        <div className="space-y-1">
                                            {dayEvents.slice(0, 3).map(event => (
                                                <div
                                                    key={event.id}
                                                    className={`text-xs p-1 rounded truncate cursor-pointer ${
                                                        event.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                                                        event.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                        event.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEventClick(event);
                                                    }}
                                                    title={`${event.title} - ${getEventTypeLabel(event.event_type)}`}
                                                >
                                                    {event.title}
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div className="text-xs text-gray-500">
                                                    +{dayEvents.length - 3} mai mult
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
