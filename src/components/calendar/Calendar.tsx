import React, { useState } from 'react';
import { DayEventsModal } from '@/components/modals/calendar/DayEventsModal';
import { CalendarEvent } from '@/types/calendar.types';

interface CalendarProps {
    events?: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
    onDateClick?: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ 
    events = [], 
    onEventClick,
    onDateClick 
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const monthNames = [
        'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
        'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
    ];
    
    const dayNames = ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'];
    
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };
    
    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };
    
    const goToToday = () => {
        setCurrentDate(new Date());
    };
    
    const getEventsForDate = (date: Date): CalendarEvent[] => {
        return events.filter(event => {
            const eventStartDate = new Date(event.startDate);
            return eventStartDate.toDateString() === date.toDateString();
        });
    };
    
    const handleDateClick = (date: Date) => {
        const dayEvents = getEventsForDate(date);
        if (dayEvents.length > 3) {
            setSelectedDate(date);
            setIsDayModalOpen(true);
        } else {
            onDateClick?.(date);
        }
    };
    
    const handleMoreEventsClick = (date: Date, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedDate(date);
        setIsDayModalOpen(true);
    };
    
    const isToday = (date: Date): boolean => {
        return date.toDateString() === today.toDateString();
    };
    
    const renderCalendarDays = () => {
        const days = [];
        
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(
                <div key={`empty-${i}`} className="h-24 border border-gray-200"></div>
            );
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEvents = getEventsForDate(date);
            const isCurrentDay = isToday(date);
            const maxVisibleEvents = 3;
            const hasMoreEvents = dayEvents.length > maxVisibleEvents;
            
            days.push(
                <div
                    key={day}
                    className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 ${
                        isCurrentDay ? 'bg-orange-50 border-orange-300' : ''
                    }`}
                    onClick={() => handleDateClick(date)}
                >
                    <div className={`text-sm font-medium mb-1 ${
                        isCurrentDay ? 'text-orange-600' : 'text-gray-900'
                    }`}>
                        {day}
                    </div>
                    <div className="space-y-1">
                        {dayEvents.slice(0, maxVisibleEvents).map((event) => (
                            <div
                                key={event.id}
                                className={`text-xs p-1 rounded cursor-pointer truncate ${
                                    event.eventType === 'VOTE_SCHEDULING' 
                                        ? 'bg-red-100 text-red-800'
                                        : event.eventType === 'MEETING'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick?.(event);
                                }}
                                title={event.title}
                            >
                                {event.title}
                            </div>
                        ))}
                        {hasMoreEvents && (
                            <button
                                className="text-xs text-gray-600 hover:text-gray-900 font-medium w-full text-left px-1 py-0.5 hover:bg-gray-100 rounded transition-colors"
                                onClick={(e) => handleMoreEventsClick(date, e)}
                            >
                                ... +{dayEvents.length - maxVisibleEvents} mai multe
                            </button>
                        )}
                    </div>
                </div>
            );
        }
        
        return days;
    };
    
    return (
        <div className="bg-white rounded-lg shadow">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {monthNames[month]} {year}
                    </h2>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                    >
                        Astăzi
                    </button>
                    
                    {/* View Mode Selector */}
                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value as 'month' | 'week' | 'day')}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                    >
                        <option value="day">Zi</option>
                        <option value="week">Săptămână</option>
                        <option value="month">Lună</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        aria-label="Luna anterioară"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        aria-label="Luna următoare"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
            
            {/* Calendar Grid */}
            <div className="p-4">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-0 mb-2">
                    {dayNames.map((day) => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-0 border border-gray-200">
                    {renderCalendarDays()}
                </div>
            </div>
            
            {/* Legend */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                        <span className="text-gray-600">Întâlniri</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                        <span className="text-gray-600">Voturi</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                        <span className="text-gray-600">Evenimente</span>
                    </div>
                </div>
            </div>
            
            {/* Day Events Modal */}
            <DayEventsModal
                isOpen={isDayModalOpen}
                onClose={() => setIsDayModalOpen(false)}
                date={selectedDate}
                events={selectedDate ? getEventsForDate(selectedDate) : []}
                onEventClick={onEventClick}
            />
        </div>
    );
};

export default Calendar;