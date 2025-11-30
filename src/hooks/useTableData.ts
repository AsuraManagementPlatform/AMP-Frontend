import { useState, useEffect, useCallback, useRef } from 'react';
import { FilterConfig, SortConfig, TableState } from '@/types/table.types';
import {PaginatedResponse} from "@/types/index.types.ts";
import {apiService} from "@/services/api.service.ts";

interface UseTableDataProps {
    endpoint: string;
    initialPageSize?: number;
    initialFilters?: FilterConfig[];
    initialSort?: SortConfig;
    autoFetch?: boolean;
    refreshTrigger?: number;
}

interface UseTableDataReturn<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    fetchData: () => Promise<void>;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setSearch: (search: string) => void;
    setFilters: (filters: FilterConfig[]) => void;
    setSort: (sort: SortConfig | undefined) => void;
    addFilter: (filter: FilterConfig) => void;
    removeFilter: (field: string) => void;
    clearAllFilters: () => void;
    refresh: () => Promise<void>;

    tableState: TableState;
}

const toSnakeCase = (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

const buildQueryParams = (state: TableState): URLSearchParams => {
    const params = new URLSearchParams();

    params.append('page', state.currentPage.toString());
    params.append('page_size', state.pageSize.toString());

    if (state.search.trim()) {
        params.append('search', state.search.trim());
    }

    state.filters.forEach(filter => {
        if (filter.value !== '' && filter.value != null) {
            const operator = filter.operator || 'exact';
            const snakeField = toSnakeCase(filter.field);
            const paramKey = operator === 'exact'
                ? snakeField
                : `${snakeField}__${operator}`;

            if (Array.isArray(filter.value)) {
                filter.value.forEach(val => {
                    params.append(paramKey, val.toString());
                });
            } else {
                params.append(paramKey, filter.value.toString());
            }
        }
    });

    if (state.sort) {
        params.append('sort_by', toSnakeCase(state.sort.field));
        params.append('sort_direction', state.sort.direction);
    }

    return params;
};

export function useTableData<T>({
                                    endpoint,
                                    initialPageSize = 20,
                                    initialFilters = [],
                                    initialSort,
                                    autoFetch = true,
                                    refreshTrigger = 0
                                }: UseTableDataProps): UseTableDataReturn<T> {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    const [tableState, setTableState] = useState<TableState>({
        currentPage: 1,
        pageSize: initialPageSize,
        search: '',
        filters: initialFilters,
        sort: initialSort
    });

    const isMounted = useRef(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const queryParams = buildQueryParams(tableState);
            const separator = endpoint.includes('?') ? '&' : '?';
            const url = `${endpoint}${separator}${queryParams.toString()}`;

            const response = await apiService.get<PaginatedResponse<T>>(url);

            if (isMounted.current) {
                setData(response.results);
                setTotalCount(response.count);
                setHasNext(!!response.next);
                setHasPrevious(!!response.previous);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setData([]);
                setTotalCount(0);
                setHasNext(false);
                setHasPrevious(false);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [endpoint, tableState]);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, fetchData, refreshTrigger]);

    const setPage = useCallback((page: number) => {
        setTableState(prev => ({ ...prev, currentPage: page }));
    }, []);

    const setPageSize = useCallback((size: number) => {
        setTableState(prev => ({ ...prev, pageSize: size, currentPage: 1 }));
    }, []);

    const setSearch = useCallback((search: string) => {
        setTableState(prev => ({ ...prev, search, currentPage: 1 }));
    }, []);

    const setFilters = useCallback((filters: FilterConfig[]) => {
        setTableState(prev => ({ ...prev, filters, currentPage: 1 }));
    }, []);

    const setSort = useCallback((sort: SortConfig | undefined) => {
        setTableState(prev => ({ ...prev, sort }));
    }, []);

    const addFilter = useCallback((filter: FilterConfig) => {
        setTableState(prev => {
            const existingIndex = prev.filters.findIndex(f => f.field === filter.field);
            const newFilters = [...prev.filters];

            if (existingIndex >= 0) {
                newFilters[existingIndex] = filter;
            } else {
                newFilters.push(filter);
            }

            return { ...prev, filters: newFilters, currentPage: 1 };
        });
    }, []);

    const removeFilter = useCallback((field: string) => {
        setTableState(prev => ({
            ...prev,
            filters: prev.filters.filter(f => f.field !== field),
            currentPage: 1
        }));
    }, []);

    const clearAllFilters = useCallback(() => {
        setTableState(prev => ({
            ...prev,
            search: '',
            filters: [],
            sort: undefined,
            currentPage: 1
        }));
    }, []);

    const refresh = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    const totalPages = Math.ceil(totalCount / tableState.pageSize);

    return {
        data,
        loading,
        error,
        totalCount,
        currentPage: tableState.currentPage,
        totalPages,
        hasNext,
        hasPrevious,

        fetchData,
        setPage,
        setPageSize,
        setSearch,
        setFilters,
        setSort,
        addFilter,
        removeFilter,
        clearAllFilters,
        refresh,

        tableState
    };
}
