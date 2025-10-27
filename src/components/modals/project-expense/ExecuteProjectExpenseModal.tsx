import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { DynamicForm } from '@/components/forms/DynamicForm';
import projectExpenseService from '@/services/project-expense.service';
import projectFundService from '@/services/project-fund.service';
import showToast from '@/components/ui/Toast';
import { ProjectExpense, ProjectExpenseExecuteRequest, ProjectFund, Vat } from '@/types/index.types';
import { t } from 'i18next';
import vatService from '@/services/vat.service';
import {
    ExecuteProjectExpenseData,
    executeProjectExpenseSchema,
    getExecuteProjectExpenseDefaultValues
} from "@/schemas/project-expense.schema.ts";
import {executeProjectExpenseFormConfig} from "@/config/project-expense.form.config.ts";

interface ExecuteProjectExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    expense: ProjectExpense;
    project: string;
}

export const ExecuteProjectExpenseModal: React.FC<ExecuteProjectExpenseModalProps> = ({
                                                                                          isOpen,
                                                                                          onClose,
                                                                                          onSuccess,
                                                                                          expense,
                                                                                          project
                                                                                      }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [vats, setVats] = useState<Vat[]>([]);
    const [loadingVats, setLoadingVats] = useState(true);
    const [availableFunds, setAvailableFunds] = useState<ProjectFund[]>([]);
    const [loadingFunds, setLoadingFunds] = useState(true);
    const [formValues, setFormValues] = useState<ExecuteProjectExpenseData | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingVats(true);
                setLoadingFunds(true);

                const vatsResponse = await vatService.getList({ pageSize: 100 });
                setVats(vatsResponse.results || []);

                const fundsResponse = await projectFundService.getList({
                    pageSize: 100,
                    filters: {
                        project_id: project,
                        status: 'PAID'
                    }
                });

                const fundsWithRemaining = (fundsResponse.results || []).filter(
                    fund => fund.remainingAmount && fund.remainingAmount > 0
                );
                setAvailableFunds(fundsWithRemaining);

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
        }
    }, [isOpen, project]);

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

    const calculateFundAllocations = () => {
        let remainingAmount = totalAmountNeeded;
        const allocations: { fundId: string; amount: number }[] = [];

        for (const fund of availableFunds) {
            if (remainingAmount <= 0) break;

            const availableFromFund = fund.remainingAmount || 0;
            const toAllocate = Math.min(remainingAmount, availableFromFund);

            if (toAllocate > 0) {
                allocations.push({
                    fundId: fund.id,
                    amount: toAllocate
                });
                remainingAmount -= toAllocate;
            }
        }

        return { allocations, remainingAmount };
    };

    const handleSubmit = async (data: ExecuteProjectExpenseData) => {
        try {
            setIsSubmitting(true);

            const { allocations, remainingAmount } = calculateFundAllocations();

            if (remainingAmount > 0) {
                showToast.error(
                    t('toast.project_expense.insufficient_funds', {
                        remaining: remainingAmount.toFixed(2)
                    })
                );
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
            <Modal isOpen={isOpen} onClose={onClose} title={t('form.project_expense.execute_title')} size="md">
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-600">{t('label.loading')}</div>
                </div>
            </Modal>
        );
    }

    if (availableFunds.length === 0) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={t('form.project_expense.execute_title')} size="md">
                <div className="p-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800">{t('label.project_expense.no_available_funds')}</p>
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

    const { allocations, remainingAmount } = calculateFundAllocations();
    const hasEnoughFunds = remainingAmount <= 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${t('form.project_expense.execute_title')} - ${expense.name}`}
            size="lg"
        >
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
                isSubmitting={isSubmitting}
                onChange={(values) => setFormValues(values as ExecuteProjectExpenseData)}
            />

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">
                    {t('label.project_expense.fund_allocation_preview')}
                </h4>
                {allocations.length > 0 ? (
                    <div className="space-y-2">
                        {allocations.map((allocation, index) => {
                            const fund = availableFunds.find(f => f.id === allocation.fundId);
                            return (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{fund?.sourceName}</span>
                                    <span className="font-semibold text-blue-900">
                                        {allocation.amount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {expense.currency}
                                    </span>
                                </div>
                            );
                        })}
                        {!hasEnoughFunds && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                <p className="text-red-800 text-sm">
                                    {t('label.project_expense.insufficient_funds_warning', {
                                        remaining: remainingAmount.toFixed(2)
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-600 text-sm">{t('label.project_expense.no_allocations')}</p>
                )}
            </div>
        </Modal>
    );
};