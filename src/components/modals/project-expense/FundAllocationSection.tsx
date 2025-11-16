import React from 'react';
import { AvailableFundForExpense } from '@/types/index.types';
import { t } from 'i18next';

interface FundAllocationRowProps {
    fund: AvailableFundForExpense;
    allocated: number;
    remainingAfter: number;
    hasError: boolean;
    onAllocationChange: (fundId: string, value: string) => void;
}

const FundAllocationRow: React.FC<FundAllocationRowProps> = ({
                                                                 fund,
                                                                 allocated,
                                                                 remainingAfter,
                                                                 hasError,
                                                                 onAllocationChange
                                                             }) => {
    return (
        <div className={`p-3 rounded-lg border ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <p className="font-medium text-gray-900">{fund.sourceName}</p>
                    <p className="text-xs text-gray-500">{fund.category}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    fund.priority === 'high'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                }`}>
                    {fund.priority === 'high'
                        ? t('label.project_partner.priority_high')
                        : t('label.project_partner.priority_normal')
                    }
                </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                    <label className="text-xs text-gray-500 block mb-1">
                        {t('label.project_expense.fund_available')}
                    </label>
                    <p className="font-semibold text-gray-700">
                        {fund.remainingAmount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {fund.currency}
                    </p>
                </div>

                <div>
                    <label htmlFor={`fund-${fund.id}`} className="text-xs text-gray-500 block mb-1">
                        {t('label.project_expense.fund_to_allocate')}
                    </label>
                    <input
                        id={`fund-${fund.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        max={fund.remainingAmount}
                        value={allocated || ''}
                        onChange={(e) => onAllocationChange(fund.id, e.target.value)}
                        className={`w-full px-2 py-1 border rounded text-sm ${
                            hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-500 block mb-1">
                        {t('label.project_expense.fund_remaining_after')}
                    </label>
                    <p className={`font-semibold ${
                        hasError ? 'text-red-600' : 'text-gray-700'
                    }`}>
                        {remainingAfter.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} {fund.currency}
                    </p>
                </div>
            </div>

            {hasError && (
                <p className="text-xs text-red-600 mt-2">
                    {t('toast.project_expense.insufficient_funds', {
                        remaining: (allocated - fund.remainingAmount).toFixed(2)
                    })}
                </p>
            )}
        </div>
    );
};

interface FundAllocationSectionProps {
    activityFunds: AvailableFundForExpense[];
    projectFunds: AvailableFundForExpense[];
    fundAllocations: Record<string, number>;
    onAllocationChange: (fundId: string, value: string) => void;
    onAutoAllocate: () => void;
    onClearAllocations: () => void;
    getRemainingAfterAllocation: (fund: AvailableFundForExpense) => number;
}

export const FundAllocationSection: React.FC<FundAllocationSectionProps> = ({
                                                                                activityFunds,
                                                                                projectFunds,
                                                                                fundAllocations,
                                                                                onAllocationChange,
                                                                                onAutoAllocate,
                                                                                onClearAllocations,
                                                                                getRemainingAfterAllocation
                                                                            }) => {
    return (
        <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                    {t('label.project_expense.available_funds_title')}
                </h4>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onClearAllocations}
                        className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                        disabled={Object.keys(fundAllocations).length === 0}
                    >
                        {t('label.project_expense.clear_allocations')}
                    </button>
                    <button
                        type="button"
                        onClick={onAutoAllocate}
                        className="text-xs px-3 py-1 text-blue-600 hover:text-blue-800 border border-blue-300 rounded hover:bg-blue-50"
                    >
                        {t('label.project_expense.auto_allocate')}
                    </button>
                </div>
            </div>

            {activityFunds.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                            {t('label.project_partner.priority_high')}
                        </span>
                        <span className="text-sm text-gray-600">
                            {t('label.project_expense.activity_funds_section')}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {activityFunds.map(fund => (
                            <FundAllocationRow
                                key={fund.id}
                                fund={fund}
                                allocated={fundAllocations[fund.id] || 0}
                                remainingAfter={getRemainingAfterAllocation(fund)}
                                hasError={(fundAllocations[fund.id] || 0) > fund.remainingAmount}
                                onAllocationChange={onAllocationChange}
                            />
                        ))}
                    </div>
                </div>
            )}

            {projectFunds.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            {t('label.project_partner.priority_normal')}
                        </span>
                        <span className="text-sm text-gray-600">
                            {t('label.project_expense.project_funds_section')}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {projectFunds.map(fund => (
                            <FundAllocationRow
                                key={fund.id}
                                fund={fund}
                                allocated={fundAllocations[fund.id] || 0}
                                remainingAfter={getRemainingAfterAllocation(fund)}
                                hasError={(fundAllocations[fund.id] || 0) > fund.remainingAmount}
                                onAllocationChange={onAllocationChange}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};