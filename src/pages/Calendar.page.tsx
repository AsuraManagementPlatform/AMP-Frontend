import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { CalendarView } from '@/components/calendar/CalendarView';
import { EventModal } from '@/components/modals/calendar/EventModal';
import { EventList } from '@/components/calendar/EventList';
import { Card } from '@/components/ui/Card';
import showToast from '@/components/ui/Toast';
import calendarService from '@/services/calendar.service';
import activityService from '@/services/activity.service';
import { CalendarEvent, CalendarFilters, CreateEventData } from '@/types/calendar.types';
import { CreateEventFormData } from '@/schemas/calendar.schema';
import { useAuth } from '@/hooks/useAuth';
import { UserGroup } from '@/types/index.types';
import { SurveyVoteModal } from '@/components/modals/survey/SurveyVoteModal';
import { ActivityDetailsModal } from '@/components/modals/activity/ActivityDetailsModal';
import { Activity } from '@/types/activity.types';

type ViewMode = 'month' | 'list';
type CalendarViewMode = 'month' | 'week' | 'day';

const CalendarPage: React.FC = () => {
    const { hasAnyUserGroup, user } = useAuth();
    const isAdmin = hasAnyUserGroup([UserGroup.ADMIN]);
    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('month');
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined);
    const [showOnlyCurrentMonth, setShowOnlyCurrentMonth] = useState(true);
    const [votingSurveyId, setVotingSurveyId] = useState<string | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [isActivityDetailsOpen, setIsActivityDetailsOpen] = useState(false);

    const loadEvents = async () => {
        setIsLoading(true);
        try {
            let filters: CalendarFilters = {};

            if (showOnlyCurrentMonth) {
                const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                filters.startDate = startDate.toISOString();
                filters.endDate = endDate.toISOString();
            }

            const data = await calendarService.getMyEvents(filters);
            setEvents(data || []);
        } catch (error) {
            showToast.error('Eroare la încărcarea evenimentelor');
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadUpcomingEvents = async () => {
        try {
            const data = await calendarService.getUpcomingEvents(5);
            setUpcomingEvents(data || []);
        } catch (error) {
            setUpcomingEvents([]);
        }
    };

    useEffect(() => {
        loadEvents();
        loadUpcomingEvents();
    }, [currentDate, showOnlyCurrentMonth]);

    const handleCreateEvent = async (data: CreateEventFormData) => {
        try {
            if (data.isOrganizationEvent && !user?.organizationId) {
                showToast.error('Nu aveți o organizație asociată pentru evenimente organizaționale');
                return;
            }

            const eventData: CreateEventData = {
                title: data.title,
                description: data.description,
                start_date: data.startDate,
                end_date: data.endDate,
                event_type: data.eventType,
                priority: data.priority,
                location: data.location,
                attendees: data.attendees,
                all_day: data.allDay,
                is_recurring: data.isRecurring,
                recurrence_pattern: data.recurrencePattern,
                recurrence_duration_months: data.recurrenceDurationMonths,
                reminder_minutes: data.reminderMinutes,
                organization_id: data.isOrganizationEvent && user?.organizationId ? user.organizationId : undefined,
                is_organization_event: data.isOrganizationEvent
            };

            if (selectedEvent) {
                await calendarService.updateEvent({ ...eventData, id: selectedEvent.id });
                showToast.success('Eveniment actualizat cu succes!');
            } else {
                await calendarService.createEvent(eventData);
                showToast.success('Eveniment creat cu succes!');
            }
            await loadEvents();
            await loadUpcomingEvents();
            setIsEventModalOpen(false);
            setSelectedEvent(null);
            setDefaultDate(undefined);
        } catch (error) {
            if (error instanceof Error) {
                showToast.error(`Eroare: ${error.message}`);
            } else {
                showToast.error('Eroare la salvarea evenimentului');
            }
        }
    };

    const handleDeleteEvent = async (id: string) => {
        try {
            await calendarService.deleteEvent(id);
            showToast.success('Eveniment șters cu succes!');
            await loadEvents();
            await loadUpcomingEvents();
            setIsEventModalOpen(false);
            setSelectedEvent(null);
        } catch (error) {
            showToast.error('Eroare la ștergerea evenimentului');
        }
    };

    const handleEventClick = (event: CalendarEvent) => {
        if (event.eventType === 'SURVEY' && event.relatedSurveyQuestion) {
            setVotingSurveyId(event.relatedSurveyQuestion);
            return;
        }
        
        if (event.eventType === 'ACTIVITY' && event.activity) {
            loadActivityDetails(event.activity);
            return;
        }
        
        setSelectedEvent(event);
        setIsEventModalOpen(true);
    };

    const loadActivityDetails = async (activityId: string) => {
        try {
            const activityData = await activityService.getById(activityId);
            setSelectedActivity(activityData);
            setIsActivityDetailsOpen(true);
        } catch (error) {
            showToast.error('Eroare la încărcarea detaliilor activității');
        }
    };

    const handleDateClick = (date: Date) => {
        setDefaultDate(date);
        setSelectedEvent(null);
        setIsEventModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEventModalOpen(false);
        setSelectedEvent(null);
        setDefaultDate(undefined);
    };

    const formatEventDate = (dateString: string): string => {
        if (!dateString) return 'Data invalidă';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data invalidă';
        return new Intl.DateTimeFormat('ro-RO', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getEventTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            CALENDAR_NOTE: 'Notă calendar',
            VOTE_SCHEDULING: 'Programare vot',
            MEETING: 'Întâlnire',
            EVENT: 'Eveniment',
            SURVEY: 'Sondaj',
            ACTIVITY: 'Activitate'
        };
        return labels[type] || type;
    };

    const getEventTypeColor = (type: string): string => {
        const colors: Record<string, string> = {
            CALENDAR_NOTE: 'blue',
            VOTE_SCHEDULING: 'purple',
            MEETING: 'green',
            EVENT: 'orange',
            SURVEY: 'indigo',
            ACTIVITY: 'blue'
        };
        return colors[type] || 'gray';
    };

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Calendar</h1>
                    <p className="text-gray-600">
                        {isAdmin 
                            ? "Gestionează evenimente și întâlniri pentru toate organizațiile"
                            : isOrgAdmin 
                                ? "Planifică și organizează întâlniri și evenimente pentru organizația ta"
                                : "Vezi evenimente și întâlniri programate"
                        }
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <Card title="Calendar organizațional" className="h-full">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex rounded-md shadow-sm">
                                    <button
                                        onClick={() => setViewMode('month')}
                                        className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                                            viewMode === 'month'
                                                ? 'bg-orange-600 text-white border-orange-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        Lună
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                                            viewMode === 'list'
                                                ? 'bg-orange-600 text-white border-orange-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        Listă
                                    </button>
                                </div>
                            </div>

                            {isLoading && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Se încarcă evenimentele...</p>
                                </div>
                            )}

                            {!isLoading && (
                                <>
                                    {viewMode === 'month' ? (
                                        <CalendarView
                                            currentDate={currentDate}
                                            events={events}
                                            onDateChange={setCurrentDate}
                                            onEventClick={handleEventClick}
                                            onDateClick={handleDateClick}
                                            viewMode={calendarViewMode}
                                            onViewModeChange={setCalendarViewMode}
                                        />
                                    ) : (
                                        <EventList
                                            events={events}
                                            onEventClick={handleEventClick}
                                            onDeleteEvent={handleDeleteEvent}
                                        />
                                    )}
                                </>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card title="Filtre">
                            <div className="space-y-3">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showOnlyCurrentMonth}
                                        onChange={(e) => setShowOnlyCurrentMonth(e.target.checked)}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Afișează doar luna curentă
                                    </span>
                                </label>
                            </div>
                        </Card>

                        <Card title="Evenimente următoare">
                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingEvents.map((event) => {
                                        const color = getEventTypeColor(event.eventType);
                                        return (
                                            <div
                                                key={event.id}
                                                className={`border-l-4 border-${color}-500 pl-3 py-2 cursor-pointer hover:bg-gray-50`}
                                                onClick={() => handleEventClick(event)}
                                            >
                                                <div className="font-medium text-sm">{event.title}</div>
                                                <div className="text-xs text-gray-500">
                                                    {formatEventDate(event.startDate)}
                                                </div>
                                                <div className={`text-xs text-${color}-600`}>
                                                    {getEventTypeLabel(event.eventType)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Nu există evenimente programate</p>
                            )}
                        </Card>

                        <Card title="Statistici calendar">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total evenimente:</span>
                                    <span className="font-medium">{events.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Viitoare:</span>
                                    <span className="font-medium">{upcomingEvents.length}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <EventModal
                    isOpen={isEventModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleCreateEvent}
                    onDelete={handleDeleteEvent}
                    event={selectedEvent}
                    defaultDate={defaultDate}
                    userGroups={user?.groups || []}
                />

                <SurveyVoteModal
                    surveyId={votingSurveyId || ''}
                    isOpen={!!votingSurveyId}
                    onClose={() => setVotingSurveyId(null)}
                    onSuccess={() => {
                        setVotingSurveyId(null);
                        loadEvents();
                    }}
                />

                {selectedActivity && (
                    <ActivityDetailsModal
                        isOpen={isActivityDetailsOpen}
                        onClose={() => {
                            setIsActivityDetailsOpen(false);
                            setSelectedActivity(null);
                        }}
                        onSuccess={() => {
                            loadEvents();
                            setIsActivityDetailsOpen(false);
                            setSelectedActivity(null);
                        }}
                        activity={selectedActivity}
                        project={selectedActivity.project}
                        canEdit={false}
                    />
                )}
            </div>
        </Layout>
    );
};

export default CalendarPage;