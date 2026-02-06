# Document Service Documentation

## Overview
The `documentService` provides a complete API interface for managing documents with Cloudflare R2 storage. It handles upload, retrieval, download, and deletion of documents with automatic camelCase ↔ snake_case conversion.

## Import
```typescript
import { documentService } from '@/services/document.service';
import { DocumentCategoryEnum, type Document, type DocumentUploadParams } from '@/types/document.types';
```

## Document Categories
```typescript
DocumentCategoryEnum.COTIZATII    // Membership fees (temporal)
DocumentCategoryEnum.DONATII      // Donations (temporal)
DocumentCategoryEnum.ACTIVITATI   // Activities (temporal)
DocumentCategoryEnum.FINANCIAR    // Financial transactions (temporal)
DocumentCategoryEnum.MEMBRI       // Member documents (permanent)
DocumentCategoryEnum.ENTITATI     // Entity documents (permanent)
DocumentCategoryEnum.ORGANIZATIE  // Organization documents (permanent)
DocumentCategoryEnum.TEMPLATE     // Templates (permanent)
DocumentCategoryEnum.PROIECTE     // Projects (hybrid - can be both)
```

## API Methods

### 1. Upload Document
```typescript
const document = await documentService.upload({
  file: File,                    // Required: File object from input
  category: DocumentCategory,    // Required: One of DocumentCategoryEnum values
  
  // Context parameters (provide relevant ones based on category):
  membershipFeeId?: string,      // For COTIZATII category
  entityDonationId?: string,     // For DONATII category
  entityId?: string,             // For ENTITATI category
  projectId?: string,            // For PROIECTE category
  activityId?: string,           // For ACTIVITATI category
  userId?: string,               // For MEMBRI category
  
  // Optional metadata:
  subcategory?: string,          // E.g., 'facturi', 'contracte'
  isTemporal?: boolean,          // For PROIECTE: true for temporal paths
  description?: string,          // Document description
  tags?: string[],               // Searchable tags
});
```

**Examples:**

```typescript
// Upload membership fee proof
const cotizatieDoc = await documentService.upload({
  file: selectedFile,
  category: DocumentCategoryEnum.COTIZATII,
  membershipFeeId: fee.id,
  description: 'Dovadă cotizație ianuarie 2026',
});

// Upload project contract (permanent)
const contractDoc = await documentService.upload({
  file: selectedFile,
  category: DocumentCategoryEnum.PROIECTE,
  projectId: project.id,
  isTemporal: false,
  subcategory: 'contracte',
  description: 'Contract finanțare',
});

// Upload project invoice (temporal)
const invoiceDoc = await documentService.upload({
  file: selectedFile,
  category: DocumentCategoryEnum.PROIECTE,
  projectId: project.id,
  isTemporal: true,
  subcategory: 'facturi',
  description: 'Factură materiale',
});

// Upload member CV (permanent)
const cvDoc = await documentService.upload({
  file: selectedFile,
  category: DocumentCategoryEnum.MEMBRI,
  userId: member.id,
  description: 'CV membru',
});
```

### 2. List Documents
```typescript
const documents = await documentService.list({
  // Filter by category and context:
  category?: DocumentCategory,
  subcategory?: string,
  membershipFeeId?: string,
  entityDonationId?: string,
  entityId?: string,
  projectId?: string,
  activityId?: string,
  userId?: string,
  
  // Filter by date (for temporal documents):
  year?: number,
  month?: number,
  
  // Filter by type:
  isPermanent?: boolean,
  fileType?: string,  // E.g., 'application/pdf', 'image/jpeg'
});
```

**Examples:**

```typescript
// Get all cotizații documents
const cotizatiiDocs = await documentService.list({
  category: DocumentCategoryEnum.COTIZATII,
});

// Get all documents for specific project
const projectDocs = await documentService.list({
  projectId: project.id,
});

// Get all invoices for project in January 2026
const januaryInvoices = await documentService.list({
  projectId: project.id,
  subcategory: 'facturi',
  year: 2026,
  month: 1,
});

// Get all permanent organization documents
const orgDocs = await documentService.list({
  category: DocumentCategoryEnum.ORGANIZATIE,
  isPermanent: true,
});

// Get all PDF documents for member
const memberPDFs = await documentService.list({
  userId: member.id,
  fileType: 'application/pdf',
});
```

### 3. Get Document by ID
```typescript
const document = await documentService.getById(documentId);
```

### 4. Download Document
```typescript
// Automatically downloads file to user's browser
await documentService.download(documentId);
```

**Example with UI:**
```typescript
const handleDownload = async (doc: Document) => {
  try {
    await documentService.download(doc.id);
    showToast.success(t('toast.document.download_success'));
  } catch (error: any) {
    const message = error?.message || t('toast.document.download_error');
    const translatedMessage = message.includes('.') ? t(message) : message;
    showToast.error(translatedMessage);
  }
};
```

### 5. Delete Document
```typescript
await documentService.delete(documentId);
```

**Example with confirmation:**
```typescript
const handleDelete = async (doc: Document) => {
  if (window.confirm(t('label.document.confirm_delete'))) {
    try {
      await documentService.delete(doc.id);
      showToast.success(t('toast.document.delete_success'));
      refreshDocuments();
    } catch (error: any) {
      const message = error?.message || t('toast.document.delete_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    }
  }
};
```

## Document Interface
```typescript
interface Document {
  id: string;
  fileName: string;
  filePath: string;            // R2 path (for reference)
  fileSize: number;            // In bytes
  fileType: string;            // MIME type
  year?: number;               // Auto-populated for temporal docs
  month?: number;              // Auto-populated for temporal docs
  day?: number;                // Auto-populated for temporal docs
  organization: string;
  uploadedBy: string;
  uploadedByName: string;
  category: DocumentCategory;
  subcategory?: string;
  isPermanent: boolean;        // Auto-populated based on category
  
  // Relationship info (populated if applicable):
  membershipFee?: string;
  membershipFeeInfo?: { id: string; memberName: string };
  entityDonation?: string;
  entityDonationInfo?: { id: string; entityName: string; amount: number };
  entity?: string;
  entityName?: string;
  project?: string;
  projectName?: string;
  activity?: string;
  activityName?: string;
  user?: string;
  userName?: string;
  
  description?: string;
  tags?: string[];
  createdAt: string;
  downloadUrl: string;         // Signed URL from R2
}
```

## Complete Component Example

```typescript
import React, { useState, useEffect } from 'react';
import { documentService } from '@/services/document.service';
import { DocumentCategoryEnum, type Document } from '@/types/document.types';
import { useTranslation } from 'react-i18next';
import { showToast } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DocumentManagerProps {
  projectId: string;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ projectId }) => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.list({ projectId });
      setDocuments(docs);
    } catch (error: any) {
      const message = error?.message || t('toast.document.load_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [projectId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      await documentService.upload({
        file: selectedFile,
        category: DocumentCategoryEnum.PROIECTE,
        projectId,
        isTemporal: true,
        subcategory: 'facturi',
      });
      showToast.success(t('toast.document.upload_success'));
      setSelectedFile(null);
      loadDocuments();
    } catch (error: any) {
      const message = error?.message || t('toast.document.upload_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      await documentService.download(doc.id);
    } catch (error: any) {
      const message = error?.message || t('toast.document.download_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
      showToast.error(translatedMessage);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (window.confirm(t('label.document.confirm_delete'))) {
      try {
        await documentService.delete(doc.id);
        showToast.success(t('toast.document.delete_success'));
        loadDocuments();
      } catch (error: any) {
        const message = error?.message || t('toast.document.delete_error');
        const translatedMessage = message.includes('.') ? t(message) : message;
        showToast.error(translatedMessage);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input type="file" onChange={handleFileSelect} />
        <Button onClick={handleUpload} disabled={!selectedFile || loading}>
          {t('label.document.upload')}
        </Button>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-4 border rounded">
            <div>
              <p className="font-medium">{doc.fileName}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(doc.fileSize)} • {doc.uploadedByName} • {doc.createdAt}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleDownload(doc)}>
                {t('label.document.download')}
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(doc)}>
                {t('label.document.delete')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Error Handling
All methods follow the standardized error format with i18n translation keys:

```typescript
try {
  await documentService.upload(...);
} catch (error: any) {
  const message = error?.message || t('toast.document.default_error');
  const translatedMessage = message.includes('.') ? t(message) : message;
  showToast.error(translatedMessage);
}
```

## Storage Architecture
- **Permanent documents** (MEMBRI, ENTITATI, ORGANIZATIE, TEMPLATE): `org123/membri/user456/cv.pdf`
- **Temporal documents** (COTIZATII, DONATII, ACTIVITATI, FINANCIAR): `org123/temporal/2026/01/cotizatii/fee111/dovada.pdf`
- **Hybrid projects** (PROIECTE): 
  - Permanent: `org123/proiecte/proj333/contract.pdf`
  - Temporal: `org123/proiecte/proj333/temporal/2026/01/facturi/factura.pdf`

## Notes
- **Case Conversion**: Automatic camelCase ↔ snake_case via `convertKeysToCamelCase` utility
- **File Upload**: Uses `FormData` with `multipart/form-data` content type
- **Download**: Automatically triggers browser download with original filename
- **Authentication**: Uses `getAuthHeader()` from keycloak.service
- **Signed URLs**: Backend generates R2 signed URLs (1 hour expiration)
- **Database Queries**: Always query database for list/search, never scan R2 storage
