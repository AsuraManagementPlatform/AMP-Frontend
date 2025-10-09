import { apiService } from './api.service';
import {
    CalendarEvent,
    CreateEventData,
    UpdateEventData,
    CalendarFilters
} from '@/types/calendar.types';

class CalendarService {
    async getEvents(filters?: CalendarFilters): Promise<CalendarEvent[]> {
        const params = new URLSearchParams();
        
        if (filters?.start_date) params.append('start_date', filters.start_date);
        if (filters?.end_date) params.append('end_date', filters.end_date);
        if (filters?.event_type) params.append('event_type', filters.event_type);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.organization_id) params.append('organization_id', filters.organization_id);

        const queryString = params.toString();
        const url = `/api/calendar/list${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiService.get<{ calendar_events: CalendarEvent[] }>(url);
        return response.calendar_events;
    }

    async getEventById(id: string): Promise<CalendarEvent> {
        const response = await apiService.get<{ calendar_event: CalendarEvent }>(`/api/calendar/${id}`);
        return response.calendar_event;
    }

    async createEvent(data: CreateEventData): Promise<CalendarEvent> {
        const response = await apiService.post<{ calendar_event: CalendarEvent }>('/api/calendar/create', data);
        return response.calendar_event;
    }

    async updateEvent(data: UpdateEventData): Promise<CalendarEvent> {
        const { id, ...updateData } = data;
        const response = await apiService.put<{ calendar_event: CalendarEvent }>(`/api/calendar/update/${id}`, updateData);
        return response.calendar_event;
    }

    async deleteEvent(id: string): Promise<void> {
        return await apiService.delete(`/api/calendar/delete/${id}`);
    }

    async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + days);

        return await this.getEvents({
            start_date: today.toISOString(),
            end_date: endDate.toISOString()
        });
    }

    async getEventsByMonth(year: number, month: number): Promise<CalendarEvent[]> {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        return await this.getEvents({
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
        });
    }

    async searchEvents(searchTerm: string): Promise<CalendarEvent[]> {
        return await apiService.get<CalendarEvent[]>(
            `/api/calendar/events/search?q=${encodeURIComponent(searchTerm)}`
        );
    }
}

export default new CalendarService();
