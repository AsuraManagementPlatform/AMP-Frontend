import React from 'react';
import {Activity} from '@/types/activity.types';
import {useTranslation} from "react-i18next";
import {ViewDataConfig, ViewDataModal} from "@/components/forms/ViewDataModal.tsx";

interface ViewActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    activity: Activity;
}

export const ViewActivityModal: React.FC<ViewActivityModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        activity,
                                                                    }) => {
    const { t } = useTranslation();

    const getStatusColor = (status: string) => {
        const statusColors = {
            'PLANNED': 'bg-blue-100 text-blue-800',
            'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800',
            'POSTPONED': 'bg-gray-100 text-gray-800'
        };
        return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('ro-RO');
    };

    const viewConfig: ViewDataConfig = {
        sections: [
            {
                title: t('label.activity.section_info'),
                columns: 2,
                fields: [
                    {
                        label: t('label.activity.title'),
                        value: activity.title
                    },
                    {
                        label: t('label.activity.type'),
                        value: t(`label.activity.type_${activity.type.toLowerCase()}`)
                    },
                    {
                        label: t('label.activity.status'),
                        value: activity.status,
                        render: (status) => (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                                {t(`label.activity.status_${status.toLowerCase()}`)}
                            </span>
                        )
                    },
                    {
                        label: t('label.activity.location'),
                        value: activity.location
                    },
                    {
                        label: t('label.activity.description'),
                        value: activity.description,
                        fullWidth: true,
                        show: !!activity.description
                    }
                ]
            },
            {
                title: t('label.activity.section_planning'),
                columns: 3,
                fields: [
                    {
                        label: t('label.activity.starting_date'),
                        value: formatDate(activity.startingDate)
                    },
                    {
                        label: t('label.activity.estimated_ending_date'),
                        value: formatDate(activity.estimatedEndingDate)
                    },
                    {
                        label: t('label.activity.ending_date'),
                        value: activity.endingDate ? formatDate(activity.endingDate) : 'N/A',
                        show: !!activity.endingDate
                    }
                ]
            },
            {
                title: t('label.activity.section_additional'),
                columns: 1,
                fields: [
                    {
                        label: t('label.activity.results'),
                        value: activity.results,
                        show: !!activity.results
                    },
                    {
                        label: t('label.activity.indicators'),
                        value: activity.indicators,
                        show: !!activity.indicators
                    },
                    {
                        label: t('label.activity.observation'),
                        value: activity.observation,
                        show: !!activity.observation
                    }
                ]
            }
        ]
    };

    return (
        <ViewDataModal
            isOpen={isOpen}
            onClose={onClose}
            title={t('label.activity.view_activity')}
            config={viewConfig}
            size="lg"
        />
    );
};