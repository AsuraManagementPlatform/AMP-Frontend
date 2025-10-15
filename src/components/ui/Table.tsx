import React, {useState} from 'react';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {FilterConfig, SortConfig, TableAction, TableColumn} from '@/types/index.types';
import {useTableData} from '@/hooks/useTableData';
import {Button} from "@/components/ui/Button.tsx";
import {SecondaryButton} from "@/components/ui/SecondaryButton.tsx";
import ArrowUp from '@/assets/icons/iconmonstr-arrow-up.svg?react';
import ArrowDown from '@/assets/icons/iconmonstr-arrow-down.svg?react';
import ArrowUpDown from '@/assets/icons/iconmonstr-cursor-up-down.svg?react';
import FilterIcon from '@/assets/icons/iconmonstr-filter.svg?react';

interface FilterInputProps {
    column: TableColumn<any>;
    currentFilter?: FilterConfig;
    onFilterChange: (filter: FilterConfig | null) => void;
    onClose: () => void;
}

const FilterInput: React.FC<FilterInputProps> = ({ column, currentFilter, onFilterChange, onClose }) => {
    const [value, setValue] = useState(() => {
        if (Array.isArray(currentFilter?.value)) {
            return currentFilter.value[0] || '';
        }
        return currentFilter?.value || '';
    });
    const [operator, setOperator] = useState(currentFilter?.operator || 'icontains');

    if (!column.filterable) return null;

    const handleChange = (newValue: string, newOperator?: string) => {
        const finalOperator = newOperator || operator;
        setValue(newValue);

        if (newValue.trim()) {
            onFilterChange({
                field: String(column.key),
                operator: finalOperator as any,
                value: column.filterType === 'number' ? Number(newValue) : newValue
            });
        } else {
            onFilterChange(null);
        }
    };

    const handleClear = () => {
        setValue('');
        onFilterChange(null);
        onClose();
    };

    const getOperatorOptions = () => {
        switch (column.filterType) {
            case 'text':
                return [
                    { value: 'icontains', label: 'Contains' },
                ];
            case 'number':
            case 'date':
                return [
                    { value: 'exact', label: 'Equal' },
                    { value: 'gte', label: '>=' },
                    { value: 'lte', label: '<=' },
                    { value: 'gt', label: '>' },
                    { value: 'lt', label: '<' }
                ];
            case 'select':
                return [{ value: 'exact', label: 'Equal' }];
            default:
                return [{ value: 'exact', label: 'Equal' }];
        }
    };

    return (
        <div className="absolute top-full right-0 mt-1 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[200px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col space-y-2">
                {column.filterType !== 'select' && getOperatorOptions().length > 1 && (
                    <select
                        value={operator}
                        onChange={(e) => {
                            setOperator(e.target.value as any);
                            handleChange(value, e.target.value);
                        }}
                        className="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {getOperatorOptions().map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )}

                {column.filterType === 'select' && column.filterOptions ? (
                    <select
                        value={Array.isArray(value) ? value[0] || '' : value}
                        onChange={(e) => handleChange(e.target.value)}
                        className="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All</option>
                        {column.filterOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={column.filterType === 'number' ? 'number' : column.filterType === 'date' ? 'date' : 'text'}
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={`Filter ${column.label}`}
                        className="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                )}

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={handleClear}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                    >
                        Clear
                    </button>
                    <button
                        onClick={onClose}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ActionButtonProps<T> {
    action: TableAction<T>;
    item: T;
    index: number;
}

const ActionButton = <T,>({ action, item, index }: ActionButtonProps<T>) => {
    if (action.show && !action.show(item)) {
        return null;
    }

    return (
        <SecondaryButton
            onClick={(e) => {
                e.stopPropagation();
                action.onClick(item, index);
            }}
            variant="ghost"
            size="sm"
            className={`${action.className || ''} !p-1.5 !min-w-0`}
            title={action.tooltip || action.label}
        >
            {action.icon !== undefined ? (action.icon) : (action.label)}
        </SecondaryButton>
    );
};

interface Table<T> {
    endpoint: string;
    columns: TableColumn<T>[];
    actions?: TableAction<T>[];
    onRowClick?: (item: T, index: number) => void;
    emptyMessage?: string;
    initialFilters?: FilterConfig[];
    initialSort?: SortConfig;
    pageSize?: number;
    autoFetch?: boolean;
    refreshTrigger?: number;
    showSearch?: boolean;
    showFilters?: boolean;
    showPagination?: boolean;
    className?: string;
}

export function Table<T extends Record<string, any>>({
                                                         endpoint,
                                                         columns,
                                                         actions = [],
                                                         onRowClick,
                                                         emptyMessage = 'No data available',
                                                         initialFilters = [],
                                                         initialSort,
                                                         pageSize = 20,
                                                         autoFetch = true,
                                                         refreshTrigger = 0,
                                                         className = 'flex gap-4',
                                                         showFilters = true,
                                                         showPagination = true
                                                     }: Table<T>) {
    const [openFilterColumn, setOpenFilterColumn] = useState<string | null>(null);

    const {
        data,
        loading,
        error,
        totalCount,
        currentPage,
        totalPages,
        hasNext,
        hasPrevious,
        setPage,
        addFilter,
        removeFilter,
        setSort,
        refresh,
        tableState
    } = useTableData<T>({
        endpoint,
        initialFilters,
        initialSort,
        initialPageSize: pageSize,
        autoFetch,
        refreshTrigger
    });

    const allColumns = [...columns];

    if (actions.length > 0) {
        allColumns.push({
            key: 'actions',
            label: 'Actions',
            className: 'w-40',
            render: (_, item: T, index: number) => (
                <div className="flex space-x-2 justify-center">
                    {actions.map((action, actionIndex) => (
                        <ActionButton
                            key={actionIndex}
                            action={action}
                            item={item}
                            index={index}
                        />
                    ))}
                </div>
            )
        });
    }

    const handleSort = (field: string) => {
        const column = columns.find(col => col.key === field);
        if (!column?.sortable) return;

        const currentSort = tableState.sort;
        if (currentSort?.field === field) {
            if (currentSort.direction === 'asc') {
                setSort({ field, direction: 'desc' });
            } else {
                setSort(undefined);
            }
        } else {
            setSort({ field, direction: 'asc' });
        }
    };

    const handleFilterChange = (field: string, filter: FilterConfig | null) => {
        if (filter) {
            addFilter(filter);
        } else {
            removeFilter(field);
        }
    };

    const getSortIcon = (field: string) => {
        const currentSort = tableState.sort;
        if (currentSort?.field !== field) return <ArrowUpDown className="w-4 h-4" />;
        return currentSort.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
    };

    const toggleFilterDropdown = (field: string) => {
        setOpenFilterColumn(openFilterColumn === field ? null : field);
    };

    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                <p>Error: {error}</p>
                <Button
                    onClick={refresh}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className="overflow-hidden border border-gray-200 rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            {allColumns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                                    style={{ width: column.width }}
                                >
                                    <div className="flex items-center justify-between gap-2 relative">
                                        <div className="flex items-center gap-2">
                                            {column.sortable && (
                                                <SecondaryButton
                                                    onClick={() => handleSort(String(column.key))}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="!p-1 !min-w-0"
                                                >
                                                    {getSortIcon(String(column.key))}
                                                </SecondaryButton>
                                            )}
                                            <span>{column.label}</span>
                                        </div>
                                        {column.filterable && showFilters && column.key !== 'actions' && (
                                            <div className="relative">
                                                <SecondaryButton
                                                    onClick={() => toggleFilterDropdown(String(column.key))}
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`!p-1 !min-w-0 ${tableState.filters.find(f => f.field === column.key) ? 'text-blue-600' : ''}`}
                                                >
                                                    <FilterIcon className="w-4 h-4" />
                                                </SecondaryButton>
                                                {openFilterColumn === String(column.key) && (
                                                    <FilterInput
                                                        column={column}
                                                        currentFilter={tableState.filters.find(f => f.field === column.key)}
                                                        onFilterChange={(filter) => handleFilterChange(String(column.key), filter)}
                                                        onClose={() => setOpenFilterColumn(null)}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                        {loading && (!data || data.length === 0) ? (
                            <tr>
                                <td colSpan={allColumns.length} className="text-center py-8">
                                    <LoadingSpinner />
                                </td>
                            </tr>
                        ) : (!data || data.length === 0) ? (
                            <tr>
                                <td colSpan={allColumns.length} className="text-center py-8 text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr
                                    key={item.id || index}
                                    onClick={() => onRowClick?.(item, index)}
                                    className={`${
                                        onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                                    } ${loading ? 'opacity-50' : ''}`}
                                >
                                    {allColumns.map((column) => (
                                        <td
                                            key={String(column.key)}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {column.render
                                                ? column.render(item[column.key], item, index)
                                                : item[column.key] || '-'
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showPagination && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between flex-1 sm:hidden">
                        <SecondaryButton
                            onClick={() => setPage(currentPage - 1)}
                            disabled={!hasPrevious || loading}
                            variant="outline"
                            size="sm"
                        >
                            Previous
                        </SecondaryButton>
                        <SecondaryButton
                            onClick={() => setPage(currentPage + 1)}
                            disabled={!hasNext || loading}
                            variant="outline"
                            size="sm"
                        >
                            Next
                        </SecondaryButton>
                    </div>

                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                                <span className="font-medium">{totalCount}</span> results
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <SecondaryButton
                                onClick={() => setPage(1)}
                                disabled={currentPage === 1 || loading}
                                variant="outline"
                                size="sm"
                            >
                                First
                            </SecondaryButton>
                            <SecondaryButton
                                onClick={() => setPage(currentPage - 1)}
                                disabled={!hasPrevious || loading}
                                variant="outline"
                                size="sm"
                            >
                                Previous
                            </SecondaryButton>

                            <span className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded">
                                Page {currentPage} of {totalPages}
                            </span>

                            <SecondaryButton
                                onClick={() => setPage(currentPage + 1)}
                                disabled={!hasNext || loading}
                                variant="outline"
                                size="sm"
                            >
                                Next
                            </SecondaryButton>
                            <SecondaryButton
                                onClick={() => setPage(totalPages)}
                                disabled={currentPage === totalPages || loading}
                                variant="outline"
                                size="sm"
                            >
                                Last
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Table;