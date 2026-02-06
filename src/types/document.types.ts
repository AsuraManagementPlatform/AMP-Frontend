export const DocumentCategoryEnum = {
  COTIZATII: 'cotizatii',
  DONATII: 'donatii',
  ENTITATI: 'entitati',
  PROIECTE: 'proiecte',
  MEMBRI: 'membri',
  ORGANIZATIE: 'organizatie',
  TEMPLATE: 'template',
  ACTIVITATI: 'activitati',
  FINANCIAR: 'financiar',
} as const;

export type DocumentCategory = typeof DocumentCategoryEnum[keyof typeof DocumentCategoryEnum];

export interface Document {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  year?: number;
  month?: number;
  day?: number;
  organization: string;
  uploadedBy: string;
  uploadedByName: string;
  category: DocumentCategory;
  subcategory?: string;
  isPermanent: boolean;
  membershipFee?: string;
  membershipFeeInfo?: {
    id: string;
    memberName: string;
  };
  entityDonation?: string;
  entityDonationInfo?: {
    id: string;
    entityName: string;
    amount: number;
  };
  entity?: string;
  entityName?: string;
  project?: string;
  projectName?: string;
  projectFund?: string;
  projectFundInfo?: {
    id: string;
    sourceName: string;
  };
  projectExpense?: string;
  projectExpenseInfo?: {
    id: string;
    name: string;
  };
  activity?: string;
  activityName?: string;
  user?: string;
  userName?: string;
  description?: string;
  tags?: string[];
  createdAt: string;
  downloadUrl: string;
}

export interface DocumentUploadParams {
  file: File;
  category: DocumentCategory;
  membershipFeeId?: string;
  entityDonationId?: string;
  entityId?: string;
  projectId?: string;
  projectFundId?: string;
  projectExpenseId?: string;
  activityId?: string;
  userId?: string;
  subcategory?: string;
  isTemporal?: boolean;
  description?: string;
  tags?: string[];
}

export interface DocumentListParams {
  category?: DocumentCategory;
  subcategory?: string;
  year?: number;
  month?: number;
  isPermanent?: boolean;
  membershipFeeId?: string;
  entityDonationId?: string;
  entityId?: string;
  projectId?: string;
  projectFundId?: string;
  projectExpenseId?: string;
  activityId?: string;
  userId?: string;
  fileType?: string;
}
