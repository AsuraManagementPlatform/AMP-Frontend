import {EntityPartnershipProject, TableColumn} from '@/types/index.types';
import React, {useState} from "react";
import {t} from 'i18next';
import {ViewEntityPartnerModal} from "@/components/modals/entity/ViewEntityPartnerModal.tsx";
import DataTable from "@/components/ui/DataTable.tsx";

interface EntityPartnerListProps {
    partners: EntityPartnershipProject[];
}

export const EntityPartnerList: React.FC<EntityPartnerListProps> = ({partners}) => {
    const [selectedPartner, setSelectedPartner] = useState<EntityPartnershipProject | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const handleRowClick = (partner: EntityPartnershipProject) => {
        setSelectedPartner(partner);
        setIsDetailsModalOpen(true);
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
            none: 'bg-gray-100 text-gray-800',
            partial: 'bg-yellow-100 text-yellow-800',
            fully: 'bg-green-100 text-green-800'
        };

        const labels: Record<string, string> = {
            none: t('label.project_partner.engagement_none'),
            partial: t('label.project_partner.engagement_partial'),
            fully: t('label.project_partner.engagement_fully')
        };

        const colorClass = badges[level] || 'bg-gray-100 text-gray-800';
        const label = labels[level] || level;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {label}
            </span>
        );
    };

    const getColumns = (): TableColumn<EntityPartnershipProject>[] => [
        {
            key: 'projectName',
            label: t('label.entity_partner.project'),
            sortable: true,
            filterable: true,
            filterType: 'text',
            size: 'lg',
        },
        {
            key: 'engagementLevel',
            label: t('label.entity_partner.engagement_level'),
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

    return (
        <>
            <DataTable<EntityPartnershipProject>
                data={partners}
                columns={getColumns()}
                actions={[]}
                initialPageSize={10}
                showFilters={true}
                showPagination={true}
                emptyMessage={t('label.entity_partner.empty_list')}
                onRowClick={handleRowClick}
            />

            {isDetailsModalOpen && selectedPartner && (
                <ViewEntityPartnerModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => {
                        setIsDetailsModalOpen(false);
                        setSelectedPartner(null);
                    }}
                    partnership={selectedPartner}
                />
            )}
        </>
    );
};

export default EntityPartnerList;