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
            startDate: Date;
            endDate: Date;
            track: number;
        }
        
        const rows: EventRow[] = [];
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const dayTracks: Map<string, Set<number>> = new Map();
        
        const getDayKey = (date: Date) => date.toISOString().split('T')[0];
        
        events.forEach(event => {
            if (!event.startDate || !event.endDate) return;
            
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            
            eventStart.setHours(0, 0, 0, 0);
            eventEnd.setHours(0, 0, 0, 0);
            
            if (eventEnd < monthStart || eventStart > monthEnd) return;
            
            const displayStart = eventStart < monthStart ? monthStart : eventStart;
            const displayEnd = eventEnd > monthEnd ? monthEnd : eventEnd;
            
            const occupiedTracks = new Set<number>();
            const currentDate = new Date(displayStart);
            
            while (currentDate <= displayEnd) {
                const key = getDayKey(currentDate);
                const tracks = dayTracks.get(key);
                if (tracks) {
                    tracks.forEach(t => occupiedTracks.add(t));
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            let track = 0;
            while (occupiedTracks.has(track)) {
                track++;
            }
            
            const markDate = new Date(displayStart);
            while (markDate <= displayEnd) {
                const key = getDayKey(markDate);
                if (!dayTracks.has(key)) {
                    dayTracks.set(key, new Set());
                }
                dayTracks.get(key)!.add(track);
                markDate.setDate(markDate.getDate() + 1);
            }
            
            rows.push({
                event,
                startDate: displayStart,
                endDate: displayEnd,
                track
            });
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
                                    className={`bg-white min-h-32 relative ${
                                        date ? 'cursor-pointer hover:bg-gray-50' : ''
                                    } ${isCurrentDay ? 'bg-orange-50' : ''}`}
                                    onClick={() => date && onDateClick(date)}
                                    style={{ gridRow: Math.floor(index / 7) + 2, paddingTop: '80px' }}
                                >
                                    {date && (
                                        <div className={`text-sm font-medium absolute top-1 left-2 z-10 ${
                                            isCurrentDay ? 'text-orange-600' : 'text-gray-900'
                                        }`}>
                                            {date.getDate()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Layer pentru evenimente ca bare continue - poziționate sus */}
                    <div className="absolute pointer-events-none" style={{ top: '40px', left: 0, right: 0 }}>
                        <div className="grid grid-cols-7 gap-px">
                            {getEventRows.map((eventRow) => {
                                const firstDayOfWeek = (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 6) % 7;
                                const startDay = eventRow.startDate.getDate() - 1;
                                const startCol = (firstDayOfWeek + startDay) % 7;
                                const startRow = Math.floor((firstDayOfWeek + startDay) / 7);
                                
                                const spanDays = Math.ceil((eventRow.endDate.getTime() - eventRow.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                
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
                                
                                const segments = [];
                                let remainingDays = spanDays;
                                let currentRow = startRow;
                                let currentCol = startCol;
                                let isFirstSegment = true;
                                
                                const rowHeight = 128;
                                const firstRowReservedSpace = 28;
                                
                                while (remainingDays > 0) {
                                    const daysInRow = isFirstSegment 
                                        ? Math.min(remainingDays, 7 - currentCol) 
                                        : Math.min(remainingDays, 7);
                                    
                                    const topPosition = currentRow * rowHeight + firstRowReservedSpace + eventRow.track * 24;
                                    
                                    segments.push(
                                        <div
                                            key={`${eventRow.event.id}-${currentRow}`}
                                            className="pointer-events-auto cursor-pointer text-xs px-2 py-1 rounded flex items-center gap-1 absolute"
                                            style={{
                                                left: `calc(${(currentCol / 7) * 100}% + ${currentCol}px)`,
                                                width: `calc(${(daysInRow / 7) * 100}% - ${1}px)`,
                                                top: `${topPosition}px`,
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
                                            <span className="truncate">{eventRow.event.title}</span>
                                        </div>
                                    );
                                    
                                    remainingDays -= daysInRow;
                                    currentRow++;
                                    currentCol = 0;
                                    isFirstSegment = false;
                                }
                                
                                return segments;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
