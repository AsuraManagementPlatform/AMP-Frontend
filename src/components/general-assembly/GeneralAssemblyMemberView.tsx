import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ActionButton } from '@/components/ui/ActionButton';
import showToast from '@/components/ui/Toast';
import generalAssemblyService from '@/services/general-assembly.service';
import { DocumentViewer } from '@/components/modals/DocumentViewer';
import { Document } from '@/types/document.types';
import { MemberAssemblyView, VoteChoice, AgendaItem, AgendaItemDocument } from '@/types/general-assembly.types';
import { EyeIcon } from '@heroicons/react/24/outline';

export const GeneralAssemblyMemberView = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [assembly, setAssembly] = useState<MemberAssemblyView | null>(null);
    const [votes, setVotes] = useState<Record<string, VoteChoice>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    const hasVoted = assembly?.participantStatus?.hasVoted ?? false;

    useEffect(() => {
        if (id) {
            loadAssembly();
        }
    }, [id]);

    const loadAssembly = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await generalAssemblyService.getMemberView(id);
            setAssembly(data);
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.load_error');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setLoading(false);
        }
    };

    const handleVoteChange = (agendaItemId: string, vote: VoteChoice) => {
        setVotes(prev => ({ ...prev, [agendaItemId]: vote }));
    };

    const handleSubmitVotes = async () => {
        if (!id || !assembly) return;

        const votingItems = assembly.agendaItems.filter((item: AgendaItem) => item.requiresVote);
        const allVoted = votingItems.every((item: AgendaItem) => votes[item.id]);

        if (!allVoted) {
            showToast.info(t('toast.general_assembly.vote_all_required'));
            return;
        }

        try {
            setSubmitting(true);
            await generalAssemblyService.submitVotes(id, { votes });
            showToast.success(t('toast.general_assembly.vote_success'));
            loadAssembly();
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.vote_error');
            showToast.error(message.includes('.') ? t(message) : message);
        } finally {
            setSubmitting(false);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!assembly) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Card className="p-8 max-w-md text-center">
                    <p className="text-gray-600">{t('label.general_assembly.not_found')}</p>
                </Card>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        DRAFT: 'bg-gray-100 text-gray-800',
        SCHEDULED: 'bg-blue-100 text-blue-800',
        IN_PROGRESS: 'bg-green-100 text-green-800',
        CLOSED: 'bg-yellow-100 text-yellow-800',
        ARCHIVED: 'bg-gray-100 text-gray-600',
    };

    const isVotingOpen = assembly.status === 'IN_PROGRESS' && !hasVoted;

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-3xl mx-auto px-4">
                <Card className="p-6 mb-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{assembly.title}</h1>
                            <p className="text-gray-600 mt-1">{assembly.organizationName}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[assembly.status]}`}>
                            {t(`label.general_assembly.status_${assembly.status.toLowerCase()}`)}
                        </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">{t('label.general_assembly.start_date')}</p>
                            <p className="font-medium">{new Date(assembly.startDate).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">{t('label.general_assembly.end_date')}</p>
                            <p className="font-medium">{new Date(assembly.endDate).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">{t('label.general_assembly.meeting_type')}</p>
                            <p className="font-medium">
                                {t(`label.general_assembly.meeting_type_${assembly.meetingType.toLowerCase()}`)}
                            </p>
                        </div>
                        {assembly.meetingType === 'IN_PERSON' && assembly.location && (
                            <div>
                                <p className="text-gray-500">{t('label.general_assembly.location')}</p>
                                <p className="font-medium">{assembly.location}</p>
                            </div>
                        )}
                    </div>

                    {assembly.meetingType === 'ONLINE' && assembly.meetUrl && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-800 mb-2">
                                {t('label.general_assembly.online_meeting_details')}
                            </p>
                            <a 
                                href={assembly.meetUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline break-all"
                            >
                                {assembly.meetUrl}
                            </a>
                            {assembly.meetPassword && (
                                <p className="text-sm text-blue-700 mt-2">
                                    {t('label.general_assembly.meet_password')}: <span className="font-mono font-medium">{assembly.meetPassword}</span>
                                </p>
                            )}
                        </div>
                    )}

                    {assembly.description && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-1">{t('label.general_assembly.description')}</p>
                            <p className="text-gray-700">{assembly.description}</p>
                        </div>
                    )}
                </Card>

                {hasVoted && (
                    <Card className="p-6 mb-6 bg-green-50 border-green-200">
                        <div className="flex items-center gap-3">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <div>
                                <p className="font-medium text-green-800">{t('label.general_assembly.already_voted')}</p>
                                <p className="text-sm text-green-700">{t('label.general_assembly.already_voted_desc')}</p>
                            </div>
                        </div>
                    </Card>
                )}

                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('label.general_assembly.agenda_items')}
                </h2>

                <div className="space-y-4">
                    {assembly.agendaItems.map((item: AgendaItem, index: number) => (
                        <Card key={item.id} className="p-4">
                            <div className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                                        {item.requiresVote && (
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                                {t('label.general_assembly.requires_vote')}
                                            </span>
                                        )}
                                    </div>
                                    {item.description && (
                                        <p className="text-gray-600 mt-1">{item.description}</p>
                                    )}

                                    {item.documents && item.documents.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs text-gray-500 font-medium">{t('label.general_assembly.documents')}:</p>
                                            {item.documents.map((doc) => (
                                                <div key={doc.id} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                                    <span className="flex-1 truncate">{doc.fileName}</span>
                                                    <span className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</span>
                                                    <ActionButton
                                                        variant="view"
                                                        icon={EyeIcon}
                                                        onClick={() => handleViewDocument(doc)}
                                                        title={t('label.document.view')}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {item.requiresVote && isVotingOpen && (
                                        <div className="mt-4 flex gap-2 flex-wrap">
                                            <button
                                                type="button"
                                                onClick={() => handleVoteChange(item.id, 'YES')}
                                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                                    votes[item.id] === 'YES'
                                                        ? 'border-green-500 bg-green-100 text-green-700'
                                                        : 'border-gray-300 hover:border-green-300'
                                                }`}
                                            >
                                                {t('label.general_assembly.vote_yes')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleVoteChange(item.id, 'NO')}
                                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                                    votes[item.id] === 'NO'
                                                        ? 'border-red-500 bg-red-100 text-red-700'
                                                        : 'border-gray-300 hover:border-red-300'
                                                }`}
                                            >
                                                {t('label.general_assembly.vote_no')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleVoteChange(item.id, 'ABSTAIN')}
                                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                                    votes[item.id] === 'ABSTAIN'
                                                        ? 'border-gray-500 bg-gray-100 text-gray-700'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                            >
                                                {t('label.general_assembly.vote_abstain')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {isVotingOpen && assembly.agendaItems.some((item: AgendaItem) => item.requiresVote) && (
                    <div className="mt-6">
                        <Button
                            onClick={handleSubmitVotes}
                            disabled={submitting}
                            className="w-full"
                            size="lg"
                        >
                            {submitting ? t('label.button.submitting') : t('label.general_assembly.submit_votes')}
                        </Button>
                    </div>
                )}

                {assembly.status === 'CLOSED' && (
                    <Card className="mt-6 p-6 bg-yellow-50 border-yellow-200">
                        <p className="text-yellow-800 text-center">
                            {t('label.general_assembly.voting_closed')}
                        </p>
                    </Card>
                )}

                {(assembly.status === 'SCHEDULED' || assembly.status === 'DRAFT') && (
                    <Card className="mt-6 p-6 bg-blue-50 border-blue-200">
                        <p className="text-blue-800 text-center">
                            {t('label.general_assembly.voting_not_started')}
                        </p>
                        <p className="text-blue-600 text-center text-sm mt-2">
                            {t('label.general_assembly.voting_starts_at', { 
                                date: new Date(assembly.startDate).toLocaleString() 
                            })}
                        </p>
                    </Card>
                )}
            </div>

            {selectedDocument && (
                <DocumentViewer
                    document={selectedDocument}
                    onClose={() => setSelectedDocument(null)}
                />
            )}
        </div>
    );
};
