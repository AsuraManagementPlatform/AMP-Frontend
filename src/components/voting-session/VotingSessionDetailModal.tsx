import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';
import votingSessionService from '@/services/voting-session.service';
import { VotingSessionDetail } from '@/types/voting-session.types';
import { useAuth } from '@/hooks/useAuth';
import { UserGroup } from '@/types/index.types';

interface VotingSessionDetailModalProps {
    sessionId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

export const VotingSessionDetailModal = ({ sessionId, isOpen, onClose, onUpdated }: VotingSessionDetailModalProps) => {
    const { t } = useTranslation();
    const { hasAnyUserGroup } = useAuth();
    const [session, setSession] = useState<VotingSessionDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [answers, setAnswers] = useState<Record<string, boolean>>({});

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    useEffect(() => {
        if (isOpen && sessionId) {
            loadSession();
        }
    }, [isOpen, sessionId]);

    const loadSession = async () => {
        if (!sessionId) return;
        try {
            setLoading(true);
            const data = await votingSessionService.getById(sessionId);
            setSession(data);
            setAnswers({});
        } catch (error: any) {
            const message = error?.message || t('toast.voting_session.load_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!sessionId) return;
        try {
            setSubmitting(true);
            const data = await votingSessionService.join(sessionId);
            setSession(data);
            showToast.success(t('toast.voting_session.join_success'));
            if (data.meetUrl) {
                window.open(data.meetUrl, '_blank', 'noopener');
            }
            onUpdated();
        } catch (error: any) {
            const message = error?.message || t('toast.voting_session.join_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async () => {
        if (!sessionId || !session) return;
        const missing = session.questions.some(q => answers[q.id] === undefined);
        if (missing) {
            showToast.error(t('toast.voting_session.invalid_data'));
            return;
        }

        try {
            setSubmitting(true);
            const data = await votingSessionService.vote(sessionId, { answers });
            setSession(data);
            showToast.success(t('toast.voting_session.vote_success'));
            onUpdated();
        } catch (error: any) {
            const message = error?.message || t('toast.voting_session.vote_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseSession = async () => {
        if (!sessionId) return;
        try {
            setSubmitting(true);
            const data = await votingSessionService.close(sessionId);
            setSession(data);
            showToast.success(t('toast.voting_session.close_success'));
            onUpdated();
        } catch (error: any) {
            const message = error?.message || t('toast.voting_session.close_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleArchiveSession = async () => {
        if (!sessionId) return;
        try {
            setSubmitting(true);
            await votingSessionService.archive(sessionId);
            showToast.success(t('toast.voting_session.archive_success'));
            onUpdated();
            onClose();
        } catch (error: any) {
            const message = error?.message || t('toast.voting_session.archive_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownload = async (format: 'pdf' | 'csv') => {
        if (!sessionId) return;
        try {
            setSubmitting(true);
            const blob = format === 'pdf' 
                ? await votingSessionService.downloadReportPdf(sessionId)
                : await votingSessionService.downloadReportCsv(sessionId);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `voting_session_${sessionId}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            const message = error?.message || t('toast.voting_session.report_download_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAnswerChange = (questionId: string, value: boolean) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('label.voting_session.details_title')} size="lg">
            {loading || !session ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
                        {session.description && <p className="text-gray-600">{session.description}</p>}
                        <div className="text-sm text-gray-500">
                            {t('label.voting_session.period')}: {new Date(session.startDate).toLocaleString()} - {new Date(session.endDate).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                            {t('label.voting_session.status')}: {t(`label.voting_session.status_${session.status.toLowerCase()}`)}
                        </div>
                    </div>

                    {session.meetUrl && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">{t('label.voting_session.meet_link')}</span>
                            <Button variant="secondary" size="sm" onClick={() => window.open(session.meetUrl || '', '_blank', 'noopener')}>
                                {t('label.voting_session.open_meeting')}
                            </Button>
                        </div>
                    )}

                    {session.canJoin && (
                        <div>
                            <Button variant="primary" onClick={handleJoin} isLoading={submitting}>
                                {t('label.voting_session.join_button')}
                            </Button>
                        </div>
                    )}

                    {session.hasVoted && (
                        <div className="text-sm text-green-700 bg-green-50 px-4 py-3 rounded-md">
                            {t('label.voting_session.already_voted')}
                        </div>
                    )}

                    {session.canVote && (
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900">{t('label.voting_session.vote_title')}</h4>
                            {session.questions.map((question) => (
                                <div key={question.id} className="space-y-2">
                                    <div className="text-sm font-medium text-gray-800">{question.order}. {question.text}</div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant={answers[question.id] === true ? 'primary' : 'outline'}
                                            size="sm"
                                            onClick={() => handleAnswerChange(question.id, true)}
                                        >
                                            {t('label.voting_session.yes')}
                                        </Button>
                                        <Button
                                            variant={answers[question.id] === false ? 'primary' : 'outline'}
                                            size="sm"
                                            onClick={() => handleAnswerChange(question.id, false)}
                                        >
                                            {t('label.voting_session.no')}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <div className="flex justify-end">
                                <Button variant="primary" onClick={handleVote} isLoading={submitting}>
                                    {t('label.voting_session.submit_vote')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {isOrgAdmin && (
                        <div className="flex flex-wrap gap-3 pt-2">
                            {session.status !== 'CLOSED' && session.status !== 'ARCHIVED' && (
                                <Button variant="secondary" onClick={handleCloseSession} isLoading={submitting}>
                                    {t('label.voting_session.close_button')}
                                </Button>
                            )}
                            {session.status === 'CLOSED' && (
                                <Button variant="secondary" onClick={handleArchiveSession} isLoading={submitting}>
                                    {t('label.voting_session.archive_button')}
                                </Button>
                            )}
                            {session.canDownloadReport && (
                                <>
                                    <Button variant="outline" onClick={() => handleDownload('pdf')} isLoading={submitting}>
                                        {t('label.voting_session.download_pdf')}
                                    </Button>
                                    <Button variant="outline" onClick={() => handleDownload('csv')} isLoading={submitting}>
                                        {t('label.voting_session.download_csv')}
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};
