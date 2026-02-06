import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Project } from '@/types/project.types';
import { Document, DocumentCategoryEnum } from '@/types/document.types';
import { documentService } from '@/services/document.service';
import { PrimaryActionButton } from '@/components/ui/PrimaryActionButton';
import { ActionButton } from '@/components/ui/ActionButton';
import { ActionButtonGroup } from '@/components/ui/ActionButtonGroup';
import { EyeIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/react/24/outline';
import showToast from '@/components/ui/Toast';
import { DocumentViewer } from '@/components/modals/DocumentViewer';
import { t } from 'i18next';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ProjectDetailsTabProps {
    project: Project;
}

export const ProjectDetailsTab: React.FC<ProjectDetailsTabProps> = ({ project }) => {
    const confirm = useConfirmDialog();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'DRAFT': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Activ';
            case 'COMPLETED': return 'Finalizat';
            case 'ON_HOLD': return 'Suspendat';
            case 'CANCELLED': return 'Anulat';
            case 'DRAFT': return 'Draft';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('ro-RO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
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

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const loadDocuments = async () => {
        try {
            setLoadingDocs(true);
            const docs = await documentService.list({
                projectId: project.id,
                category: DocumentCategoryEnum.PROIECTE
            });
            setDocuments(docs);
        } catch (error: any) {
            const message = error?.message || t('toast.document.load_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setLoadingDocs(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, [project.id]);

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
                    projectId: project.id,
                    isTemporal: false
                });
            }

            showToast.success(t('toast.document.upload_success'));
            loadDocuments();
            
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
        } catch (error: any) {
            const message = error?.message || t('toast.document.delete_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        }
    };

    return (
        <>
            <Card title="Informații generale" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Nume proiect
                        </label>
                        <p className="text-gray-900">{project.name}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Categorie
                        </label>
                        <p className="text-gray-900">{project.category || 'N/A'}</p>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Descriere
                        </label>
                        <p className="text-gray-900">{project.description || 'Fără descriere'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Locație
                        </label>
                        <p className="text-gray-900">{project.location || 'N/A'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Status
                        </label>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(project.status)}`}>
                            {getStatusLabel(project.status)}
                        </span>
                    </div>
                </div>

                {/* Documente Proiect Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Documente Proiect</h3>
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

                    {loadingDocs ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">📄</div>
                            <p>Nu există documente încărcate</p>
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
                </div>
            </Card>

            <Card title="Planificare" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Data de început
                        </label>
                        <p className="text-gray-900">{formatDate(project.startingDate)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Data de sfârșit
                        </label>
                        <p className="text-gray-900">{formatDate(project.endingDate)}</p>
                    </div>
                </div>
            </Card>

            <Card title="Buget" className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t('label.project.planned_budget')}
                        </label>
                        <p className="text-gray-900 text-2xl font-semibold">
                            {project.budget?.toLocaleString('ro-RO')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Moneda
                        </label>
                        <p className="text-gray-900">{project.currency || 'RON'}</p>
                    </div>

                    {project.budgetNotes && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Note buget
                            </label>
                            <p className="text-gray-900">{project.budgetNotes}</p>
                        </div>
                    )}
                </div>

                {project.activeFunds !== 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_funds')}
                            </label>
                            <p className="text-gray-900 text-2xl font-semibold">
                                {project.activeFunds?.toLocaleString('ro-RO')} {project.currency || 'RON'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_funds_on_planned_budget')}
                            </label>
                            {(() => {
                                const percentage = project.budget ? (project.activeFunds / project.budget * 100).toFixed(1) : 0;
                                const isAdequate = project.activeFunds >= project.budget;
                                return (
                                    <p className={`text-2xl font-semibold ${isAdequate ? 'text-green-600' : 'text-red-600'}`}>
                                        {percentage}%
                                    </p>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {project.activeExpenses !== 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_expenses')}
                            </label>
                            <p className="text-gray-900 text-2xl font-semibold">
                                {project.activeExpenses?.toLocaleString('ro-RO')} {project.currency || 'RON'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_expenses_on_active_funds')}
                            </label>
                            {(() => {
                                const percentage = project.activeFunds ? (project.activeExpenses / project.activeFunds * 100).toFixed(1) : 0;
                                const isWithinBudget = project.activeExpenses < project.activeFunds;
                                return (
                                    <p className={`text-2xl font-semibold ${isWithinBudget ? 'text-green-600' : 'text-red-600'}`}>
                                        {percentage}%
                                    </p>
                                );
                            })()}
                        </div>
                        <div></div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                {t('label.project.active_expenses_on_planned_budget')}
                            </label>
                            {(() => {
                                const percentage = project.budget ? (project.activeExpenses / project.budget * 100).toFixed(1) : '0';
                                const percentageNum = parseFloat(percentage);
                                let colorClass = 'text-blue-600';

                                if (percentageNum >= 90) {
                                    colorClass = 'text-orange-600';
                                } else if (percentageNum >= 75) {
                                    colorClass = 'text-amber-600';
                                } else if (percentageNum >= 50) {
                                    colorClass = 'text-yellow-600';
                                }

                                return (
                                    <p className={`text-2xl font-semibold ${colorClass}`}>
                                        {percentage}%
                                    </p>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </Card>

            {selectedDocument && (
                <DocumentViewer
                    document={selectedDocument}
                    onClose={() => setSelectedDocument(null)}
                />
            )}
        </>
    );
};