import React from 'react';
import {Modal} from '@/components/ui/Modal';
import {FundAllocationStatus, ProjectExpense, ProjectExpenseStatus, ProjectExpenseTransactionSource} from '@/types/index.types';
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

    const canCancel = expense.status === ProjectExpenseStatus.PAID && onCancel;

    const getTransactionSourceLabel = (source: string) => {
        const labels: Record<string, string> = {
            [ProjectExpenseTransactionSource.CREATED]: t('label.project_expense.transaction_created'),
            [ProjectExpenseTransactionSource.UPDATED]: t('label.project_expense.transaction_updated'),
            [ProjectExpenseTransactionSource.EXECUTED]: t('label.project_expense.transaction_executed'),
            [ProjectExpenseTransactionSource.CANCELLED]: t('label.project_expense.transaction_cancelled'),
        };
        return labels[source] || source;
    };

    const getTransactionSourceColor = (source: string) => {
        const colors: Record<string, string> = {
            [ProjectExpenseTransactionSource.CREATED]: 'bg-blue-100 text-blue-800',
            [ProjectExpenseTransactionSource.UPDATED]: 'bg-yellow-100 text-yellow-800',
            [ProjectExpenseTransactionSource.EXECUTED]: 'bg-green-100 text-green-800',
            [ProjectExpenseTransactionSource.CANCELLED]: 'bg-red-100 text-red-800',
        };
        return colors[source] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${t('label.project_expense.details')} - ${expense.name}`}
            size="xl"
            showCloseButton={false}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title={t('label.project_expense.expense_info')} padding="md">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">{t('label.project_expense.name')}:</span>
                                <p className="font-medium">{expense.name}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">{t('label.project_expense.activity')}:</span>
                                <p className="font-medium">{expense.activityTitle || '-'}</p>
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
                </div>

                <div className="lg:col-span-1">
                    <Card title={t('label.project_expense.transaction_history')} padding="sm">
                        {expense.transactions && expense.transactions.length > 0 ? (
                            <div className="space-y-3">
                                {expense.transactions.map((transaction, index) => (
                                    <div
                                        key={transaction.id}
                                        className="relative pb-3 border-b border-gray-200 last:border-0 last:pb-0"
                                    >
                                        {index < expense.transactions!.length - 1 && (
                                            <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
                                        )}

                                        <div className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${getTransactionSourceColor(transaction.source)}`}>
                                                <div className="w-2 h-2 bg-current rounded-full" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${getTransactionSourceColor(transaction.source)}`}>
                                                        {getTransactionSourceLabel(transaction.source)}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-gray-500 mb-2">
                                                    {new Date(transaction.createdAt).toLocaleString('ro-RO', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>

                                                <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">{t('label.project_expense.quantity')}:</span>
                                                        <span className="font-medium">{transaction.quantity}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">{t('label.project_expense.unit_price')}:</span>
                                                        <span className="font-medium">
                                                            {transaction.unitPrice.toLocaleString('ro-RO', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">{t('label.project_expense.amount')}:</span>
                                                        <span className="font-medium">
                                                            {transaction.amount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">{t('label.project_expense.vat')}:</span>
                                                        <span className="font-medium">
                                                            {transaction.vatAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                                                        <span className="text-gray-600">{t('label.project_expense.total_amount')}:</span>
                                                        <span className="font-semibold">
                                                            {transaction.totalAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {transaction.currency}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                                {t('label.project_expense.no_transactions')}
                            </p>
                        )}
                    </Card>
                </div>
            </div>

            <div className="flex justify-between pt-4 border-t mt-6">
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
        </Modal>
    );
};