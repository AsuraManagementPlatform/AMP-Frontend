import { useState, useMemo } from 'react';
import { TableColumn, TableAction, SortConfig } from '@/types/index.types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

interface DataTableProps<T> {
    data: T[] | undefined;
    columns: TableColumn<T>[];
    actions?: TableAction<T>[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
    showFilters?: boolean;
    showPagination?: boolean;
    initialPageSize?: number;
    className?: string;
}

export function DataTable<T extends Record<string, any>>({
                                                             data = [],
                                                             columns,
                                                             actions = [],
                                                             loading = false,
                                                             emptyMessage = 'No data available',
                                                             onRowClick,
                                                             showPagination = true,
                                                             initialPageSize = 10,
                                                         }: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [sortConfig, setSortConfig] = useState<SortConfig | undefined>();

    const paginatedData = useMemo(() => {
        if (!showPagination) return data;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return data.slice(startIndex, endIndex);
    }, [data, currentPage, pageSize, showPagination]);

    const totalPages = Math.ceil(data.length / pageSize);

    const handleSort = (field: string) => {
        const column = columns.find(col => col.key === field);
        if (!column?.sortable) return;

        setSortConfig(prev => {
            if (prev?.field === field) {
                return {
                    field,
                    direction: prev.direction === 'asc' ? 'desc' : 'asc'
                };
            }
            return { field, direction: 'asc' };
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const renderPagination = () => {
        if (!showPagination || data.length <= pageSize) return null;

        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} results
                    </span>
                    <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                </div>

                <div className="flex gap-1">
                    <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        First
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    {pages.map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 border rounded ${
                                currentPage === page
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Last
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Alert variant="info">
                {emptyMessage}
            </Alert>
        );
    }

    return (
        <div className={`w-full`}>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={String(column.key)}
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                                }`}
                                onClick={() => column.sortable && handleSort(String(column.key))}
                            >
                                <div className="flex items-center gap-2">
                                    {column.label}
                                    {column.sortable && sortConfig?.field === column.key && (
                                        <span className="text-orange-500">
                                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                            </span>
                                    )}
                                </div>
                            </th>
                        ))}
                        {actions.length > 0 && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((item, index) => (
                        <tr
                            key={index}
                            onClick={() => onRowClick?.(item)}
                            className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                        >
                            {columns.map((column) => (
                                <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap">
                                    {column.render
                                        ? column.render(item[column.key], item, index)
                                        : item[column.key]?.toString() || '-'
                                    }
                                </td>
                            ))}
                            {actions.length > 0 && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        {actions
                                            .filter(action => !action.show || action.show(item))
                                            .map((action, actionIndex) => (
                                                <button
                                                    key={actionIndex}
                                                    onClick={() => action.onClick(item, index)}
                                                    className={`inline-flex items-center gap-1 px-3 py-1 text-sm rounded ${
                                                        action.variant === 'danger'
                                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            : action.variant === 'secondary'
                                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                                    }`}
                                                    title={action.label}
                                                >
                                                    {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                                                    {action.label}
                                                </button>
                                            ))}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {renderPagination()}
        </div>
    );
}

export default DataTable;