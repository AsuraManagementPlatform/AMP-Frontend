export interface FilterConfig {
    field: string;
    operator: 'exact' | 'icontains' | 'gte' | 'lte' | 'gt' | 'lt' | 'endswith' | 'startswith';
    value: any;
}

export interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    render?: (value: any, item: T, index: number) => React.ReactNode;
    className?: string;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'select' | 'date' | 'number';
    filterOptions?: Array<{ label: string; value: any }>;
    width?: string;
}

export interface TableAction<T> {
    label: string;
    onClick: (item: T, index: number) => void;
    className?: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    show?: (item: T) => boolean;
}

export interface TableState {
    currentPage: number;
    pageSize: number;
    search: string;
    filters: FilterConfig[];
    sort?: SortConfig;
}

export interface TableMetadata {
    model: string;
    filterable_fields: Record<string, Record<string, string>>;
    sortable_fields: string[];
    search_fields: string[];
    pagination: {
        page_size: number;
        max_page_size: number;
    };
}
