import React, {useState} from 'react';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {FilterConfig, SortConfig, TableAction, TableColumn} from '@/types/index.types';
import {useTableData} from '@/hooks/useTableData';
import {Button} from "@/components/ui/Button.tsx";
import {SecondaryButton} from "@/components/ui/SecondaryButton.tsx";
import RefreshIcon from '@/assets/icons/iconmonstr-refresh-3.svg?react';
import ArrowUp from '@/assets/icons/iconmonstr-arrow-up.svg?react';
import ArrowDown from '@/assets/icons/iconmonstr-arrow-down.svg?react';
import ArrowUpDown from '@/assets/icons/iconmonstr-cursor-up-down.svg?react';

interface FilterInputProps {
    column: TableColumn<any>;
    currentFilter?: FilterConfig;
    onFilterChange: (filter: FilterConfig | null) => void;
}

const FilterInput: React.FC<FilterInputProps> = ({ column, currentFilter, onFilterChange }) => {
    const [value, setValue] = useState(currentFilter?.value || '');
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
        <div className="flex flex-col space-y-2 p-2 bg-gray-50 border-b">
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
                    value={value}
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
                                                                 className = 'flex gap-4',
                                                                 showSearch = true,
                                                                 showFilters = true,
                                                                 showPagination = true
                                                     }: Table<T>) {
    const [showFilterRow] = useState(true);

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
        setSearch,
        addFilter,
        removeFilter,
        clearAllFilters,
        setSort,
        refresh,
        tableState
    } = useTableData<T>({
        endpoint,
        initialFilters,
        initialSort,
        initialPageSize: pageSize
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
        if (currentSort?.field !== field) return <ArrowUpDown className="w-4 h-4"></ArrowUpDown>;
        return currentSort.direction === 'asc' ? <ArrowUp className="w-4 h-4"></ArrowUp> : <ArrowDown className="w-4 h-4"></ArrowDown>;
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
            {(showSearch || showFilters) && (
                <div className="overflow-hidden border border-gray-200 rounded-lg shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                {showFilterRow && showFilters && (
                                    <tr>
                                        {allColumns.map((column) => (
                                            <th key={`filter-${String(column.key)}`} className="p-0">
                                                {column.key !== 'actions' && (
                                                    <FilterInput
                                                        column={column}
                                                        currentFilter={tableState.filters.find(f => f.field === column.key)}
                                                        onFilterChange={(filter) => handleFilterChange(String(column.key), filter)}
                                                    />
                                                )}
                                            </th>
                                        ))}
                                        <th className={'w-auto text-right'}>
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={clearAllFilters}
                                                    className="px-2 py-1 mr-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm font-medium"
                                                    disabled={tableState.filters.length === 0 && !tableState.search}
                                                >
                                                    Clear All
                                                </Button>
                                            </div>
                                        </th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        {tableState.filters.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {tableState.filters.map((filter, index) => (
                                                    <span key={index} className="inline-flex items-center px-2 py-1 m-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    {filter.field} {filter.operator} "{filter.value}"
                                                        <Button onClick={() => removeFilter(filter.field)}>×</Button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <div className="overflow-hidden border border-gray-200 rounded-lg shadow">
                <div className="overflow-x-auto">
                    <div className="flex gap-4 justify-between p-2">
                        <SecondaryButton
                            onClick={refresh}
                            disabled={loading}
                            variant="ghost"
                            size="sm"
                        >
                            {loading ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <RefreshIcon className="w-4 h-4" />}
                        </SecondaryButton>
                        {(
                            <input
                                type="text"
                                value={tableState.search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-md"
                            />
                        )}
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {allColumns.map((column) => (
                                    <th
                                        key={String(column.key)}
                                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                                        style={{ width: column.width }}
                                    >
                                        <div className="flex items-center">
                                            <span>{column.label}</span>
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