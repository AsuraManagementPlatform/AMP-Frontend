import {UserGroup} from "@/types/index.types.ts";

export const UserStatus = {
    DRAFT: 'DRAFT',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];
export interface UserMeResponse {
    id: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    email: string;
    cnp?: string;
    personalNumericalNumber?: string;
    isLegalEntity: boolean;
    companyNumber?: string;
    companyName?: string;
    cui?: string;
    phoneNumber?: string;
    secondaryPhone?: string;
    address?: string;
    city?: string;
    county?: string;
    postalCode?: string;
    country?: string;
    groups: UserGroup[];
    status: UserStatus;
    organizationId?: string;
    lastLogin?: string;
    registrationDate?: string;
    isActive: boolean;
    profession?: string;
    bio?: string;
}

export interface User {
    id: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    email: string;
    cnp?: string;
    personalNumericalNumber?: string;
    phoneNumber?: string;
    secondaryPhone?: string;
    companyNumber?: string;
    companyName?: string;
    cui?: string;
    address?: string;
    city?: string;
    county?: string;
    postalCode?: string;
    country?: string;
    groups: string[];
    status: string;
    organizationId?: string;
    lastLogin?: string;
    registrationDate?: string;
    isActive: boolean;
    profession?: string;
    bio?: string;
    createdAt?: string;
    updatedAt?: string;
}
