import React, { useState } from 'react';

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    type: 'meeting' | 'voting' | 'event';
    time?: string;
    description?: string;
}

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
        return events.filter(event => 
            event.date.toDateString() === date.toDateString()
        );
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
            
            days.push(
                <div
                    key={day}
                    className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 ${
                        isCurrentDay ? 'bg-orange-50 border-orange-300' : ''
                    }`}
                    onClick={() => onDateClick?.(date)}
                >
                    <div className={`text-sm font-medium mb-1 ${
                        isCurrentDay ? 'text-orange-600' : 'text-gray-900'
                    }`}>
                        {day}
                    </div>
                    <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                            <div
                                key={event.id}
                                className={`text-xs p-1 rounded cursor-pointer truncate ${
                                    event.type === 'voting' 
                                        ? 'bg-red-100 text-red-800'
                                        : event.type === 'meeting'
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
                        {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500">
                                +{dayEvents.length - 2} mai multe
                            </div>
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
        </div>
    );
};

export default Calendar;