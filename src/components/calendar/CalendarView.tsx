import React, { useMemo, useState } from 'react';
import { CalendarEvent, EventTypeOptions } from '@/types/calendar.types';
import { Button } from '@/components/ui/Button';
import { DayEventsModal } from '@/components/modals/calendar/DayEventsModal';

interface CalendarViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onDateChange: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
    onDateClick: (date: Date) => void;
    viewMode?: 'month' | 'week' | 'day';
    onViewModeChange?: (mode: 'month' | 'week' | 'day') => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
    currentDate,
    events,
    onDateChange,
    onEventClick,
    onDateClick,
    viewMode: externalViewMode,
    onViewModeChange
}) => {
    const [internalViewMode, setInternalViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    
    const viewMode = externalViewMode !== undefined ? externalViewMode : internalViewMode;
    const setViewMode = (mode: 'month' | 'week' | 'day') => {
        if (onViewModeChange) {
            onViewModeChange(mode);
        } else {
            setInternalViewMode(mode);
        }
    };
    
    const monthNames = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
    const dayNames = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];

    const MAX_VISIBLE_EVENTS = 3;

    const getEventsForDate = (date: Date | null): CalendarEvent[] => {
        if (!date) return [];
        return events.filter(event => {
            if (!event.startDate || !event.endDate) return false;
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            eventStart.setHours(0, 0, 0, 0);
            eventEnd.setHours(0, 0, 0, 0);
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);
            return checkDate >= eventStart && checkDate <= eventEnd;
        });
    };

    const handleDayClick = (date: Date | null) => {
        if (!date) return;
        const dayEvents = getEventsForDate(date);
        if (dayEvents.length > MAX_VISIBLE_EVENTS) {
            setSelectedDate(date);
            setIsDayModalOpen(true);
        } else {
            onDateClick(date);
        }
    };

    const handleMoreEventsClick = (date: Date, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedDate(date);
        setIsDayModalOpen(true);
    };

    const calendarDays = useMemo(() => {
        if (viewMode === 'day') {
            return [currentDate];
        }
        
        if (viewMode === 'week') {
            const days: Date[] = [];
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));
            
            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                days.push(day);
            }
            return days;
        }
        
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
    }, [currentDate, viewMode]);

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
            
            if (track >= MAX_VISIBLE_EVENTS) {
                return;
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
        if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() - 1);
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setMonth(newDate.getMonth() - 1);
        }
        onDateChange(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') {
            newDate.setDate(newDate.getDate() + 1);
        } else if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        onDateChange(newDate);
    };

    const goToToday = () => {
        onDateChange(new Date());
    };

    const getEventTypeLabel = (type: string): string => {
        const typeOption = EventTypeOptions.find(t => t.value === type);
        return typeOption?.label || type;
    };

    const getHeaderTitle = () => {
        if (viewMode === 'day') {
            const dayName = dayNames[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];
            return `${dayName}, ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        } else if (viewMode === 'week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
                return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`;
            } else {
                return `${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`;
            }
        } else {
            return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {getHeaderTitle()}
                    </h2>
                    <div className="flex gap-2 items-center">
                        {/* View Mode Selector */}
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value as 'month' | 'week' | 'day')}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                        >
                            <option value="day">Zi</option>
                            <option value="week">Săptămână</option>
                            <option value="month">Lună</option>
                        </select>
                        
                        <Button variant="outline" onClick={goToToday} size="sm">
                            Astăzi
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={goToPreviousMonth} 
                            size="sm"
                            aria-label={viewMode === 'day' ? 'Ziua anterioară' : viewMode === 'week' ? 'Săptămâna anterioară' : 'Luna anterioară'}
                        >
                            ←
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={goToNextMonth} 
                            size="sm"
                            aria-label={viewMode === 'day' ? 'Ziua următoare' : viewMode === 'week' ? 'Săptămâna următoare' : 'Luna următoare'}
                        >
                            →
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-4">
                {viewMode === 'day' ? (
                    // Day View - Lista verticală cu evenimente
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-4">
                                {dayNames[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1]}, {currentDate.getDate()} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h3>
                            <div className="space-y-2">
                                {getEventsForDate(currentDate).length > 0 ? (
                                    getEventsForDate(currentDate).map((event) => {
                                        const getEventTypeColor = (type: string, leaveStatus?: string) => {
                                            if (type === 'VACATION') {
                                                switch (leaveStatus) {
                                                    case 'APPROVED': return 'bg-green-100 border-green-500';
                                                    case 'REJECTED': return 'bg-red-100 border-red-500';
                                                    case 'PENDING': return 'bg-yellow-100 border-yellow-500';
                                                    default: return 'bg-yellow-100 border-yellow-500';
                                                }
                                            }
                                            switch (type) {
                                                case 'SURVEY': return 'bg-indigo-100 border-indigo-300';
                                                case 'MEETING': return 'bg-green-100 border-green-300';
                                                case 'EVENT': return 'bg-orange-100 border-orange-300';
                                                case 'VOTE_SCHEDULING': return 'bg-purple-100 border-purple-300';
                                                case 'ACTIVITY': return 'bg-blue-100 border-blue-300';
                                                default: return 'bg-gray-100 border-gray-300';
                                            }
                                        };
                                        
                                        return (
                                            <div
                                                key={event.id}
                                                className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getEventTypeColor(event.eventType, event.leaveRequestStatus)}`}
                                                onClick={() => onEventClick(event)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-sm">{event.title}</h4>
                                                        {event.description && (
                                                            <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                                                        )}
                                                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                                                            <span>{getEventTypeLabel(event.eventType)}</span>
                                                            {event.startDate && (
                                                                <span>• {new Date(event.startDate).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-center py-8">Nu există evenimente pentru această zi</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : viewMode === 'week' ? (
                    // Week View - 7 coloane pentru săptămână
                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((date, index) => {
                            const isCurrentDay = isToday(date);
                            const dayEvents = getEventsForDate(date);
                            
                            return (
                                <div
                                    key={index}
                                    className={`border rounded-lg p-2 min-h-[200px] ${
                                        isCurrentDay ? 'bg-orange-50 border-orange-300' : 'bg-white border-gray-200'
                                    }`}
                                >
                                    <div className={`text-center font-semibold mb-2 ${
                                        isCurrentDay ? 'text-orange-600' : 'text-gray-900'
                                    }`}>
                                        <div className="text-xs">{dayNames[index]}</div>
                                        <div className="text-lg">{date?.getDate()}</div>
                                    </div>
                                    <div className="space-y-1">
                                        {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => {
                                            const getEventTypeColor = (type: string, leaveStatus?: string) => {
                                                if (type === 'VACATION') {
                                                    switch (leaveStatus) {
                                                        case 'APPROVED': return 'bg-green-100 text-green-800';
                                                        case 'REJECTED': return 'bg-red-100 text-red-800';
                                                        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
                                                        default: return 'bg-yellow-100 text-yellow-800';
                                                    }
                                                }
                                                switch (type) {
                                                    case 'SURVEY': return 'bg-indigo-100 text-indigo-800';
                                                    case 'MEETING': return 'bg-green-100 text-green-800';
                                                    case 'EVENT': return 'bg-orange-100 text-orange-800';
                                                    case 'VOTE_SCHEDULING': return 'bg-purple-100 text-purple-800';
                                                    case 'ACTIVITY': return 'bg-blue-100 text-blue-800';
                                                    default: return 'bg-gray-100 text-gray-800';
                                                }
                                            };
                                            
                                            return (
                                                <div
                                                    key={event.id}
                                                    className={`text-xs p-1.5 rounded cursor-pointer truncate ${getEventTypeColor(event.eventType, event.leaveRequestStatus)}`}
                                                    onClick={() => onEventClick(event)}
                                                    title={event.title}
                                                >
                                                    {event.title}
                                                </div>
                                            );
                                        })}
                                        {dayEvents.length > MAX_VISIBLE_EVENTS && (
                                            <button
                                                className="text-xs text-gray-600 hover:text-gray-900 font-medium w-full text-center py-1 hover:bg-gray-100 rounded"
                                                onClick={() => {
                                                    if (date) {
                                                        setSelectedDate(date);
                                                        setIsDayModalOpen(true);
                                                    }
                                                }}
                                            >
                                                +{dayEvents.length - MAX_VISIBLE_EVENTS} mai multe
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Month View - Grid clasic
                <div className="relative">
                    <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                        {dayNames.map(day => (
                            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                                {day}
                            </div>
                        ))}
                        
                        {calendarDays.map((date, index) => {
                            const isCurrentDay = isToday(date);
                            const dayEvents = getEventsForDate(date);
                            const hasOverflow = dayEvents.length > MAX_VISIBLE_EVENTS;
                            
                            return (
                                <div
                                    key={index}
                                    className={`bg-white min-h-32 relative ${
                                        date ? 'cursor-pointer hover:bg-gray-50' : ''
                                    } ${isCurrentDay ? 'bg-orange-50' : ''}`}
                                    onClick={() => handleDayClick(date)}
                                    style={{ gridRow: Math.floor(index / 7) + 2, paddingTop: '80px' }}
                                >
                                    {date && (
                                        <>
                                            <div className={`text-sm font-medium absolute top-1 left-2 z-10 ${
                                                isCurrentDay ? 'text-orange-600' : 'text-gray-900'
                                            }`}>
                                                {date.getDate()}
                                            </div>
                                            {hasOverflow && (
                                                <button
                                                    className="absolute bottom-1 left-1 right-1 text-xs text-gray-600 hover:text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 rounded px-2 py-0.5 transition-colors z-20 pointer-events-auto"
                                                    onClick={(e) => handleMoreEventsClick(date, e)}
                                                >
                                                    ... +{dayEvents.length - MAX_VISIBLE_EVENTS} mai multe
                                                </button>
                                            )}
                                        </>
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
                                
                                const getVacationColors = () => {
                                    switch (eventRow.event.leaveRequestStatus) {
                                        case 'APPROVED':
                                            return { bg: '#dcfce7', border: '#22c55e', text: '#166534' };
                                        case 'REJECTED':
                                            return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' };
                                        case 'PENDING':
                                        default:
                                            return { bg: '#fef9c3', border: '#eab308', text: '#854d0e' };
                                    }
                                };
                                
                                const vacationColors = eventRow.event.eventType === 'VACATION' ? getVacationColors() : null;
                                
                                const backgroundColor = vacationColors?.bg || activityColors?.bg || (
                                    eventRow.event.eventType === 'SURVEY' ? '#e0e7ff' :
                                    eventRow.event.eventType === 'MEETING' ? '#dcfce7' :
                                    eventRow.event.eventType === 'EVENT' ? '#fed7aa' :
                                    eventRow.event.eventType === 'VOTE_SCHEDULING' ? '#f3e8ff' : '#dbeafe'
                                );
                                const borderColor = vacationColors?.border || activityColors?.border || (
                                    eventRow.event.eventType === 'SURVEY' ? '#6366f1' :
                                    eventRow.event.eventType === 'MEETING' ? '#22c55e' :
                                    eventRow.event.eventType === 'EVENT' ? '#f97316' :
                                    eventRow.event.eventType === 'VOTE_SCHEDULING' ? '#a855f7' : '#3b82f6'
                                );
                                const textColor = vacationColors?.text || activityColors?.text || (
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
                )}
            </div>
            
            {/* Day Events Modal */}
            <DayEventsModal
                isOpen={isDayModalOpen}
                onClose={() => setIsDayModalOpen(false)}
                date={selectedDate}
                events={selectedDate ? getEventsForDate(selectedDate) : []}
                onEventClick={(event) => {
                    onEventClick(event);
                    setIsDayModalOpen(false);
                }}
            />
        </div>
    );
};
