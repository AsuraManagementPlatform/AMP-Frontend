import {z} from 'zod';
import {EngagementLevel, ProjectPartner} from "@/types/project-partner.types.ts";

export const ENGAGEMENT_LEVEL_TYPES = Object.values(EngagementLevel);

export const createProjectPartnerSchema = z.object({
    project: z.uuid('Proiectul este obligatoriu'),
    entity: z.uuid('Entitatea este obligatorie'),
    engagementLevel: z.enum(ENGAGEMENT_LEVEL_TYPES as [EngagementLevel, ...EngagementLevel[]], {
        message: 'Engagement selectat nu este valid'
    }).default(EngagementLevel.NONE),
    budget: z.coerce.number().min(0, 'Bugetul nu poate fi negativ').default(0),
});

export type CreateProjectPartnerData = z.infer<typeof createProjectPartnerSchema>;

export const updateProjectPartnerSchema = z.object({
    id: z.string(),
    engagementLevel: z.enum(ENGAGEMENT_LEVEL_TYPES as [EngagementLevel, ...EngagementLevel[]], {
        message: 'Engagement selectat nu este valid'
    }).optional(),
    budget: z.coerce.number().min(0, 'Bugetul nu poate fi negativ').optional(),
});

export type UpdateProjectPartnerData = z.infer<typeof updateProjectPartnerSchema>;

export const getCreateProjectPartnerDefaultValues = (project?: string, entity?: string): CreateProjectPartnerData => ({
    project: project || '',
    entity: entity || '',
    engagementLevel: EngagementLevel.NONE,
    budget: 0,
});

export const getUpdateProjectPartnerDefaultValues = (projectPartner: ProjectPartner): UpdateProjectPartnerData => ({
    id: projectPartner.id,
    engagementLevel: projectPartner.engagementLevel,
    budget: projectPartner.budget || 0,
});
