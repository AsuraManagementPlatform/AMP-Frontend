import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ActionButton } from '@/components/ui/ActionButton';
import { ActionButtonGroup } from '@/components/ui/ActionButtonGroup';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { DocumentViewer } from '@/components/modals/DocumentViewer';
import { EyeIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { documentService } from '@/services/document.service';
import { Document, DocumentCategoryEnum } from '@/types/document.types';
import showToast from '@/components/ui/Toast';
import { t } from 'i18next';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ProjectFundDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectFundId: string;
    projectId: string;
    fundSourceName: string;
    onDocumentsChange?: () => void;
}

export const ProjectFundDocumentsModal: React.FC<ProjectFundDocumentsModalProps> = ({
    isOpen,
    onClose,
    projectFundId,
    projectId,
    fundSourceName,
    onDocumentsChange
}) => {
    const confirm = useConfirmDialog();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const docs = await documentService.list({
                projectFundId: projectFundId,
                category: DocumentCategoryEnum.PROIECTE
            });
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
        if (isOpen) {
            loadDocuments();
        }
    }, [isOpen, projectFundId]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        handleUploadFiles(Array.from(files));
    };

    const handleUploadFiles = async (files: File[]) => {
        try {
            setUploading(true);

            for (const file of files) {
                await documentService.upload({
                    file: file,
                    category: DocumentCategoryEnum.PROIECTE,
                    projectId: projectId,
                    projectFundId: projectFundId,
                    isTemporal: false
                });
            }

            showToast.success(t('toast.document.upload_success'));
            loadDocuments();
            onDocumentsChange?.();
            
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error: any) {
            const message = error?.message || t('toast.document.upload_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleView = (doc: Document) => {
        setSelectedDocument(doc);
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
            showToast.success(t('toast.document.delete_success'));
            loadDocuments();
            onDocumentsChange?.();
        } catch (error: any) {
            const message = error?.message || t('toast.document.delete_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={`Documente - ${fundSourceName}`}
                size="xl"
            >
                <div className="mb-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Total documente: <span className="font-semibold">{documents.length}</span>
                    </p>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                        />
                        <PrimaryActionButton
                            onClick={() => fileInputRef.current?.click()}
                            size="sm"
                            disabled={uploading}
                        >
                            {uploading ? 'Se încarcă...' : '+ Adaugă Document'}
                        </PrimaryActionButton>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-5xl mb-3">📄</div>
                        <p className="text-lg">Nu există documente încărcate</p>
                        <p className="text-sm mt-2">Adăugați dovezi de plată, facturi sau alte documente relevante</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nume fișier
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dimensiune
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Încărcat de
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data încărcării
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acțiuni
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-2">
                                                    {documentService.getFileIcon(doc.fileType)}
                                                </span>
                                                <span className="text-sm text-gray-900">{doc.fileName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {formatFileSize(doc.fileSize)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {doc.uploadedByName}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {formatDateTime(doc.createdAt)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <ActionButtonGroup>
                                                <ActionButton
                                                    variant="custom"
                                                    icon={EyeIcon}
                                                    onClick={() => handleView(doc)}
                                                    title="Vizualizează"
                                                />
                                                <ActionButton
                                                    variant="custom"
                                                    icon={ArrowDownTrayIcon}
                                                    onClick={() => handleDownload(doc)}
                                                    title="Descarcă"
                                                />
                                                <ActionButton
                                                    variant="custom"
                                                    icon={TrashIcon}
                                                    onClick={() => handleDelete(doc)}
                                                    title="Șterge"
                                                />
                                            </ActionButtonGroup>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>

            {selectedDocument && (
                <DocumentViewer
                    document={selectedDocument}
                    onClose={() => setSelectedDocument(null)}
                />
            )}
        </>
    );
};
