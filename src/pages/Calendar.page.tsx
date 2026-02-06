import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/layout/Layout';
import { CalendarView } from '@/components/calendar/CalendarView';
import { EventModal } from '@/components/modals/calendar/EventModal';
import { EventList } from '@/components/calendar/EventList';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';
import calendarService from '@/services/calendar.service';
import activityService from '@/services/activity.service';
import leaveRequestService from '@/services/leave-request.service';
import { CalendarEvent, CalendarFilters, CreateEventData } from '@/types/calendar.types';
import { LeaveRequest } from '@/types/leave-request.types';
import { CreateEventFormData } from '@/schemas/calendar.schema';
import { CreateLeaveRequestFormData } from '@/schemas/leave-request.schema';
import { useAuth } from '@/hooks/useAuth';
import { UserGroup } from '@/types/index.types';
import { SurveyVoteModal } from '@/components/modals/survey/SurveyVoteModal';
import { ActivityDetailsModal } from '@/components/modals/activity/ActivityDetailsModal';
import { LeaveRequestModal } from '@/components/modals/leave-request/LeaveRequestModal';
import { Activity } from '@/types/activity.types';

type ViewMode = 'month' | 'list';
type CalendarViewMode = 'month' | 'week' | 'day';
type CalendarFilter = 'all' | 'events' | 'activities' | 'surveys' | 'vacations';

const CalendarPage: React.FC = () => {
    const { t } = useTranslation();
    const { hasAnyUserGroup, user } = useAuth();
    const isAdmin = hasAnyUserGroup([UserGroup.ADMIN]);
    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('month');
    const [calendarFilter, setCalendarFilter] = useState<CalendarFilter>('all');
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isLeaveRequestModalOpen, setIsLeaveRequestModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
    const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined);
    const [showOnlyCurrentMonth, setShowOnlyCurrentMonth] = useState(false);
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
            showToast.error(t('toast.calendar.load_error'));
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadLeaveRequests = async () => {
        try {
            let filters: { startDate?: string; endDate?: string } = {};

            if (showOnlyCurrentMonth) {
                const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                filters.startDate = startDate.toISOString().split('T')[0];
                filters.endDate = endDate.toISOString().split('T')[0];
            }

            const data = await leaveRequestService.getList(filters);
            setLeaveRequests(data || []);
        } catch (error) {
            setLeaveRequests([]);
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
        loadLeaveRequests();
        loadUpcomingEvents();
    }, [currentDate, showOnlyCurrentMonth]);

    const leaveRequestsAsEvents: CalendarEvent[] = leaveRequests.map(lr => ({
        id: lr.id,
        title: `${lr.userName || t('label.leave_request.title')}`,
        description: lr.notes || '',
        startDate: lr.date,
        endDate: lr.endDate || lr.date,
        eventType: 'VACATION' as any,
        priority: 'MEDIUM' as any,
        allDay: true,
        isRecurring: false,
        organizationId: '',
        isOrganizationEvent: false,
        createdAt: lr.createdAt,
        updatedAt: lr.updatedAt,
        leaveRequestStatus: lr.status,
        leaveRequestId: lr.id,
    }));

    const getFilteredEvents = () => {
        let allEvents = [...events];
        
        if (calendarFilter === 'vacations') {
            return leaveRequestsAsEvents;
        }
        
        if (calendarFilter === 'all') {
            allEvents = [...events, ...leaveRequestsAsEvents];
        } else if (calendarFilter === 'events') {
            allEvents = events.filter(e => 
                e.eventType === 'CALENDAR_NOTE' || 
                e.eventType === 'MEETING' || 
                e.eventType === 'EVENT'
            );
        } else if (calendarFilter === 'activities') {
            allEvents = events.filter(e => e.eventType === 'ACTIVITY');
        } else if (calendarFilter === 'surveys') {
            allEvents = events.filter(e => e.eventType === 'SURVEY');
        }
        
        return allEvents;
    };

    const handleCreateEvent = async (data: CreateEventFormData) => {
        try {
            if (data.isOrganizationEvent && !user?.organizationId) {
                showToast.error(t('toast.calendar.no_organization'));
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
                showToast.success(t('toast.calendar.event_updated'));
            } else {
                await calendarService.createEvent(eventData);
                showToast.success(t('toast.calendar.event_created'));
            }
            await loadEvents();
            await loadUpcomingEvents();
            setIsEventModalOpen(false);
            setSelectedEvent(null);
            setDefaultDate(undefined);
        } catch (error) {
            if (error instanceof Error) {
                showToast.error(`${t('toast.default_error_message')}: ${error.message}`);
            } else {
                showToast.error(t('toast.calendar.event_save_error'));
            }
        }
    };

    const handleDeleteEvent = async (id: string) => {
        try {
            await calendarService.deleteEvent(id);
            showToast.success(t('toast.calendar.event_deleted'));
            await loadEvents();
            await loadUpcomingEvents();
            setIsEventModalOpen(false);
            setSelectedEvent(null);
        } catch (error) {
            showToast.error(t('toast.calendar.event_delete_error'));
        }
    };

    const handleEventClick = (event: CalendarEvent) => {
        if (event.eventType === 'SURVEY' && event.relatedSurveyQuestion) {
            setVotingSurveyId(event.relatedSurveyQuestion);
            return;
        }

        if (event.eventType === 'VOTE_SCHEDULING' && event.location) {
            window.open(event.location, '_blank', 'noopener');
            return;
        }
        
        if (event.eventType === 'ACTIVITY' && event.activity) {
            loadActivityDetails(event.activity);
            return;
        }

        if ((event.eventType as any) === 'VACATION') {
            const leaveRequest = leaveRequests.find(lr => lr.id === event.id);
            if (leaveRequest) {
                setSelectedLeaveRequest(leaveRequest);
                setIsLeaveRequestModalOpen(true);
            }
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
            showToast.error(t('toast.activity.load_error'));
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

    const handleLeaveRequestSubmit = async (data: CreateLeaveRequestFormData) => {
        try {
            const startDate = new Date(data.date);
            const endDate = data.endDate ? new Date(data.endDate) : startDate;
            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const vacationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            if (selectedLeaveRequest) {
                await leaveRequestService.update({
                    id: selectedLeaveRequest.id,
                    vacation_number: vacationDays,
                    date: data.date,
                    end_date: data.endDate || undefined,
                    notes: data.notes || undefined,
                });
                showToast.success(t('toast.leave_request.update_success'));
            } else {
                await leaveRequestService.create({
                    vacation_number: vacationDays,
                    date: data.date,
                    end_date: data.endDate || undefined,
                    notes: data.notes || undefined,
                });
                showToast.success(t('toast.leave_request.create_success'));
            }
            await loadLeaveRequests();
            setIsLeaveRequestModalOpen(false);
            setSelectedLeaveRequest(null);
            setDefaultDate(undefined);
        } catch (error: any) {
            showToast.error(t(error?.message || 'toast.leave_request.create_error'));
        }
    };

    const handleDeleteLeaveRequest = async (id: string) => {
        try {
            await leaveRequestService.delete(id);
            showToast.success(t('toast.leave_request.delete_success'));
            await loadLeaveRequests();
            setIsLeaveRequestModalOpen(false);
            setSelectedLeaveRequest(null);
        } catch (error: any) {
            showToast.error(t(error?.message || 'toast.leave_request.delete_error'));
        }
    };

    const handleCloseLeaveRequestModal = () => {
        setIsLeaveRequestModalOpen(false);
        setSelectedLeaveRequest(null);
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
            ACTIVITY: 'Activitate',
            VACATION: t('label.leave_request.page_title')
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
            ACTIVITY: 'blue',
            VACATION: 'teal'
        };
        return colors[type] || 'gray';
    };

    const filteredEvents = getFilteredEvents();

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8 flex justify-between items-start">
                    <div>
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
                    {!isAdmin && !isOrgAdmin && (
                        <Button
                            onClick={() => {
                                setSelectedLeaveRequest(null);
                                setDefaultDate(new Date());
                                setIsLeaveRequestModalOpen(true);
                            }}
                            variant="primary"
                        >
                            {t('label.leave_request.add_leave')}
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <Card title="Calendar organizațional" className="h-full">
                            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
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
                                <div className="flex rounded-md shadow-sm">
                                    {(['all', 'events', 'activities', 'surveys', 'vacations'] as CalendarFilter[]).map((filter, index) => (
                                        <button
                                            key={filter}
                                            onClick={() => setCalendarFilter(filter)}
                                            className={`px-3 py-2 text-sm font-medium border ${
                                                index === 0 ? 'rounded-l-md' : ''
                                            } ${
                                                index === 4 ? 'rounded-r-md' : ''
                                            } ${
                                                calendarFilter === filter
                                                    ? 'bg-orange-600 text-white border-orange-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            } ${index > 0 ? '-ml-px' : ''}`}
                                        >
                                            {t(`label.calendar.view_${filter}`)}
                                        </button>
                                    ))}
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
                                            events={filteredEvents}
                                            onDateChange={setCurrentDate}
                                            onEventClick={handleEventClick}
                                            onDateClick={handleDateClick}
                                            viewMode={calendarViewMode}
                                            onViewModeChange={setCalendarViewMode}
                                        />
                                    ) : (
                                        <EventList
                                            events={filteredEvents}
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

                <LeaveRequestModal
                    isOpen={isLeaveRequestModalOpen}
                    onClose={handleCloseLeaveRequestModal}
                    onSubmit={handleLeaveRequestSubmit}
                    onDelete={handleDeleteLeaveRequest}
                    leaveRequest={selectedLeaveRequest}
                    defaultDate={defaultDate}
                    isOwner={!selectedLeaveRequest || selectedLeaveRequest.userId === user?.id}
                />
            </div>
        </Layout>
    );
};

export default CalendarPage;