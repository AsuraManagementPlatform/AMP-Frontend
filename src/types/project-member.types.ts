import {BaseEntity} from "@/types/index.types.ts";

export const ProjectMemberStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
    COMPLETED: 'COMPLETED'
} as const;

export type ProjectMemberStatus = typeof ProjectMemberStatus[keyof typeof ProjectMemberStatus];

export const ProjectMemberType = {
    EMPLOYEE: 'EMPLOYEE',
    VOLUNTEER: 'VOLUNTEER',
    CONTRACTOR: 'CONTRACTOR',
    CONSULTANT: 'CONSULTANT',
    PARTNER: 'PARTNER'
} as const;

export type ProjectMemberType = typeof ProjectMemberType[keyof typeof ProjectMemberType];

export interface ProjectMember extends BaseEntity {
    project: string;
    project_name?: string;
    member: string;
    member_name?: string;
    member_email?: string;
    user_role: string;
    added_to_project: string;
    status: ProjectMemberStatus;
    type: ProjectMemberType;
    contractual_document_number?: string;
    active_from: string;
    active_to: string;
}

export interface ProjectMemberCreateRequest {
    project: string;
    member: string;
    user_role: string;
    added_to_project: string;
    status: ProjectMemberStatus;
    type: ProjectMemberType;
    contractual_document_number?: string;
    active_from: string;
    active_to: string;
}

export interface ProjectMemberUpdateRequest extends Partial<ProjectMemberCreateRequest> {}

export interface ProjectMemberFilter {
    project_id?: string;
    member_id?: string;
    status?: ProjectMemberStatus;
    type?: ProjectMemberType;
    user_role?: string;
    search?: string;
}