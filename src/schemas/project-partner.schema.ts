import {z} from 'zod';
import {EngagementLevel, ProjectPartner} from "@/types/project-partner.types.ts";

export const ENGAGEMENT_LEVEL_TYPES = Object.values(EngagementLevel);

export const createProjectPartnerSchema = z.object({
    project: z.uuid('Proiectul este obligatoriu'),
    entity: z.uuid('Entitatea este obligatorie'),
    engagementLevel: z.enum(ENGAGEMENT_LEVEL_TYPES as [EngagementLevel, ...EngagementLevel[]], {
        message: 'Engagement selectat nu este valid'
    }).default(EngagementLevel.NONE),
});

export type CreateProjectPartnerData = z.infer<typeof createProjectPartnerSchema>;

export const updateProjectPartnerSchema = createProjectPartnerSchema.partial().extend({
    id: z.string()
});

export type UpdateProjectPartnerData = z.infer<typeof updateProjectPartnerSchema>;

export const getCreateProjectPartnerDefaultValues = (project?: string, entity?: string): CreateProjectPartnerData => ({
    project: project || '',
    entity: entity || '',
    engagementLevel: EngagementLevel.NONE,
});

export const getUpdateProjectPartnerDefaultValues = (projectPartner: ProjectPartner): UpdateProjectPartnerData => ({
    id: projectPartner.id,
    project: projectPartner.project,
    entity: projectPartner.entity,
    engagementLevel: projectPartner.engagementLevel,
});
