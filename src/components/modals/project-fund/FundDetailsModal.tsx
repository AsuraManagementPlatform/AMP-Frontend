import React from 'react';
import {Modal} from '@/components/ui/Modal';
import {FundAllocationStatus, ProjectFund} from '@/types/index.types';
import {t} from 'i18next';
import {Card} from '@/components/ui/Card';
import {Alert} from '@/components/ui/Alert';
import {ModalButton} from '@/components/ui/ModalButton';

interface FundDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    fund: ProjectFund;
}

export const FundDetailsModal: React.FC<FundDetailsModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      fund
                                                                  }) => {
    const activeAllocations = fund.allocations?.filter(
        a => a.status === FundAllocationStatus.ACTIVE
    ) || [];

    const cancelledAllocations = fund.allocations?.filter(
        a => a.status === FundAllocationStatus.CANCELLED
    ) || [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${t('label.project_fund.details')} - ${fund.sourceName}`}
            size="lg"
        >
            <div className="space-y-6">
                <Card title={t('label.project_fund.fund_info')} padding="md">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_fund.source')}:</span>
                            <p className="font-medium">{fund.sourceName}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_fund.category')}:</span>
                            <p className="font-medium">{fund.category}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_fund.total_amount')}:</span>
                            <p className="font-medium">
                                {fund.amount?.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {fund.currency}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_fund.allocated_amount')}:</span>
                            <p className="font-medium text-orange-600">
                                {fund.allocatedAmount?.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {fund.currency}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_fund.remaining_amount')}:</span>
                            <p className="font-medium text-green-600">
                                {fund.remainingAmount?.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {fund.currency}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_fund.status')}:</span>
                            <p className="font-medium">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    fund.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {fund.status}
                                </span>
                            </p>
                        </div>
                    </div>
                </Card>

                {activeAllocations.length > 0 && (
                    <Card
                        title={`${t('label.project_fund.active_allocations')} (${activeAllocations.length})`}
                        padding="sm"
                    >
                        <div className="space-y-2">
                            {activeAllocations.map((allocation) => (
                                <Alert key={allocation.id} variant="success">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{allocation.expenseName}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {t('label.project_fund.allocated_on')}: {new Date(allocation.createdAt).toLocaleDateString('ro-RO')}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-lg font-semibold text-green-700">
                                                {allocation.allocatedAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {fund.currency}
                                            </p>
                                            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-1">
                                                {t('label.allocation_status.active')}
                                            </span>
                                        </div>
                                    </div>
                                </Alert>
                            ))}
                        </div>
                    </Card>
                )}

                {cancelledAllocations.length > 0 && (
                    <Card
                        title={`${t('label.project_fund.cancelled_allocations')} (${cancelledAllocations.length})`}
                        padding="sm"
                    >
                        <div className="space-y-2">
                            {cancelledAllocations.map((allocation) => (
                                <Alert key={allocation.id} variant="error">
                                    <div className="flex justify-between items-start opacity-75">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{allocation.expenseName}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {t('label.project_fund.allocated_on')}: {new Date(allocation.createdAt).toLocaleDateString('ro-RO')}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-lg font-semibold text-red-700 line-through">
                                                {allocation.allocatedAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {fund.currency}
                                            </p>
                                            <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full mt-1">
                                                {t('label.allocation_status.cancelled')}
                                            </span>
                                        </div>
                                    </div>
                                </Alert>
                            ))}
                        </div>
                    </Card>
                )}

                {(!fund.allocations || fund.allocations.length === 0) && (
                    <Alert variant="info">
                        <p className="text-center">{t('label.project_fund.no_allocations')}</p>
                    </Alert>
                )}

                <div className="flex justify-end pt-4 border-t">
                    <ModalButton onClick={onClose} variant="cancel">
                        {t('action.close')}
                    </ModalButton>
                </div>
            </div>
        </Modal>
    );
};