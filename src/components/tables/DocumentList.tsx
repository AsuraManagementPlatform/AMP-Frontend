import React, { useState, useEffect } from 'react';
import { Document, DocumentListParams } from '@/types/document.types';
import { documentService } from '@/services/document.service';
import { DocumentViewer } from '@/components/modals/DocumentViewer';
import { ActionButton } from '@/components/ui/ActionButton';
import { ActionButtonGroup } from '@/components/ui/ActionButtonGroup';
import { EyeIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

interface DocumentListProps {
  filters?: DocumentListParams;
  onRefresh?: () => void;
  showActions?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  filters,
  onRefresh,
  showActions = true,
}) => {
  const { t } = useTranslation();
  const confirm = useConfirmDialog();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.list(filters);
      setDocuments(docs);
    } catch (error: any) {
      const message = error?.message || t('toast.document.load_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [filters]);

  const handleView = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleDownload = async (doc: Document) => {
    try {
      await documentService.download(doc.id);
    } catch (error: any) {
      const message = error?.message || t('toast.document.download_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
    }
  };

  const handleDelete = async (doc: Document) => {
    const confirmed = await confirm({
      title: t('label.document.delete_title'),
      message: t('label.document.confirm_delete'),
      confirmText: t('button.confirm'),
      cancelText: t('button.cancel'),
      confirmButtonVariant: 'danger'
    });
    if (!confirmed) return;

    try {
      await documentService.delete(doc.id);
      loadDocuments();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      const message = error?.message || t('toast.document.delete_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📄</div>
        <p className="text-gray-500">{t('label.document.no_documents')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-2xl">
                {documentService.getFileIcon(doc.fileType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.fileName}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>•</span>
                  <span>{doc.uploadedByName}</span>
                  <span>•</span>
                  <span>{formatDate(doc.createdAt)}</span>
                  {doc.subcategory && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {doc.subcategory}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {showActions && (
              <ActionButtonGroup>
                <ActionButton
                  variant="custom"
                  icon={EyeIcon}
                  onClick={() => handleView(doc)}
                  title={t('label.document.view')}
                />
                <ActionButton
                  variant="custom"
                  icon={ArrowDownTrayIcon}
                  onClick={() => handleDownload(doc)}
                  title={t('label.document.download')}
                />
                <ActionButton
                  variant="custom"
                  icon={TrashIcon}
                  onClick={() => handleDelete(doc)}
                  title={t('label.document.delete')}
                />
              </ActionButtonGroup>
            )}
          </div>
        ))}
      </div>

      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </>
  );
};
