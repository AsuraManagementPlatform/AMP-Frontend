import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import showToast from '@/components/ui/Toast';
import votingSessionService from '@/services/voting-session.service';
import { VotingSessionListItem, VotingSessionDetail } from '@/types/voting-session.types';
import { TableColumn, TableAction } from '@/types/table.types';
import { VotingSessionCreateModal } from '@/components/voting-session/VotingSessionCreateModal';
import { VotingSessionDetailModal } from '@/components/voting-session/VotingSessionDetailModal';
import { useAuth } from '@/hooks/useAuth';
import { UserGroup } from '@/types/index.types';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';
import { ActionIcons } from '@/components/ui/ActionIcons';

export const VotingSessions = () => {
    const { t } = useTranslation();
    const confirm = useConfirmDialog();
    const { hasAnyUserGroup } = useAuth();
    const [sessions, setSessions] = useState<VotingSessionListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    const columns = useMemo<TableColumn<VotingSessionListItem>[]>(
        () => [
            {
                key: 'title',
                label: t('label.voting_session.title'),
                render: (_, item) => (
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        {item.description && <div className="text-xs text-gray-500 truncate">{item.description}</div>}
                    </div>
                )
            },
            {
                key: 'startDate',
                label: t('label.voting_session.start_date'),
                render: (value) => new Date(value).toLocaleString()
            },
            {
                key: 'endDate',
                label: t('label.voting_session.end_date'),
                render: (value) => new Date(value).toLocaleString()
            },
            {
                key: 'status',
                label: t('label.voting_session.status'),
                render: (value) => t(`label.voting_session.status_${String(value).toLowerCase()}`)
            },
            {
                key: 'eligibleCount',
                label: t('label.voting_session.eligible_count'),
                headerAlign: 'right',
                render: (value) => <div className="text-right">{value}</div>
            },
            {
                key: 'joinedCount',
                label: t('label.voting_session.joined_count'),
                headerAlign: 'right',
                render: (value) => <div className="text-right">{value}</div>
            },
            {
                key: 'votedCount',
                label: t('label.voting_session.voted_count'),
                headerAlign: 'right',
                render: (value) => <div className="text-right">{value}</div>
            }
        ],
        [t]
    );

    const loadSessions = async () => {
        try {
            setLoading(true);
            const data = await votingSessionService.list();
            setSessions(data);
        } catch (error: any) {
            const message = error?.message || t('toast.voting_session.load_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    const handleCreated = (session: VotingSessionDetail) => {
        setSessions(prev => [session, ...prev]);
    };

    const handleDelete = async (session: VotingSessionListItem) => {
        const isConfirmed = await confirm({
            title: t('label.voting_session.delete_confirm_title'),
            message: `${t('label.voting_session.delete_confirm_message')} "${session.title}"?`,
            confirmText: t('action.confirm'),
            cancelText: t('action.cancel'),
            confirmButtonVariant: 'primary',
            icon: (<IconWarning />)
        });

        if (!isConfirmed) {
            return;
        }

        try {
            await votingSessionService.delete(session.id);
            showToast.success(t('toast.voting_session.delete_success'));
            loadSessions();
        } catch (error: any) {
            const message = error?.message || t('toast.voting_session.delete_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        }
    };

    const getActions = (): TableAction<VotingSessionListItem>[] => [
        {
            label: t('action.delete'),
            variant: 'danger',
            onClick: handleDelete,
            icon: <ActionIcons.Delete />,
            show: () => isOrgAdmin
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{t('label.voting_session.page_title')}</h2>
                {isOrgAdmin && (
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        {t('label.voting_session.create_button')}
                    </Button>
                )}
            </div>

            <Card className="p-0">
                <DataTable
                    data={sessions}
                    columns={columns}
                    actions={getActions()}
                    loading={loading}
                    emptyMessage={t('label.voting_session.empty')}
                    onRowClick={(item) => setSelectedSessionId(item.id)}
                />
            </Card>

            <VotingSessionCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={handleCreated}
            />

            <VotingSessionDetailModal
                sessionId={selectedSessionId}
                isOpen={!!selectedSessionId}
                onClose={() => setSelectedSessionId(null)}
                onUpdated={loadSessions}
            />
        </div>
    );
};
