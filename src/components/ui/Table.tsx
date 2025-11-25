import React, {useState} from 'react';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {ColumnSize, FilterConfig, SortConfig, TableAction, TableColumn} from '@/types/index.types';
import {useTableData} from '@/hooks/useTableData';
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
    const [operator, setOperator] = useState(currentFilter?.operator || 'exact');

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
                    { value: 'exact', label: 'Equal' },
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

    const getButtonStyles = () => {
        const baseStyles = "inline-flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors";
        return `${baseStyles}`;
    };

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                action.onClick(item, index);
            }}
            className={`${getButtonStyles()} ${action.className || ''}`}
            title={action.tooltip || action.label}
        >
            {action.icon !== undefined ? (action.icon) : (action.label)}
        </button>
    );
};

const getColumnWidthClass = (size?: ColumnSize): string => {
    switch (size) {
        case 'sm':
            return 'w-[8%]';
        case 'md':
            return 'w-[15%]';
        case 'lg':
            return 'w-[25%]';
        default:
            return 'w-auto';
    }
};

interface TableProps<T> {
    columns: TableColumn<T>[];
    endpoint: string;
    actions?: TableAction<T>[];
    showFilters?: boolean;
    showPagination?: boolean;
    initialPageSize?: number;
    initialSort?: SortConfig;
    initialFilters?: FilterConfig[];
    onRowClick?: (item: T, index: number) => void;
    emptyMessage?: string;
    refreshTrigger?: number;
}

function Table<T extends Record<string, any>>({
                                                  columns,
                                                  endpoint,
                                                  actions = [],
                                                  showFilters = true,
                                                  showPagination = true,
                                                  initialPageSize = 20,
                                                  initialSort,
                                                  initialFilters = [],
                                                  onRowClick,
                                                  emptyMessage = 'No data available',
                                                  refreshTrigger
                                              }: TableProps<T>) {
    const [openFilterColumn, setOpenFilterColumn] = useState<string | null>(null);

    const {
        data,
        loading,
        currentPage,
        totalCount,
        totalPages,
        hasNext,
        hasPrevious,
        tableState,
        setPage,
        setSort,
        setFilters,
        refresh
    } = useTableData<T>({
        endpoint,
        initialPageSize,
        initialSort,
        initialFilters,
        refreshTrigger
    });

    React.useEffect(() => {
        if (refreshTrigger !== undefined) {
            refresh();
        }
    }, [refreshTrigger, refresh]);

    const handleSort = (field: string) => {
        const currentSort = tableState.sort;
        let newDirection: 'asc' | 'desc' = 'asc';

        if (currentSort?.field === field) {
            newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
        }

        setSort({ field, direction: newDirection });
    };

    const handleFilterChange = (field: string, filter: FilterConfig | null) => {
        const newFilters = tableState.filters.filter(f => f.field !== field);
        if (filter) {
            newFilters.push(filter);
        }
        setFilters(newFilters);
        setPage(1);
    };

    const toggleFilterDropdown = (columnKey: string) => {
        setOpenFilterColumn(openFilterColumn === columnKey ? null : columnKey);
    };

    const getSortIcon = (field: string) => {
        const currentSort = tableState.sort;
        if (currentSort?.field === field) {
            return currentSort.direction === 'asc' ? <ArrowUp className="flex-shrink-0"/> : <ArrowDown className="flex-shrink-0"/>;
        }
        return <ArrowUpDown className="flex-shrink-0"/>;
    };

    const allColumns: TableColumn<T>[] = [
        ...columns,
        ...(actions.length > 0
            ? [{
                key: 'actions' as keyof T,
                label: 'Actions',
                sortable: false,
                filterable: false,
                size: 'md' as ColumnSize,
                render: (_: any, item: T, index: number) => (
                    <div className="flex items-center gap-2">
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
            }]
            : [])
    ];

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg shadow">
                <div className="overflow-hidden overflow-x-auto">
                    <table className="min-w-full table-fixed divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            {allColumns.map((column) => {
                                const widthClass = getColumnWidthClass(column.size as ColumnSize);
                                const stickyClasses = column.sticky === 'left' 
                                    ? 'sticky left-0 z-10 bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' 
                                    : column.sticky === 'right' 
                                    ? 'sticky right-0 z-10 bg-gray-50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]' 
                                    : '';
                                return (
                                    <th
                                        key={String(column.key)}
                                        className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${widthClass} ${column.className || ''} ${stickyClasses}`}
                                    >
                                        <div className="flex items-center justify-between gap-2 relative">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {column.sortable && (
                                                    <SecondaryButton
                                                        onClick={() => handleSort(String(column.key))}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-1 !min-w-0 flex-shrink-0"
                                                    >
                                                        {getSortIcon(String(column.key))}
                                                    </SecondaryButton>
                                                )}
                                                <span className="truncate">{column.label}</span>
                                            </div>
                                            {column.filterable && showFilters && column.key !== 'actions' && (
                                                <div className="relative flex-shrink-0">
                                                    <SecondaryButton
                                                        onClick={() => toggleFilterDropdown(String(column.key))}
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`!p-1 !min-w-0 ${tableState.filters.find(f => f.field === column.key) ? 'text-blue-600' : ''}`}
                                                    >
                                                        <FilterIcon className="w-4 h-4 flex-shrink-0" />
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
                                );
                            })}
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
                            <>
                                {data.map((item, index) => (
                                    <tr
                                        key={item.id || index}
                                        onClick={() => onRowClick?.(item, index)}
                                        className={`${
                                            onRowClick ? 'cursor-pointer hover:bg-blue-50' : 'hover:bg-gray-50'
                                        } ${loading ? 'opacity-50' : ''} transition-colors duration-150 ease-in-out`}
                                    >
                                        {allColumns.map((column) => {
                                            const widthClass = getColumnWidthClass(column.size as ColumnSize);
                                            const stickyClasses = column.sticky === 'left' 
                                                ? 'sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' 
                                                : column.sticky === 'right' 
                                                ? 'sticky right-0 z-10 bg-white shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]' 
                                                : '';
                                            return (
                                                <td
                                                    key={String(column.key)}
                                                    className={`px-6 py-4 text-sm text-gray-900 ${widthClass} ${stickyClasses}`}
                                                >
                                                    <div className="truncate">
                                                        {column.render
                                                            ? column.render(item[column.key], item, index)
                                                            : item[column.key] || '-'
                                                        }
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                {Array.from({ length: 1 }).map((_, i) => (
                                    <tr key={`empty-${i}`}>
                                        {allColumns.map((column) => (
                                            <td key={String(column.key)} className="px-6 py-4 text-sm text-gray-900">
                                                <div className="h-5"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </>
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
                                Showing <span className="font-medium">{((currentPage - 1) * tableState.pageSize) + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(currentPage * tableState.pageSize, totalCount)}</span> of{' '}
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