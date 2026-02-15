import React, { useState, useEffect } from 'react';
import { Document } from '@/types/document.types';
import { documentService } from '@/services/document.service';
import { ActionButton } from '@/components/ui/ActionButton';
import { ActionButtonGroup } from '@/components/ui/ActionButtonGroup';
import { ArrowDownTrayIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose }) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canPreview = documentService.canPreview(document.fileType);

  useEffect(() => {
    if (!canPreview) {
      setLoading(false);
      return;
    }

    const loadPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        const blob = await documentService.getPreviewBlob(document.id);

        if (document.fileType.startsWith('text/')) {
          const text = await blob.text();
          setTextContent(text);
        } else {
          const url = window.URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      } catch (err: any) {
        const message = err?.message || t('toast.document.preview_error');
        const translatedMessage = message.includes('.') ? t(message) : message;
        setError(translatedMessage);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [document.id, document.fileType, canPreview, t]);

  const handleDownload = async () => {
    try {
      await documentService.download(document.id);
    } catch (err: any) {
      const message = err?.message || t('toast.document.download_error');
      const translatedMessage = message.includes('.') ? t(message) : message;
    }
  };

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col pointer-events-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold truncate">{document.fileName}</h2>
            <p className="text-sm text-gray-500">
              {formatFileSize(document.fileSize)} • {document.uploadedByName}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <ActionButtonGroup>
              {canPreview && previewUrl && (
                <ActionButton
                  variant="custom"
                  icon={ArrowTopRightOnSquareIcon}
                  onClick={handleOpenInNewTab}
                  title={t('label.document.open_new_tab')}
                />
              )}
              <ActionButton
                variant="custom"
                icon={ArrowDownTrayIcon}
                onClick={handleDownload}
                title={t('label.document.download')}
              />
              <ActionButton
                variant="custom"
                icon={XMarkIcon}
                onClick={onClose}
                title={t('label.common.close')}
              />
            </ActionButtonGroup>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">{t('label.document.loading_preview')}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <p className="text-gray-700 mb-4">{error}</p>
                <ActionButton
                  variant="download"
                  icon={ArrowDownTrayIcon}
                  onClick={handleDownload}
                  title={t('label.document.download')}
                />
              </div>
            </div>
          )}

          {!loading && !error && !canPreview && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">
                  {documentService.getFileIcon(document.fileType)}
                </div>
                <h3 className="text-xl font-semibold mb-2">{document.fileName}</h3>
                <p className="text-gray-600 mb-6">
                  {t('label.document.preview_not_available')}
                </p>
                <ActionButton
                  variant="download"
                  icon={ArrowDownTrayIcon}
                  onClick={handleDownload}
                  title={t('label.document.download')}
                />
              </div>
            </div>
          )}

          {!loading && !error && canPreview && (
            <>
              {document.fileType === 'application/pdf' && previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0 rounded"
                  title={document.fileName}
                />
              )}

              {document.fileType.startsWith('image/') && previewUrl && (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={previewUrl}
                    alt={document.fileName}
                    className="max-w-full max-h-full object-contain rounded shadow-lg"
                  />
                </div>
              )}

              {document.fileType.startsWith('text/') && textContent && (
                <div className="bg-white p-6 rounded shadow">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {textContent}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        {document.description && (
          <div className="p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-700">
              <strong>{t('label.document.description')}:</strong> {document.description}
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
