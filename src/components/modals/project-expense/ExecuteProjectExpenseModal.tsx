import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import projectExpenseService from '@/services/project-expense.service';
import projectFundService from '@/services/project-fund.service';
import showToast from '@/components/ui/Toast';
import {
    ProjectExpense,
    ProjectExpenseExecuteRequest,
    Vat,
    AvailableFundsResponse,
    AvailableFundForExpense
} from '@/types/index.types';
import { t } from 'i18next';
import vatService from '@/services/vat.service';
import {
    ExecuteProjectExpenseData,
    executeProjectExpenseSchema,
    getExecuteProjectExpenseDefaultValues
} from "@/schemas/project-expense.schema.ts";
import { executeProjectExpenseFormConfig } from "@/config/project-expense.form.config.ts";
import {FundAllocationSection} from "@/components/modals/project-expense/FundAllocationSection.tsx";

interface ExecuteProjectExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expense: ProjectExpense;
}

interface FundAllocation {
    fundId: string;
    amount: number;
}

export const ExecuteProjectExpenseModal: React.FC<ExecuteProjectExpenseModalProps> = ({
                                                                                          isOpen,
                                                                                          onClose,
                                                                                          onSuccess,
                                                                                          expense
                                                                                      }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [vats, setVats] = useState<Vat[]>([]);
    const [loadingVats, setLoadingVats] = useState(true);
    const [availableFundsData, setAvailableFundsData] = useState<AvailableFundsResponse | null>(null);
    const [loadingFunds, setLoadingFunds] = useState(true);
    const [formValues, setFormValues] = useState<ExecuteProjectExpenseData | null>(null);
    const [fundAllocations, setFundAllocations] = useState<Record<string, number>>({});

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingVats(true);
                setLoadingFunds(true);

                const vatsResponse = await vatService.getList({ pageSize: 100 });
                setVats(vatsResponse.results || []);

                const fundsResponse = await projectFundService.getAvailableForExpense(expense.id);
                setAvailableFundsData(fundsResponse);

            } catch (error) {
                if (error instanceof Error) {
                    showToast.error(error.message);
                } else {
                    showToast.error(t('toast.project_expense.load_data_error'));
                }
            } finally {
                setLoadingVats(false);
                setLoadingFunds(false);
            }
        };

        if (isOpen) {
            loadData();
            setFundAllocations({});
        }
    }, [isOpen, expense.id]);

    const totalAmountNeeded = useMemo(() => {
        if (!formValues) return expense.totalAmount || 0;

        const quantity = formValues.quantity || expense.quantity;
        const unitPrice = formValues.unitPrice || expense.unitPrice;
        const vatObj = vats.find(v => v.id === formValues.vat);
        const vatPercentage = vatObj ? vatObj.value : 0;

        const amount = quantity * unitPrice;
        const vatAmount = amount * vatPercentage / 100;
        return amount + vatAmount;
    }, [formValues, expense, vats]);

    const totalAllocated = useMemo(() => {
        return Object.values(fundAllocations).reduce((sum, amount) => sum + (amount || 0), 0);
    }, [fundAllocations]);

    const remainingNeeded = useMemo(() => {
        return totalAmountNeeded - totalAllocated;
    }, [totalAmountNeeded, totalAllocated]);

    const isAllocationComplete = useMemo(() => {
        return Math.abs(remainingNeeded) < 0.01;
    }, [remainingNeeded]);

    const isOverAllocated = useMemo(() => {
        return totalAllocated > totalAmountNeeded;
    }, [totalAllocated, totalAmountNeeded]);

    const handleAllocationChange = (fundId: string, value: string) => {
        const numValue = parseFloat(value) || 0;

        const otherAllocations = Object.entries(fundAllocations)
            .filter(([id]) => id !== fundId)
            .reduce((sum, [, amount]) => sum + amount, 0);

        const maxAllowedForThisFund = Math.max(0, totalAmountNeeded - otherAllocations);
        const fund = [...(availableFundsData?.activityFunds || []), ...(availableFundsData?.projectFunds || [])].find(f => f.id === fundId);
        const maxAvailable = fund?.remainingAmount || 0;

        const cappedValue = Math.min(numValue, maxAllowedForThisFund, maxAvailable);

        setFundAllocations(prev => ({
            ...prev,
            [fundId]: Number(cappedValue.toFixed(2))
        }));
    };

    const handleAutoAllocate = () => {
        let remaining = totalAmountNeeded;
        const newAllocations: Record<string, number> = {};

        if (!availableFundsData) return;

        for (const fund of availableFundsData.activityFunds) {
            if (remaining <= 0) break;
            const toAllocate = Math.min(remaining, fund.remainingAmount);
            if (toAllocate > 0) {
                newAllocations[fund.id] = Number(toAllocate.toFixed(2));
                remaining -= toAllocate;
            }
        }

        for (const fund of availableFundsData.projectFunds) {
            if (remaining <= 0) break;
            const toAllocate = Math.min(remaining, fund.remainingAmount);
            if (toAllocate > 0) {
                newAllocations[fund.id] = Number(toAllocate.toFixed(2));
                remaining -= toAllocate;
            }
        }

        setFundAllocations(newAllocations);
    };

    const handleClearAllocations = () => {
        setFundAllocations({});
    };

    const getRemainingAfterAllocation = (fund: AvailableFundForExpense): number => {
        const allocated = fundAllocations[fund.id] || 0;
        return fund.remainingAmount - allocated;
    };

    const handleSubmit = async (data: ExecuteProjectExpenseData) => {
        try {
            setIsSubmitting(true);

            if (isOverAllocated) {
                showToast.error(t('toast.project_expense.over_allocated'));
                return;
            }

            if (!isAllocationComplete) {
                showToast.error(
                    t('toast.project_expense.insufficient_funds', {
                        remaining: Math.abs(remainingNeeded).toFixed(2)
                    })
                );
                return;
            }

            const allocations: FundAllocation[] = Object.entries(fundAllocations)
                .filter(([, amount]) => amount > 0)
                .map(([fundId, amount]) => ({
                    fundId,
                    amount: Number(amount.toFixed(2))
                }));

            if (allocations.length === 0) {
                showToast.error(t('schema.project_expense.funds_required'));
                return;
            }

            const executeRequest: ProjectExpenseExecuteRequest = {
                vat: data.vat,
                quantity: data.quantity,
                unitPrice: data.unitPrice,
                date: data.date,
                fundAllocations: allocations
            };

            await projectExpenseService.execute(expense.id, executeRequest);
            showToast.success(t('toast.project_expense.executed'));
            onSuccess();
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || t('toast.project_expense.execute_error');
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formConfig = executeProjectExpenseFormConfig(vats);
    const defaultValues = getExecuteProjectExpenseDefaultValues(expense);

    if (loadingVats || loadingFunds) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={t('form.project_expense.execute_title')} size="lg">
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-600">{t('label.loading')}</div>
                </div>
            </Modal>
        );
    }

    if (!availableFundsData || (availableFundsData.activityFunds.length === 0 && availableFundsData.projectFunds.length === 0)) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={t('form.project_expense.execute_title')} size="lg">
                <div className="p-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800">{t('label.project_expense.no_available_funds')}</p>
                        {expense.activity && (
                            <p className="text-yellow-700 text-sm mt-2">
                                {t('label.project_partner.no_activity_funds_hint')}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                        {t('action.close')}
                    </button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${t('form.project_expense.execute_title')} - ${expense.name}`}
            size="xl"
        >
            {expense.activity && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                        <span className="font-semibold">{t('label.project_expense.activity')}:</span> {expense.activityTitle}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                        {t('label.project_expense.activity_funds_prioritized')}
                    </p>
                </div>
            )}

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    {t('label.project_expense.expense_info')}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">{t('label.project_expense.original_amount')}:</span>
                        <p className="font-semibold">
                            {expense.totalAmount?.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {expense.currency}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600">{t('label.project_expense.new_amount')}:</span>
                        <p className="font-semibold">
                            {totalAmountNeeded.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {expense.currency}
                        </p>
                    </div>
                </div>
            </div>

            <DynamicForm<ExecuteProjectExpenseData>
                config={formConfig}
                schema={executeProjectExpenseSchema}
                onSubmit={handleSubmit}
                onCancel={onClose}
                defaultValues={defaultValues}
                isSubmitting={isSubmitting || isOverAllocated}
                onChange={(values) => setFormValues(values as ExecuteProjectExpenseData)}
            >
                <FundAllocationSection
                    activityFunds={availableFundsData.activityFunds}
                    projectFunds={availableFundsData.projectFunds}
                    fundAllocations={fundAllocations}
                    onAllocationChange={handleAllocationChange}
                    onAutoAllocate={handleAutoAllocate}
                    onClearAllocations={handleClearAllocations}
                    getRemainingAfterAllocation={getRemainingAfterAllocation}
                />

                <div className={`mt-4 p-4 rounded-lg border ${
                    isAllocationComplete
                        ? 'bg-green-50 border-green-200'
                        : isOverAllocated
                            ? 'bg-red-50 border-red-200'
                            : 'bg-yellow-50 border-yellow-200'
                }`}>
                    <div className="flex items-center justify-between text-sm">
                        <div className="space-y-1">
                            <p className="text-gray-700">
                                <span className="font-semibold">{t('label.project_expense.total_allocated')}:</span>{' '}
                                {totalAllocated.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {expense.currency}
                            </p>
                            {!isAllocationComplete && (
                                <p className={isOverAllocated ? 'text-red-800' : 'text-yellow-800'}>
                                    <span className="font-semibold">
                                        {isOverAllocated ? t('label.project_expense.over_allocated_by') : t('label.project_expense.still_needed')}:
                                    </span>{' '}
                                    {Math.abs(remainingNeeded).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {expense.currency}
                                </p>
                            )}
                        </div>
                        {isAllocationComplete && (
                            <div className="flex items-center gap-2 text-green-700">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">{t('label.project_expense.allocation_complete')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </DynamicForm>
        </Modal>
    );
};