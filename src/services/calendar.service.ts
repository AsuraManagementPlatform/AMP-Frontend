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
        
        if (filters?.startDate) params.append('start_date', filters.startDate);
        if (filters?.endDate) params.append('end_date', filters.endDate);
        if (filters?.eventType) params.append('event_type', filters.eventType);
        if (filters?.priority) params.append('priority', filters.priority);
        if (filters?.organizationId) params.append('organization_id', filters.organizationId);

        const queryString = params.toString();
        const url = `calendar/list${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiService.get<{ calendarEvents: CalendarEvent[] }>(url);
        return response.calendarEvents || [];
    }

    async getEventById(id: string): Promise<CalendarEvent> {
        const response = await apiService.get<{ calendarEvent: CalendarEvent }>(`calendar/${id}`);
        return response.calendarEvent;
    }

    async createEvent(data: CreateEventData): Promise<CalendarEvent> {
        const response = await apiService.post<{ calendarEvent: CalendarEvent }>('calendar/create', data);
        return response.calendarEvent;
    }

    async updateEvent(data: UpdateEventData): Promise<CalendarEvent> {
        const { id, ...updateData } = data;
        const response = await apiService.put<{ calendarEvent: CalendarEvent }>(`calendar/update/${id}`, updateData);
        return response.calendarEvent;
    }

    async deleteEvent(id: string): Promise<void> {
        return await apiService.delete(`calendar/delete/${id}`);
    }

    async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + days);

        return await this.getEvents({
            startDate: today.toISOString(),
            endDate: endDate.toISOString()
        });
    }

    async getEventsByMonth(year: number, month: number): Promise<CalendarEvent[]> {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        return await this.getEvents({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
    }

    async getMyEvents(filters?: CalendarFilters): Promise<CalendarEvent[]> {
        const params = new URLSearchParams();
        
        if (filters?.startDate) params.append('start', filters.startDate);
        if (filters?.endDate) params.append('end', filters.endDate);
        if (filters?.eventType) params.append('event_type', filters.eventType);

        const queryString = params.toString();
        const url = `calendar/my-events${queryString ? `?${queryString}` : ''}`;
        
        const response = await apiService.get<{ events: CalendarEvent[] }>(url);
        return response.events || [];
    }

    async searchEvents(searchTerm: string): Promise<CalendarEvent[]> {
        return await apiService.get<CalendarEvent[]>(
            `calendar/events/search?q=${encodeURIComponent(searchTerm)}`
        );
    }
}

export default new CalendarService();
