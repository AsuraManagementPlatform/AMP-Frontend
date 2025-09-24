import {BaseEntity} from "@/types/index.types.ts";

export const SkillLevel = {
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE',
    ADVANCED: 'ADVANCED',
    EXPERT: 'EXPERT'
} as const;

export type SkillLevel = typeof SkillLevel[keyof typeof SkillLevel];

export const ExperienceType = {
    WORK: 'WORK',
    EDUCATION: 'EDUCATION',
    VOLUNTEER: 'VOLUNTEER',
    PROJECT: 'PROJECT',
    CERTIFICATION: 'CERTIFICATION'
} as const;

export type ExperienceType = typeof ExperienceType[keyof typeof ExperienceType];

export interface UserSkill extends BaseEntity {
    userId: string;
    skillName: string;
    level: SkillLevel;
    yearsOfExperience?: number;
    description?: string;
    certificationUrl?: string;
}

export interface UserExperience extends BaseEntity {
    userId: string;
    type: ExperienceType;
    title: string;
    organization?: string;
    description?: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    location?: string;
    achievements?: string[];
}

export interface UserEducation extends BaseEntity {
    userId: string;
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    grade?: string;
    description?: string;
}

export interface UserCertification extends BaseEntity {
    userId: string;
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expirationDate?: string;
    credentialId?: string;
    credentialUrl?: string;
}

export interface UserCv {
    userId: string;
    summary?: string;
    skills: UserSkill[];
    experiences: UserExperience[];
    education: UserEducation[];
    certifications: UserCertification[];
    languages?: { language: string; proficiency: string }[];
    lastUpdated: string;
}

// Create/Update requests
export interface UserSkillCreateRequest {
    skillName: string;
    level: SkillLevel;
    yearsOfExperience?: number;
    description?: string;
    certificationUrl?: string;
}

export interface UserExperienceCreateRequest {
    type: ExperienceType;
    title: string;
    organization?: string;
    description?: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    location?: string;
    achievements?: string[];
}

export interface UserEducationCreateRequest {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    grade?: string;
    description?: string;
}

export interface UserCertificationCreateRequest {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expirationDate?: string;
    credentialId?: string;
    credentialUrl?: string;
}

export interface UserCvUpdateRequest {
    summary?: string;
    languages?: { language: string; proficiency: string }[];
}