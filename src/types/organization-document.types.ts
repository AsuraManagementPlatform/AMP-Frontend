export const DocumentType = {
    STATUTE: 'STATUTE',
    REGISTRATION_CERTIFICATE: 'REGISTRATION_CERTIFICATE',
    TAX_CERTIFICATE: 'TAX_CERTIFICATE',
    FINANCIAL_REPORT: 'FINANCIAL_REPORT',
    ACTIVITY_REPORT: 'ACTIVITY_REPORT',
    MEETING_MINUTES: 'MEETING_MINUTES',
    CONTRACT: 'CONTRACT',
    AGREEMENT: 'AGREEMENT',
    AUTHORIZATION: 'AUTHORIZATION',
    LICENSE: 'LICENSE',
    OTHER: 'OTHER'
} as const;

export type DocumentType = typeof DocumentType[keyof typeof DocumentType];

export interface OrganizationDocument {
    id: string;
    organization: string;
    organizationName?: string;
    name: string;
    documentType: DocumentType;
    description?: string;
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    issuedBy?: string;
    filePath?: string;
    notes?: string;
    isActive: boolean;
    isExpired?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OrganizationDocumentCreateRequest {
    organization: string;
    name: string;
    document_type: DocumentType;
    description?: string;
    document_number?: string;
    issue_date?: string;
    expiry_date?: string;
    issued_by?: string;
    notes?: string;
    is_active?: boolean;
}

export interface OrganizationDocumentUpdateRequest extends Partial<OrganizationDocumentCreateRequest> {}
