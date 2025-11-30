import { z } from 'zod';

export const createLeaveRequestSchema = z.object({
    date: z.string()
        .min(1, 'schema.leave_request.date_required'),
    endDate: z.string()
        .optional(),
    notes: z.string()
        .max(500, 'schema.leave_request.notes_max')
        .optional()
}).refine((data) => {
    if (data.endDate) {
        const start = new Date(data.date);
        const end = new Date(data.endDate);
        return end >= start;
    }
    return true;
}, {
    message: 'schema.leave_request.end_date_after_start',
    path: ['endDate']
});

export const updateLeaveRequestSchema = createLeaveRequestSchema.partial().extend({
    id: z.uuid('schema.leave_request.id_invalid'),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional()
});

export type CreateLeaveRequestFormData = z.infer<typeof createLeaveRequestSchema>;
export type UpdateLeaveRequestFormData = z.infer<typeof updateLeaveRequestSchema>;
