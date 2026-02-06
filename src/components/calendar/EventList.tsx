import React from 'react';
import { CalendarEvent, EventPriorityOptions, EventTypeOptions } from '@/types/calendar.types';
import { Button } from '@/components/ui/Button';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';

interface EventListProps {
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
    onDeleteEvent: (id: string) => void;
}

export const EventList: React.FC<EventListProps> = ({
    events,
    onEventClick,
    onDeleteEvent
}) => {
    const { t } = useTranslation();
    const confirm = useConfirmDialog();

    const handleDeleteClick = async (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        const confirmed = await confirm({
            title: t('label.calendar.delete_event_title'),
            message: t('label.calendar.delete_event_confirm'),
            confirmText: t('button.confirm'),
            cancelText: t('button.cancel'),
            confirmButtonVariant: 'danger'
        });
        if (confirmed) {
            onDeleteEvent(eventId);
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'Data invalidă';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data invalidă';
        return new Intl.DateTimeFormat('ro-RO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getPriorityLabel = (priority: string): string => {
        const priorityOption = EventPriorityOptions.find(p => p.value === priority);
        return priorityOption?.label || priority;
    };

    const getEventTypeLabel = (type: string): string => {
        const typeOption = EventTypeOptions.find(t => t.value === type);
        return typeOption?.label || type;
    };

    const sortedEvents = [...events].sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    if (events.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Nu există evenimente în perioada selectată</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-200">
                {sortedEvents.map((event) => (
                    <div
                        key={event.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => onEventClick(event)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {event.title}
                                    </h3>
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                                        event.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                                        event.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                        event.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {getPriorityLabel(event.priority)}
                                    </span>
                                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                        {getEventTypeLabel(event.eventType)}
                                    </span>
                                </div>

                                {event.description && (
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                        {event.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <span>
                                            {formatDate(event.startDate)}
                                            {!event.allDay && event.endDate !== event.startDate && 
                                                ` → ${formatDate(event.endDate)}`
                                            }
                                        </span>
                                    </div>

                                    {event.location && (
                                        <div className="flex items-center gap-1">
                                            <span>{event.location}</span>
                                        </div>
                                    )}

                                    {event.reminderMinutes && (
                                        <div className="flex items-center gap-1">
                                            <span>{event.reminderMinutes} min înainte</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {event.eventType !== 'SURVEY' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => handleDeleteClick(e, event.id)}
                                >
                                    {t('button.delete')}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
