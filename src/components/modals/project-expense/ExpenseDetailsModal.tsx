import React from 'react';
import {Modal} from '@/components/ui/Modal';
import {FundAllocationStatus, ProjectExpense, ProjectExpenseStatus} from '@/types/index.types';
import {t} from 'i18next';
import {Card} from '@/components/ui/Card';
import {Alert} from '@/components/ui/Alert';
import {ModalButton} from '@/components/ui/ModalButton';

interface ExpenseDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCancel?: (expense: ProjectExpense) => void;
    expense: ProjectExpense;
}

export const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onCancel,
                                                                            expense
                                                                        }) => {
    const activeAllocations = expense.fundAllocations?.filter(
        a => a.status === FundAllocationStatus.ACTIVE
    ) || [];

    const cancelledAllocations = expense.fundAllocations?.filter(
        a => a.status === FundAllocationStatus.CANCELLED
    ) || [];

    const canCancel = expense.status === ProjectExpenseStatus.PAID && onCancel;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${t('label.project_expense.details')} - ${expense.name}`}
            size="lg"
            showCloseButton={false}
        >
            <div className="space-y-6">
                <Card title={t('label.project_expense.expense_info')} padding="md">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_expense.name')}:</span>
                            <p className="font-medium">{expense.name}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_expense.activity')}:</span>
                            <p className="font-medium">{expense.activityTitle}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_expense.category')}:</span>
                            <p className="font-medium">{expense.category}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_expense.quantity')}:</span>
                            <p className="font-medium">{expense.quantity} {expense.unitType}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_expense.unit_price')}:</span>
                            <p className="font-medium">
                                {expense.unitPrice?.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {expense.currency}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_expense.total_amount')}:</span>
                            <p className="font-medium text-lg">
                                {expense.totalAmount?.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {expense.currency}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">{t('label.project_expense.status')}:</span>
                        </div>
                        <div>
                            <p className="font-medium">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    expense.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                        expense.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {expense.status}
                                </span>
                            </p>
                        </div>
                    </div>
                </Card>

                {activeAllocations.length > 0 && (
                    <Card
                        title={`${t('label.project_expense.funded_by')} (${activeAllocations.length})`}
                        padding="sm"
                    >
                        <div className="space-y-2">
                            {activeAllocations.map((allocation) => (
                                <Alert key={allocation.id} variant="info">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{allocation.fundSource}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {t('label.project_expense.funded_on')}: {new Date(allocation.createdAt).toLocaleDateString('ro-RO')}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-lg font-semibold text-blue-700">
                                                {allocation.allocatedAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {expense.currency}
                                            </p>
                                        </div>
                                    </div>
                                </Alert>
                            ))}
                        </div>
                    </Card>
                )}

                {cancelledAllocations.length > 0 && (
                    <Card
                        title={`${t('label.project_expense.cancelled_funding')} (${cancelledAllocations.length})`}
                        padding="sm"
                    >
                        <div className="space-y-2">
                            {cancelledAllocations.map((allocation) => (
                                <Alert key={allocation.id} variant="error">
                                    <div className="flex justify-between items-start opacity-75">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{allocation.fundSource}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {t('label.project_expense.funded_on')}: {new Date(allocation.createdAt).toLocaleDateString('ro-RO')}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-lg font-semibold text-red-700 line-through">
                                                {allocation.allocatedAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {expense.currency}
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

                <div className="flex justify-between pt-4 border-t">
                    <div>
                        {canCancel && (
                            <ModalButton onClick={() => onCancel(expense)} variant="danger">
                                {t('action.cancel_expense')}
                            </ModalButton>
                        )}
                    </div>
                    <ModalButton onClick={onClose} variant="secondary">
                        {t('action.close')}
                    </ModalButton>
                </div>
            </div>
        </Modal>
    );
};