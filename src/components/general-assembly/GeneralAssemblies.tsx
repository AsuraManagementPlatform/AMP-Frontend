import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import showToast from '@/components/ui/Toast';
import generalAssemblyService from '@/services/general-assembly.service';
import { GeneralAssemblyListItem, GeneralAssemblyDetail } from '@/types/general-assembly.types';
import { TableColumn } from '@/types/table.types';
import { GeneralAssemblyCreateModal } from '@/components/general-assembly/GeneralAssemblyCreateModal';
import { GeneralAssemblyDetailModal } from '@/components/general-assembly/GeneralAssemblyDetailModal';
import { useAuth } from '@/hooks/useAuth';
import { UserGroup } from '@/types/index.types';

export const GeneralAssemblies = () => {
    const { t } = useTranslation();
    const { hasAnyUserGroup } = useAuth();
    const [assemblies, setAssemblies] = useState<GeneralAssemblyListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAssemblyId, setSelectedAssemblyId] = useState<string | null>(null);

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    const hasActiveAssembly = assemblies.some(a => a.status !== 'ARCHIVED');

    const columns = useMemo<TableColumn<GeneralAssemblyListItem>[]>(
        () => [
            {
                key: 'title',
                label: t('label.general_assembly.title'),
                render: (_, item) => (
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        {item.description && <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>}
                    </div>
                )
            },
            {
                key: 'meetingType',
                label: t('label.general_assembly.meeting_type'),
                render: (value) => t(`label.general_assembly.meeting_type_${String(value).toLowerCase()}`)
            },
            {
                key: 'startDate',
                label: t('label.general_assembly.start_date'),
                render: (value) => new Date(value).toLocaleString()
            },
            {
                key: 'status',
                label: t('label.general_assembly.status'),
                render: (value) => {
                    const statusColors: Record<string, string> = {
                        DRAFT: 'bg-gray-100 text-gray-800',
                        SCHEDULED: 'bg-blue-100 text-blue-800',
                        IN_PROGRESS: 'bg-green-100 text-green-800',
                        CLOSED: 'bg-yellow-100 text-yellow-800',
                        ARCHIVED: 'bg-gray-100 text-gray-600',
                    };
                    return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
                            {t(`label.general_assembly.status_${String(value).toLowerCase()}`)}
                        </span>
                    );
                }
            },
            {
                key: 'participantCount',
                label: t('label.general_assembly.participant_count'),
                headerAlign: 'right',
                render: (value) => <div className="text-right">{value}</div>
            },
            {
                key: 'openedCount',
                label: t('label.general_assembly.opened_count'),
                headerAlign: 'right',
                render: (value) => <div className="text-right">{value}</div>
            },
            {
                key: 'votedCount',
                label: t('label.general_assembly.voted_count'),
                headerAlign: 'right',
                render: (value) => <div className="text-right">{value}</div>
            }
        ],
        [t]
    );

    const loadAssemblies = async () => {
        try {
            setLoading(true);
            const data = await generalAssemblyService.list();
            setAssemblies(data);
        } catch (error: any) {
            const message = error?.message || t('toast.general_assembly.load_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAssemblies();
    }, []);

    const handleCreated = (assembly: GeneralAssemblyDetail) => {
        setAssemblies(prev => [assembly, ...prev]);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">{t('label.general_assembly.page_title')}</h2>
                {isOrgAdmin && (
                    <Button 
                        variant="primary" 
                        onClick={() => setShowCreateModal(true)}
                        disabled={hasActiveAssembly}
                        title={hasActiveAssembly ? t('label.general_assembly.active_exists_tooltip') : ''}
                    >
                        {t('label.general_assembly.create_button')}
                    </Button>
                )}
            </div>

            {hasActiveAssembly && isOrgAdmin && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                        {t('label.general_assembly.active_exists_warning')}
                    </p>
                </div>
            )}

            <Card className="p-0">
                <DataTable
                    data={assemblies}
                    columns={columns}
                    loading={loading}
                    emptyMessage={t('label.general_assembly.empty')}
                    onRowClick={(item) => setSelectedAssemblyId(item.id)}
                />
            </Card>

            <GeneralAssemblyCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={handleCreated}
            />

            <GeneralAssemblyDetailModal
                assemblyId={selectedAssemblyId}
                isOpen={!!selectedAssemblyId}
                onClose={() => setSelectedAssemblyId(null)}
                onUpdated={loadAssemblies}
            />
        </div>
    );
};
