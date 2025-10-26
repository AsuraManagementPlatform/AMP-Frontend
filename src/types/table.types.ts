export interface FilterConfig {
    field: string;
    operator: 'exact' | 'icontains' | 'gte' | 'lte' | 'gt' | 'lt' | 'endswith' | 'startswith';
    value: any;
}

export interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

export type ColumnSize = 'sm' | 'md' | 'lg';

export interface TableColumn<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'number' | 'date' | 'select';
    filterOptions?: { value: string; label: string }[];
    render?: (value: any, item: T, index: number) => React.ReactNode;
    width?: string;
    className?: string;
    size?: ColumnSize;
}

export interface TableAction<T> {
    label: string;
    onClick: (item: T, index: number) => void;
    className?: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    show?: (item: T) => boolean;
    tooltip?: string;
}

export interface TableState {
    currentPage: number;
    pageSize: number;
    search: string;
    filters: FilterConfig[];
    sort?: SortConfig;
}
