import {TableAction, TableColumn} from '@/types/index.types';
import React, {useState} from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import {ProjectPartner} from '@/types/project-partner.types';
import {UpdateProjectPartnerModal} from '@/components/modals/project-partner/UpdateProjectPartnerModal';
import {ViewProjectPartnerModal} from '@/components/modals/project-partner/ViewProjectPartnerModal.tsx';
import projectPartnerService from '@/services/project-partner.service';
import showToast from '@/components/ui/Toast';
import {t} from 'i18next';

interface ProjectPartnerListProps {
    project: string;
    refreshTrigger?: number;
    pageSize?: number;
}

export const ProjectPartnerList: React.FC<ProjectPartnerListProps> = ({
                                                                          project,
                                                                          refreshTrigger = 0,
                                                                          pageSize = 10
                                                                      }) => {
    const [selectedPartner, setSelectedPartner] = useState<ProjectPartner | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleRowClick = async (partner: ProjectPartner) => {
        try {
            const fullPartner = await projectPartnerService.getById(partner.id);
            setSelectedPartner(fullPartner);
            setIsDetailsModalOpen(true);
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.project_partner.load_error');
            showToast.error(errorMessage);
        }
    };

    const handleEdit = (partner: ProjectPartner) => {
        setSelectedPartner(partner);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getEngagementBadge = (level: string | null) => {
        if (!level) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {t('label.project_partner.engagement_none')}
                </span>
            );
        }

        const badges: Record<string, string> = {
            'none': 'bg-gray-100 text-gray-800',
            'partial': 'bg-yellow-100 text-yellow-800',
            'fully': 'bg-green-100 text-green-800'
        };

        const labels: Record<string, string> = {
            'none': t('label.project_partner.engagement_none'),
            'partial': t('label.project_partner.engagement_partial'),
            'fully': t('label.project_partner.engagement_fully')
        };

        const colorClass = badges[level] || 'bg-gray-100 text-gray-800';
        const label = labels[level] || level;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {label}
            </span>
        );
    };

    const getColumns = (): TableColumn<ProjectPartner>[] => [
        {
            key: 'entityName',
            label: t('label.project_partner.entity'),
            sortable: true,
            filterable: true,
            filterType: 'text',
            size: 'lg',
        },
        {
            key: 'engagementLevel',
            label: t('label.project_partner.engagement_level'),
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                {label: t('label.project_partner.engagement_none'), value: 'none'},
                {label: t('label.project_partner.engagement_partial'), value: 'partial'},
                {label: t('label.project_partner.engagement_fully'), value: 'fully'},
            ],
            size: 'md',
            render: (level: string | null) => getEngagementBadge(level)
        },
    ];

    const getActions = (): TableAction<ProjectPartner>[] => [
        {
            label: t('action.edit'),
            variant: 'primary',
            onClick: handleEdit,
            icon: <IconEdit />
        }
    ];

    return (
        <>
            <Table<ProjectPartner>
                endpoint={`project_partner/list?project_id=${project}`}
                columns={getColumns()}
                actions={getActions()}
                initialPageSize={pageSize}
                initialSort={{ field: 'entityName', direction: 'asc' }}
                showFilters={true}
                showPagination={true}
                emptyMessage={t('label.project_partner.empty_list')}
                refreshTrigger={refreshTrigger + localRefresh}
                onRowClick={handleRowClick}
            />

            {isUpdateModalOpen && selectedPartner && (
                <UpdateProjectPartnerModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedPartner(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    partner={selectedPartner}
                />
            )}

            {isDetailsModalOpen && selectedPartner && (
                <ViewProjectPartnerModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setSelectedPartner(null);
                    }}
                    partner={selectedPartner}
                />
            )}
        </>
    );
};

export default ProjectPartnerList;