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

    // Grupează evenimentele pe rânduri pentru a le afișa ca bare continue
    const getEventRows = useMemo(() => {
        interface EventRow {
            event: CalendarEvent;
            startCol: number;
            span: number;
            row: number;
        }
        
        const rows: EventRow[] = [];
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Calculăm offset-ul primei zile (câte celule goale sunt înainte)
        const firstDayOfWeek = (monthStart.getDay() + 6) % 7;
        
        events.forEach(event => {
            if (!event.startDate || !event.endDate) return;
            
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            
            // Normalizare date
            eventStart.setHours(0, 0, 0, 0);
            eventEnd.setHours(0, 0, 0, 0);
            
            // Doar evenimentele care se suprapun cu luna curentă
            if (eventEnd < monthStart || eventStart > monthEnd) return;
            
            // Calculăm start și end relative la calendar
            const displayStart = eventStart < monthStart ? monthStart : eventStart;
            const displayEnd = eventEnd > monthEnd ? monthEnd : eventEnd;
            
            // Calculăm poziția în grid
            const dayOfMonth = displayStart.getDate() - 1; // 0-indexed
            const startCol = (firstDayOfWeek + dayOfMonth) % 7;
            const startRow = Math.floor((firstDayOfWeek + dayOfMonth) / 7);
            
            const spanDays = Math.ceil((displayEnd.getTime() - displayStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const daysUntilEndOfWeek = 7 - startCol;
            const span = Math.min(spanDays, daysUntilEndOfWeek);
            
            rows.push({
                event,
                startCol: startCol + 1, // CSS grid is 1-indexed
                span,
                row: startRow + 2 // +1 for header row, +1 for 1-indexing
            });
            
            // Dacă evenimentul continuă pe săptămâna următoare
            let remainingDays = spanDays - span;
            let currentRow = startRow + 1;
            
            while (remainingDays > 0) {
                const currentSpan = Math.min(remainingDays, 7);
                rows.push({
                    event,
                    startCol: 1,
                    span: currentSpan,
                    row: currentRow + 2,
                });
                remainingDays -= currentSpan;
                currentRow++;
            }
        });
        
        return rows;
    }, [events, currentDate]);

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
                <div className="relative">
                    <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                        {dayNames.map(day => (
                            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                                {day}
                            </div>
                        ))}
                        
                        {calendarDays.map((date, index) => {
                            const isCurrentDay = isToday(date);
                            
                            return (
                                <div
                                    key={index}
                                    className={`bg-white min-h-32 p-2 relative ${
                                        date ? 'cursor-pointer hover:bg-gray-50' : ''
                                    } ${isCurrentDay ? 'bg-orange-50' : ''}`}
                                    onClick={() => date && onDateClick(date)}
                                    style={{ gridRow: Math.floor(index / 7) + 2 }}
                                >
                                    {date && (
                                        <div className={`text-sm font-medium ${
                                            isCurrentDay ? 'text-orange-600' : 'text-gray-900'
                                        }`}>
                                            {date.getDate()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Layer pentru evenimente ca bare continue */}
                    <div className="absolute inset-0 pointer-events-none" style={{ top: '52px' }}>
                        <div className="grid grid-cols-7 gap-px h-full">
                            {getEventRows.map((eventRow, idx) => {
                                const getActivityColor = () => {
                                    if (eventRow.event.eventType !== 'ACTIVITY') return null;
                                    
                                    switch (eventRow.event.activityStatus) {
                                        case 'PLANNED':
                                            return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
                                        case 'IN_PROGRESS':
                                            return { bg: '#fed7aa', border: '#f97316', text: '#9a3412' };
                                        case 'COMPLETED':
                                            return { bg: '#dcfce7', border: '#22c55e', text: '#166534' };
                                        case 'CANCELLED':
                                            return { bg: '#f3f4f6', border: '#9ca3af', text: '#4b5563' };
                                        default:
                                            return { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' };
                                    }
                                };

                                const activityColors = getActivityColor();
                                const backgroundColor = activityColors?.bg || (
                                    eventRow.event.eventType === 'SURVEY' ? '#e0e7ff' :
                                    eventRow.event.eventType === 'MEETING' ? '#dcfce7' :
                                    eventRow.event.eventType === 'EVENT' ? '#fed7aa' :
                                    eventRow.event.eventType === 'VOTE_SCHEDULING' ? '#f3e8ff' : '#dbeafe'
                                );
                                const borderColor = activityColors?.border || (
                                    eventRow.event.eventType === 'SURVEY' ? '#6366f1' :
                                    eventRow.event.eventType === 'MEETING' ? '#22c55e' :
                                    eventRow.event.eventType === 'EVENT' ? '#f97316' :
                                    eventRow.event.eventType === 'VOTE_SCHEDULING' ? '#a855f7' : '#3b82f6'
                                );
                                const textColor = activityColors?.text || (
                                    eventRow.event.eventType === 'SURVEY' ? '#3730a3' :
                                    eventRow.event.eventType === 'MEETING' ? '#166534' :
                                    eventRow.event.eventType === 'EVENT' ? '#9a3412' :
                                    eventRow.event.eventType === 'VOTE_SCHEDULING' ? '#6b21a8' : '#1e40af'
                                );

                                return (
                                    <div
                                        key={`${eventRow.event.id}-${idx}`}
                                        className="pointer-events-auto cursor-pointer text-xs px-2 py-1 rounded flex items-center gap-1"
                                        style={{
                                            gridColumn: `${eventRow.startCol} / span ${eventRow.span}`,
                                            gridRow: eventRow.row,
                                            marginTop: `${(idx % 3) * 24}px`,
                                            height: '20px',
                                            backgroundColor,
                                            borderLeft: `3px solid ${borderColor}`,
                                            color: textColor
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(eventRow.event);
                                        }}
                                        title={`${eventRow.event.title} - ${getEventTypeLabel(eventRow.event.eventType)}`}
                                    >
                                        <span className="truncate flex-1">{eventRow.event.title}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
