import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormModal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card } from '@/components/ui/Card';
import { ActionButton } from '@/components/ui/ActionButton';
import { ActionButtonGroup } from '@/components/ui/ActionButtonGroup';
import showToast from '@/components/ui/Toast';
import generalAssemblyService from '@/services/general-assembly.service';
import { DocumentViewer } from '@/components/modals/DocumentViewer';
import { Document } from '@/types/document.types';
import { 
    GeneralAssemblyDetail, 
    GeneralAssemblyParticipant,
    AgendaItemInput,
    VoteChoice,
    AgendaItemDocument,
    OrganizationMember
} from '@/types/general-assembly.types';
import { useAuth } from '@/hooks/useAuth';
import { UserGroup } from '@/types/index.types';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Paperclip, Download, Pencil, X, Save } from 'lucide-react';

interface GeneralAssemblyDetailModalProps {
    assemblyId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

export const GeneralAssemblyDetailModal = ({ assemblyId, isOpen, onClose, onUpdated }: GeneralAssemblyDetailModalProps) => {
    const { t } = useTranslation();
    const { hasAnyUserGroup } = useAuth();
    const confirm = useConfirmDialog();
    const [assembly, setAssembly] = useState<GeneralAssemblyDetail | null>(null);
    const [participants, setParticipants] = useState<GeneralAssemblyParticipant[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'participants' | 'results'>('details');
    const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStartDate, setEditStartDate] = useState('');
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editAgendaItems, setEditAgendaItems] = useState<AgendaItemInput[]>([]);
    const [notifyParticipants, setNotifyParticipants] = useState(true);
    const [votes, setVotes] = useState<Record<string, VoteChoice>>({});
    const [isVoting, setIsVoting] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [allMembers, setAllMembers] = useState<OrganizationMember[]>([]);
    const [addParticipantSearch, setAddParticipantSearch] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isAddingParticipants, setIsAddingParticipants] = useState(false);

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);
    const canModify = isOrgAdmin && (assembly?.status === 'DRAFT' || assembly?.status === 'SCHEDULED');
    const canDelete = isOrgAdmin && (assembly?.status === 'DRAFT' || assembly?.status === 'SCHEDULED');
    const canEdit = isOrgAdmin && (assembly?.status === 'DRAFT' || assembly?.status === 'SCHEDULED');
    const canVote = assembly?.status === 'IN_PROGRESS' && 
                    assembly?.currentUserParticipant && 
                    !assembly?.currentUserParticipant?.hasVoted;
    const hasVotingItems = assembly?.agendaItems.some(item => item.requiresVote) ?? false;

    const timeOptions = useMemo(() => {
        const options: string[] = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                options.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
            }
        }
        return options;
    }, []);

    useEffect(() => {
        if (isOpen && assemblyId) {
            loadAssembly();
        }
    }, [isOpen, assemblyId]);

    useEffect(() => {
        if (isOpen && activeTab === 'participants' && allMembers.length === 0) {
            loadAllMembers();
        }
    }, [isOpen, activeTab]);

    const loadAssembly = async () => {
        if (!assemblyId) return;
        try {
            setLoading(true);
            const data = await generalAssemblyService.getById(assemblyId);
            let participantsData: GeneralAssemblyParticipant[] = [];
            
            if (isOrgAdmin) {
                participantsData = await generalAssemblyService.getParticipants(assemblyId);
                
                if (data.status === 'ARCHIVED' && (data.agendaItems?.length === 0 || participantsData.length === 0)) {
                    try {
                        const cloudData = await generalAssemblyService.getArchivedData(assemblyId);
                        data.agendaItems = cloudData.agendaItems;
                        data.participantCount = cloudData.participantCount;
                        data.openedCount = cloudData.openedCount;
                        data.votedCount = cloudData.votedCount;
                        participantsData = cloudData.participants;
                    } catch {
                    }
                }
            }
            
            setAssembly(data);
            setParticipants(participantsData);
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.load_error');
            showToast.error(message.includes('.') ? t(message) : message);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const loadAllMembers = async () => {
        try {
            const members = await generalAssemblyService.getAllMembers();
            setAllMembers(members);
        } catch {
        }
    };

    const handleAddParticipant = async (userId: string) => {
        if (!assemblyId) return;
        try {
            setIsAddingParticipants(true);
            const updatedParticipants = await generalAssemblyService.addParticipants(assemblyId, [userId]);
            setParticipants(updatedParticipants);
            setAddParticipantSearch('');
            if (assembly) {
                setAssembly({
                    ...assembly,
                    participantCount: updatedParticipants.length
                });
            }
            showToast.success(t('toast.general_assembly.participant_added'));
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.add_participant_error');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setIsAddingParticipants(false);
        }
    };

    const participantUserIds = useMemo(() => new Set(participants.map(p => p.userId)), [participants]);

    const filteredMembersForAdd = useMemo(() => {
        const term = addParticipantSearch.toLowerCase().trim();
        return allMembers.filter(m => 
            !participantUserIds.has(m.id) &&
            (m.fullName.toLowerCase().includes(term) || m.email.toLowerCase().includes(term))
        );
    }, [allMembers, addParticipantSearch, participantUserIds]);

    const handleClose = async () => {
        if (!assemblyId) return;
        try {
            await generalAssemblyService.close(assemblyId);
            showToast.success(t('toast.general_assembly.close_success'));
            onUpdated();
            loadAssembly();
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.close_error');
            showToast.error(message.includes('.') ? t(message) : message);
        }
    };

    const handleArchive = async () => {
        if (!assemblyId) return;
        try {
            await generalAssemblyService.archive(assemblyId);
            showToast.success(t('toast.general_assembly.archive_success'));
            onUpdated();
            onClose();
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.archive_error');
            showToast.error(message.includes('.') ? t(message) : message);
        }
    };

    const handleDelete = async () => {
        if (!assemblyId) return;
        
        const confirmed = await confirm({
            title: t('label.general_assembly.delete_title'),
            message: t('label.general_assembly.delete_confirm'),
            confirmText: t('button.confirm'),
            cancelText: t('button.cancel'),
            confirmButtonVariant: 'danger'
        });
        if (!confirmed) return;
        
        try {
            setIsDeleting(true);
            await generalAssemblyService.deleteAssembly(assemblyId);
            showToast.success(t('toast.general_assembly.delete_success'));
            onUpdated();
            onClose();
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.delete_error');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        if (!assemblyId || !assembly) {
            return;
        }
        try {
            const blob = await generalAssemblyService.downloadReport(assemblyId, format);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meeting_report_${assembly.title.replace(/\s+/g, '_').slice(0, 50)}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast.success(t('toast.general_assembly.export_success'));
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.export_error');
            showToast.error(message.includes('.') ? t(message) : message);
        }
    };

    const handleFileUpload = async (agendaItemId: string, file: File) => {
        setUploadingItemId(agendaItemId);
        try {
            await generalAssemblyService.uploadAgendaItemDocument(agendaItemId, file);
            showToast.success(t('toast.general_assembly.document_upload_success'));
            loadAssembly();
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.document_upload_error');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setUploadingItemId(null);
        }
    };

    const handleDeleteDocument = async (agendaItemId: string, documentId: string) => {
        try {
            await generalAssemblyService.deleteAgendaItemDocument(agendaItemId, documentId);
            showToast.success(t('toast.general_assembly.document_delete_success'));
            loadAssembly();
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.document_delete_error');
            showToast.error(message.includes('.') ? t(message) : message);
        }
    };

    const handleViewDocument = (doc: AgendaItemDocument) => {
        const documentForViewer: Document = {
            id: doc.id,
            fileName: doc.fileName,
            filePath: '',
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            organization: '',
            uploadedBy: '',
            uploadedByName: doc.uploadedByName || '',
            category: 'organizatie',
            isPermanent: false,
            createdAt: doc.createdAt,
            downloadUrl: '',
        };
        setSelectedDocument(documentForViewer);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleVoteChange = (agendaItemId: string, vote: VoteChoice) => {
        setVotes(prev => ({ ...prev, [agendaItemId]: vote }));
    };

    const handleSubmitVotes = async () => {
        if (!assemblyId || !assembly) return;
        
        const votingItems = assembly.agendaItems.filter(item => item.requiresVote);
        const missingVotes = votingItems.filter(item => !votes[item.id]);
        
        if (missingVotes.length > 0) {
            showToast.error(t('toast.general_assembly.vote_all_required'));
            return;
        }

        try {
            setIsVoting(true);
            await generalAssemblyService.submitVotes(assemblyId, { votes });
            showToast.success(t('toast.general_assembly.vote_success'));
            setVotes({});
            onUpdated();
            loadAssembly();
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.vote_error');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setIsVoting(false);
        }
    };

    const startEditing = () => {
        if (!assembly) return;
        const startDt = new Date(assembly.startDate);
        const endDt = new Date(assembly.endDate);
        
        setEditTitle(assembly.title);
        setEditDescription(assembly.description || '');
        setEditStartDate(startDt.toISOString().split('T')[0]);
        setEditStartTime(`${startDt.getHours().toString().padStart(2, '0')}:${startDt.getMinutes().toString().padStart(2, '0')}`);
        setEditEndDate(endDt.toISOString().split('T')[0]);
        setEditEndTime(`${endDt.getHours().toString().padStart(2, '0')}:${endDt.getMinutes().toString().padStart(2, '0')}`);
        setEditLocation(assembly.location || '');
        setEditAgendaItems(assembly.agendaItems.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            requiresVote: item.requiresVote
        })));
        setNotifyParticipants(true);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
    };

    const updateEditAgendaItem = (index: number, field: keyof AgendaItemInput, value: string | boolean) => {
        setEditAgendaItems(prev => prev.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const addEditAgendaItem = () => {
        setEditAgendaItems(prev => [...prev, { title: '', description: '', requiresVote: false }]);
    };

    const removeEditAgendaItem = (index: number) => {
        if (editAgendaItems.length > 1) {
            setEditAgendaItems(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSaveEdit = async () => {
        if (!assemblyId || !assembly) return;
        
        if (!editTitle.trim()) {
            showToast.error(t('toast.general_assembly.title_required'));
            return;
        }

        const validAgendaItems = editAgendaItems.filter(item => item.title.trim());
        if (validAgendaItems.length === 0) {
            showToast.error(t('toast.general_assembly.agenda_required'));
            return;
        }

        try {
            setIsSaving(true);
            await generalAssemblyService.updateAssembly(assemblyId, {
                title: editTitle.trim(),
                description: editDescription.trim() || undefined,
                startDate: new Date(`${editStartDate}T${editStartTime}`).toISOString(),
                endDate: new Date(`${editEndDate}T${editEndTime}`).toISOString(),
                location: editLocation.trim() || undefined,
                agendaItems: validAgendaItems,
                notifyParticipants
            });
            
            showToast.success(t('toast.general_assembly.update_success'));
            setIsEditing(false);
            onUpdated();
            loadAssembly();
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.update_error');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!assembly) {
        return null;
    }

    const statusColors: Record<string, string> = {
        DRAFT: 'bg-gray-100 text-gray-800',
        SCHEDULED: 'bg-blue-100 text-blue-800',
        IN_PROGRESS: 'bg-green-100 text-green-800',
        CLOSED: 'bg-yellow-100 text-yellow-800',
        ARCHIVED: 'bg-gray-100 text-gray-600',
    };

    return (
        <>
        <FormModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={assembly.title}
            size="xl"
        >
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[assembly.status]}`}>
                            {t(`label.general_assembly.status_${assembly.status.toLowerCase()}`)}
                        </span>
                        <span className="text-sm text-gray-500">
                            {t(`label.general_assembly.meeting_type_${assembly.meetingType.toLowerCase()}`)}
                        </span>
                    </div>

                    <div className="border-b">
                        <nav className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'details' 
                                        ? 'border-orange-500 text-orange-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t('label.general_assembly.tab_details')}
                            </button>
                            {isOrgAdmin && (
                                <>
                                    <button
                                        onClick={() => setActiveTab('participants')}
                                        className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                                            activeTab === 'participants' 
                                                ? 'border-orange-500 text-orange-600' 
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {t('label.general_assembly.tab_participants')} ({assembly.participantCount})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('results')}
                                        className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                                            activeTab === 'results' 
                                                ? 'border-orange-500 text-orange-600' 
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {t('label.general_assembly.tab_results')}
                                    </button>
                                </>
                            )}
                        </nav>
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto">
                        {activeTab === 'details' && !isEditing && (
                            <div className="space-y-4">
                                {canEdit && (
                                    <div className="flex justify-end">
                                        <Button 
                                            variant="outline" 
                                            onClick={startEditing}
                                            className="flex items-center gap-1"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            {t('label.general_assembly.edit_assembly')}
                                        </Button>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">{t('label.general_assembly.start_date')}</p>
                                        <p className="font-medium">{new Date(assembly.startDate).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">{t('label.general_assembly.end_date')}</p>
                                        <p className="font-medium">{new Date(assembly.endDate).toLocaleString()}</p>
                                    </div>
                                    {assembly.meetingType === 'IN_PERSON' && assembly.location && (
                                        <div className="sm:col-span-2">
                                            <p className="text-sm text-gray-500">{t('label.general_assembly.location')}</p>
                                            <p className="font-medium">{assembly.location}</p>
                                        </div>
                                    )}
                                    {assembly.meetingType === 'ONLINE' && assembly.meetUrl && (
                                        <div className="sm:col-span-2">
                                            <p className="text-sm text-gray-500">{t('label.general_assembly.meet_link')}</p>
                                            <a href={assembly.meetUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline break-all">
                                                {assembly.meetUrl}
                                            </a>
                                            {assembly.meetPassword && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {t('label.general_assembly.meet_password')}: <span className="font-mono">{assembly.meetPassword}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {assembly.description && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">{t('label.general_assembly.description')}</p>
                                        <p className="text-gray-700">{assembly.description}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">{t('label.general_assembly.agenda_items')}</p>
                                    <div className="space-y-2">
                                        {assembly.agendaItems.map((item, index) => (
                                            <Card key={item.id} className="p-3">
                                                <div className="flex items-start gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                                                        {index + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium">{item.title}</p>
                                                            {item.requiresVote && (
                                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                                    {t('label.general_assembly.requires_vote')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.description && (
                                                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                                        )}
                                                        
                                                        {item.documents && item.documents.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                {item.documents.map((doc) => (
                                                                    <div key={doc.id} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                                                        <span className="flex-1 truncate">{doc.fileName}</span>
                                                                        <span className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</span>
                                                                        <ActionButtonGroup>
                                                                            <ActionButton
                                                                                variant="view"
                                                                                icon={EyeIcon}
                                                                                onClick={() => handleViewDocument(doc)}
                                                                                title={t('label.document.view')}
                                                                            />
                                                                            {canModify && (
                                                                                <ActionButton
                                                                                    variant="delete"
                                                                                    icon={TrashIcon}
                                                                                    onClick={() => handleDeleteDocument(item.id, doc.id)}
                                                                                    title={t('label.document.delete')}
                                                                                />
                                                                            )}
                                                                        </ActionButtonGroup>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        {canModify && (
                                                            <div className="mt-2">
                                                                <label className="inline-flex items-center gap-1 text-xs text-orange-600 cursor-pointer hover:text-orange-700">
                                                                    <Paperclip className="w-3 h-3" />
                                                                    {uploadingItemId === item.id 
                                                                        ? t('label.general_assembly.uploading')
                                                                        : t('label.general_assembly.attach_document')
                                                                    }
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        disabled={uploadingItemId === item.id}
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                handleFileUpload(item.id, file);
                                                                                e.target.value = '';
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                            </div>
                                                        )}
                                                        
                                                        {canVote && item.requiresVote && (
                                                            <div className="mt-3 pt-3 border-t">
                                                                <p className="text-sm text-gray-700 mb-2">{t('label.general_assembly.your_vote')}:</p>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant={votes[item.id] === 'YES' ? 'primary' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => handleVoteChange(item.id, 'YES')}
                                                                        className={votes[item.id] === 'YES' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                                    >
                                                                        {t('label.general_assembly.vote_yes')}
                                                                    </Button>
                                                                    <Button
                                                                        variant={votes[item.id] === 'NO' ? 'primary' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => handleVoteChange(item.id, 'NO')}
                                                                        className={votes[item.id] === 'NO' ? 'bg-red-600 hover:bg-red-700' : ''}
                                                                    >
                                                                        {t('label.general_assembly.vote_no')}
                                                                    </Button>
                                                                    <Button
                                                                        variant={votes[item.id] === 'ABSTAIN' ? 'primary' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => handleVoteChange(item.id, 'ABSTAIN')}
                                                                        className={votes[item.id] === 'ABSTAIN' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                                                                    >
                                                                        {t('label.general_assembly.vote_abstain')}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                    
                                    {canVote && hasVotingItems && (
                                        <div className="mt-4 pt-4 border-t">
                                            <Button 
                                                onClick={handleSubmitVotes} 
                                                disabled={isVoting}
                                                className="w-full"
                                            >
                                                {isVoting ? t('label.common.submitting') : t('label.general_assembly.submit_votes')}
                                            </Button>
                                        </div>
                                    )}
                                    
                                    {assembly.status === 'IN_PROGRESS' && assembly.currentUserParticipant?.hasVoted && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                                            <p className="text-green-700 font-medium">{t('label.general_assembly.already_voted')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'details' && isEditing && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium">{t('label.general_assembly.edit_mode')}</h3>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={cancelEditing}
                                            disabled={isSaving}
                                            className="flex items-center gap-1"
                                        >
                                            <X className="h-4 w-4" />
                                            {t('label.button.cancel')}
                                        </Button>
                                        <Button 
                                            onClick={handleSaveEdit}
                                            disabled={isSaving}
                                            className="flex items-center gap-1"
                                        >
                                            <Save className="h-4 w-4" />
                                            {isSaving ? t('label.common.saving') : t('label.button.save')}
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('label.general_assembly.title')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('label.general_assembly.description')}
                                    </label>
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('label.general_assembly.start_date')}
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={editStartDate}
                                                onChange={(e) => setEditStartDate(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                            />
                                            <select
                                                value={editStartTime}
                                                onChange={(e) => setEditStartTime(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                            >
                                                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('label.general_assembly.end_date')}
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="date"
                                                value={editEndDate}
                                                onChange={(e) => setEditEndDate(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                            />
                                            <select
                                                value={editEndTime}
                                                onChange={(e) => setEditEndTime(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                            >
                                                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {assembly.meetingType === 'IN_PERSON' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('label.general_assembly.location')}
                                        </label>
                                        <input
                                            type="text"
                                            value={editLocation}
                                            onChange={(e) => setEditLocation(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>
                                )}

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {t('label.general_assembly.agenda_items')}
                                        </label>
                                        <Button variant="outline" size="sm" onClick={addEditAgendaItem}>
                                            + {t('label.general_assembly.add_agenda_item')}
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {editAgendaItems.map((item, index) => (
                                            <Card key={index} className="p-3">
                                                <div className="flex gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                                                        {index + 1}
                                                    </span>
                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            type="text"
                                                            value={item.title}
                                                            onChange={(e) => updateEditAgendaItem(index, 'title', e.target.value)}
                                                            placeholder={t('label.general_assembly.agenda_item_title')}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                                                        />
                                                        <textarea
                                                            value={item.description}
                                                            onChange={(e) => updateEditAgendaItem(index, 'description', e.target.value)}
                                                            placeholder={t('label.general_assembly.agenda_item_description')}
                                                            rows={2}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 text-sm"
                                                        />
                                                        
                                                        {item.id && (
                                                            <div className="mt-2">
                                                                <label className="inline-flex items-center gap-1 text-xs text-orange-600 cursor-pointer hover:text-orange-700">
                                                                    <Paperclip className="w-3 h-3" />
                                                                    {uploadingItemId === item.id 
                                                                        ? t('label.general_assembly.uploading')
                                                                        : t('label.general_assembly.attach_document')
                                                                    }
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        disabled={uploadingItemId === item.id}
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file && item.id) {
                                                                                handleFileUpload(item.id, file);
                                                                                e.target.value = '';
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex justify-between items-center">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.requiresVote}
                                                                    onChange={(e) => updateEditAgendaItem(index, 'requiresVote', e.target.checked)}
                                                                    className="text-orange-500 focus:ring-orange-500 rounded"
                                                                />
                                                                <span className="text-sm text-gray-600">{t('label.general_assembly.requires_vote')}</span>
                                                            </label>
                                                            {editAgendaItems.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeEditAgendaItem(index)}
                                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                                >
                                                                    {t('label.button.remove')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t">
                                    <input
                                        type="checkbox"
                                        id="notifyParticipants"
                                        checked={notifyParticipants}
                                        onChange={(e) => setNotifyParticipants(e.target.checked)}
                                        className="text-orange-500 focus:ring-orange-500 rounded"
                                    />
                                    <label htmlFor="notifyParticipants" className="text-sm text-gray-600">
                                        {t('label.general_assembly.notify_participants')}
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'participants' && isOrgAdmin && (
                            <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <Card className="p-3 text-center">
                                        <p className="text-2xl font-bold text-gray-900">{assembly.participantCount}</p>
                                        <p className="text-xs text-gray-500">{t('label.general_assembly.total_participants')}</p>
                                    </Card>
                                    <Card className="p-3 text-center">
                                        <p className="text-2xl font-bold text-blue-600">{assembly.openedCount}</p>
                                        <p className="text-xs text-gray-500">{t('label.general_assembly.opened_link')}</p>
                                    </Card>
                                    <Card className="p-3 text-center">
                                        <p className="text-2xl font-bold text-green-600">{assembly.votedCount}</p>
                                        <p className="text-xs text-gray-500">{t('label.general_assembly.voted')}</p>
                                    </Card>
                                </div>

                                {canModify && (
                                    <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('label.general_assembly.add_participant')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={addParticipantSearch}
                                                onChange={(e) => setAddParticipantSearch(e.target.value)}
                                                onFocus={() => setIsSearchFocused(true)}
                                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                                placeholder={t('label.general_assembly.search_members_placeholder')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                                disabled={isAddingParticipants}
                                            />
                                            {isSearchFocused && addParticipantSearch.length > 0 && filteredMembersForAdd.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                    {filteredMembersForAdd.slice(0, 10).map(member => (
                                                        <div
                                                            key={member.id}
                                                            onClick={() => handleAddParticipant(member.id)}
                                                            className="p-3 border-b last:border-b-0 hover:bg-orange-50 cursor-pointer"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-900">{member.fullName}</span>
                                                                    <span className="text-xs text-gray-500 ml-2">{member.email}</span>
                                                                </div>
                                                                {member.isEligible ? (
                                                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                                                        {t('label.general_assembly.eligible_badge')}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                                                                        {t('label.general_assembly.non_eligible_badge')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {isSearchFocused && addParticipantSearch.length > 0 && filteredMembersForAdd.length === 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-center text-gray-500 text-sm">
                                                    {t('label.general_assembly.no_members_found')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left p-3 font-medium">{t('label.general_assembly.participant_name')}</th>
                                                <th className="text-center p-3 font-medium">{t('label.general_assembly.opened_link')}</th>
                                                <th className="text-center p-3 font-medium">{t('label.general_assembly.voted')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {participants.map(p => (
                                                <tr key={p.id} className="hover:bg-gray-50">
                                                    <td className="p-3">
                                                        <div>
                                                            <p className="font-medium">{p.userName}</p>
                                                            <p className="text-xs text-gray-500">{p.userEmail}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {p.hasOpenedLink ? (
                                                            <span className="text-green-600">&#10003;</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {p.hasVoted ? (
                                                            <span className="text-green-600">&#10003;</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'results' && isOrgAdmin && (
                            <div className="space-y-4">
                                {assembly.agendaItems.filter(item => item.requiresVote).map((item, index) => (
                                    <Card key={item.id} className="p-4">
                                        <p className="font-medium mb-3">{index + 1}. {item.title}</p>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center p-2 bg-green-50 rounded">
                                                <p className="text-lg font-bold text-green-600">{item.yesCount}</p>
                                                <p className="text-xs text-gray-500">{t('label.general_assembly.vote_yes')}</p>
                                            </div>
                                            <div className="text-center p-2 bg-red-50 rounded">
                                                <p className="text-lg font-bold text-red-600">{item.noCount}</p>
                                                <p className="text-xs text-gray-500">{t('label.general_assembly.vote_no')}</p>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                <p className="text-lg font-bold text-gray-600">{item.abstainCount}</p>
                                                <p className="text-xs text-gray-500">{t('label.general_assembly.vote_abstain')}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                {assembly.agendaItems.filter(item => item.requiresVote).length === 0 && (
                                    <p className="text-center text-gray-500 py-4">{t('label.general_assembly.no_voting_items')}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {isOrgAdmin && (
                        <div className="flex flex-wrap justify-between gap-3 pt-4 border-t">
                            <div className="flex gap-2">
                                {(assembly.status === 'CLOSED' || assembly.status === 'ARCHIVED') && (
                                    <>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => handleExport('pdf')}
                                            className="flex items-center gap-1"
                                        >
                                            <Download className="h-4 w-4" />
                                            {t('label.general_assembly.export_pdf')}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => handleExport('excel')}
                                            className="flex items-center gap-1"
                                        >
                                            <Download className="h-4 w-4" />
                                            {t('label.general_assembly.export_excel')}
                                        </Button>
                                    </>
                                )}
                                {canDelete && (
                                    <Button 
                                        variant="danger" 
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex items-center gap-1"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        {isDeleting ? t('label.common.deleting') : t('label.general_assembly.delete_assembly')}
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                {assembly.status === 'IN_PROGRESS' && (
                                    <Button variant="outline" onClick={handleClose}>
                                        {t('label.general_assembly.close_assembly')}
                                    </Button>
                                )}
                                {assembly.status === 'CLOSED' && (
                                    <Button variant="danger" onClick={handleArchive}>
                                        {t('label.general_assembly.archive_assembly')}
                                    </Button>
                                )}
                                <Button variant="secondary" onClick={onClose}>
                                    {t('label.button.close')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </FormModal>

        {selectedDocument && (
            <DocumentViewer
                document={selectedDocument}
                onClose={() => setSelectedDocument(null)}
            />
        )}
    </>
    );
};
