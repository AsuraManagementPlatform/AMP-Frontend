import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { CalendarEvent, EventTypeOptions } from '@/types/calendar.types';

interface DayEventsModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
}

export const DayEventsModal: React.FC<DayEventsModalProps> = ({
    isOpen,
    onClose,
    date,
    events,
    onEventClick
}) => {
    if (!date) return null;

    const monthNames = [
        'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
        'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
    ];

    const dayNames = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];

    const formattedDate = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    const getEventTypeLabel = (type: string): string => {
        const typeOption = EventTypeOptions.find(t => t.value === type);
        return typeOption?.label || type;
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'SURVEY': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'MEETING': return 'bg-green-100 text-green-800 border-green-200';
            case 'EVENT': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'VOTE_SCHEDULING': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'ACTIVITY': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CALENDAR_NOTE': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={formattedDate}
            size="md"
        >
            <div className="space-y-3">
                {events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Nu există evenimente pentru această zi
                    </div>
                ) : (
                    events.map((event) => (
                        <div
                            key={event.id}
                            className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getEventTypeColor(event.eventType)}`}
                            onClick={() => {
                                onEventClick?.(event);
                                onClose();
                            }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-xs font-medium px-2 py-1 rounded bg-white bg-opacity-50">
                                            {getEventTypeLabel(event.eventType)}
                                        </span>
                                        {event.startDate && (
                                            <span className="text-xs font-medium">
                                                {formatTime(event.startDate)}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-sm mb-1">
                                        {event.title}
                                    </h4>
                                    {event.description && (
                                        <p className="text-xs opacity-90">
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Modal>
    );
};
