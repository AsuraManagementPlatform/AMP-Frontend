import React from 'react';
import { BaseComponentProps } from '@/types/index.types.ts';
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx";

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    render?: (value: any, item: T, index: number) => React.ReactNode;
    className?: string;
}

interface TableProps<T> extends BaseComponentProps {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T, index: number) => void;
}

export function Table<T extends Record<string, any>>({data, columns, loading = false, emptyMessage = 'No data available', onRowClick, className = ''}: TableProps<T>) {
    if (loading) {
        return (
            <div className="text-center py-4">
                <LoadingSpinner />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    {columns.map((column) => (
                        <th
                            key={String(column.key)}
                            className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                        >
                            {column.label}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item, index) => (
                    <tr
                        key={item.id || index}
                        onClick={() => onRowClick?.(item, index)}
                        className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                    >
                        {columns.map((column) => (
                            <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm">
                                {column.render
                                    ? column.render(item[column.key], item, index)
                                    : item[column.key]
                                }
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}