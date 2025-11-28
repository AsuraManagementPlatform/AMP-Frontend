import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MembershipFeeReportsTab } from './MembershipFeeReportsTab';
import { ProjectReportsTab } from './ProjectReportsTab';
import { DonationReportsTab } from './DonationReportsTab';
import { EntityReportsTab } from './EntityReportsTab';
import { Card } from '@/components/ui/Card';

type ReportType = 
  | 'membership_fees'
  | 'projects'
  | 'donations'
  | 'entities';

interface ReportOption {
  id: ReportType;
  icon: string;
  labelKey: string;
  descriptionKey: string;
  available: boolean;
}

interface ReportsHubProps {
  organizationId: string;
  organizationName: string;
}

export const ReportsHub: React.FC<ReportsHubProps> = ({ organizationId, organizationName }) => {
  const { t } = useTranslation();
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('membership_fees');

  const reportOptions: ReportOption[] = [
    {
      id: 'membership_fees',
      icon: '',
      labelKey: 'label.reports.membership_fees',
      descriptionKey: 'label.reports.membership_fees_desc',
      available: true
    },
    {
      id: 'projects',
      icon: '',
      labelKey: 'label.reports.projects',
      descriptionKey: 'label.reports.projects_desc',
      available: true
    },
    {
      id: 'donations',
      icon: '',
      labelKey: 'label.reports.donations_title',
      descriptionKey: 'label.reports.donations_desc',
      available: true
    },
    {
      id: 'entities',
      icon: '',
      labelKey: 'label.reports.entities',
      descriptionKey: 'label.reports.entities_desc',
      available: true
    }
  ];

  const renderReportContent = () => {
    switch (selectedReportType) {
      case 'membership_fees':
        return (
          <MembershipFeeReportsTab 
            organizationId={organizationId} 
            organizationName={organizationName}
          />
        );
      
      case 'projects':
        return (
          <ProjectReportsTab 
            organizationId={organizationId} 
            organizationName={organizationName}
          />
        );
      
      case 'donations':
        return (
          <DonationReportsTab 
            organizationId={organizationId} 
            organizationName={organizationName}
          />
        );
      
      case 'entities':
        return (
          <EntityReportsTab 
            organizationId={organizationId} 
            organizationName={organizationName}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selector */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('label.reports.select_report_type')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {reportOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => option.available && setSelectedReportType(option.id)}
                disabled={!option.available}
                className={`
                  p-3 rounded-lg border text-center transition-all
                  ${selectedReportType === option.id 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                  }
                  ${!option.available && 'opacity-50 cursor-not-allowed'}
                `}
              >
                <div className="font-medium text-sm text-gray-900">
                  {t(option.labelKey)}
                </div>
                {!option.available && (
                  <div className="mt-1 text-xs text-orange-600">
                    {t('label.reports.coming_soon')}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Selected Report Content */}
      {renderReportContent()}
    </div>
  );
};
