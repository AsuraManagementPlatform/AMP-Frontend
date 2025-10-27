import {BaseEntity} from "@/types/index.types";

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
    projectName?: string;
    member: string;
    memberFullName?: string;
    memberEmail?: string;
    userRole: string;
    addedToProject: string;
    status: ProjectMemberStatus;
    type: ProjectMemberType;
    contractualDocumentNumber?: string;
    activeFrom: string;
    activeTo: string;
}

export interface ProjectMemberCreateRequest {
    project: string;
    member: string;
    userRole: string;
    addedToProject: string;
    status: ProjectMemberStatus;
    type: ProjectMemberType;
    contractualDocumentNumber?: string;
    activeFrom: string;
    activeTo: string;
}

export interface ProjectMemberUpdateRequest extends Partial<ProjectMemberCreateRequest> {
    id: string;
}

export interface ProjectMemberFilter {
    projectId?: string;
    memberId?: string;
    status?: ProjectMemberStatus;
    type?: ProjectMemberType;
    userTole?: string;
    search?: string;
}