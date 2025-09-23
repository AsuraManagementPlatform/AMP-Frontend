import {TableAction, TableColumn, User, UserStatus} from '@/types/index.types';
import React from "react";
import Table from "@/components/ui/Table.tsx";
import IconView from "@/assets/icons/iconmonstr-view.svg?react";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";

interface UserListProps {
    onEdit?: (user: User) => void;
    onView?: (user: User) => void;
    onDelete?: (user: User) => void;
    onRowClick?: (user: User) => void;
    refreshTrigger?: number;
    showActions?: {
        edit?: boolean;
        delete?: boolean;
        view?: boolean;
    };
    canDeleteUser?: (user: User) => boolean;
    className?: string;
    pageSize?: number;
    showSearch?: boolean;
    showFilters?: boolean;
    showPagination?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
                                                      onEdit,
                                                      onView,
                                                      onDelete,
                                                      onRowClick,
                                                      refreshTrigger = 0,
                                                      showActions = { edit: true, delete: true, view: false },
                                                      canDeleteUser,
                                                      className = '',
                                                      pageSize = 20,
                                                      showSearch = true,
                                                      showFilters = true,
                                                      showPagination = true
                                                  }) => {

    const getColumns = (): TableColumn<User>[] => [
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            filterable: true,
            filterType: 'text',
            width: '250px',
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: UserStatus.ACTIVE, value: UserStatus.ACTIVE },
                { label: UserStatus.INACTIVE, value: UserStatus.INACTIVE },
                { label: UserStatus.DRAFT, value: UserStatus.DRAFT }
            ],
            width: '120px',
            render: (status: string) => {
                const statusColors = {
                    'ACTIVE': 'bg-green-100 text-green-800',
                    'INACTIVE': 'bg-red-100 text-red-800',
                    'DRAFT': 'bg-yellow-100 text-yellow-800'
                };

                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                );
            }
        },
    ];

    const getActions = (): TableAction<User>[] => {
        const actions: TableAction<User>[] = [];

        if (showActions.view && onView) {
            actions.push({
                label: 'View',
                variant: 'secondary',
                onClick: onView,
                icon: <IconView></IconView>
            });
        }

        if (showActions.edit && onEdit) {
            actions.push({
                label: 'Edit',
                variant: 'primary',
                onClick: onEdit,
                icon: <IconEdit></IconEdit>
            });
        }

        if (showActions.delete && onDelete) {
            actions.push({
                label: 'Delete',
                variant: 'danger',
                onClick: onDelete,
                icon: <IconDelete></IconDelete>,
                show: canDeleteUser
            });
        }

        return actions;
    };

    return (
        <Table<User>
            endpoint="/api/user/list"
            columns={getColumns()}
            actions={getActions()}
            onRowClick={onRowClick}
            pageSize={pageSize}
            initialSort={{ field: 'email', direction: 'asc' }}
            initialFilters={[{field: 'status', operator: 'exact', value: UserStatus.DRAFT}]}
            showSearch={showSearch}
            showFilters={showFilters}
            showPagination={showPagination}
            emptyMessage="No users found. Create your first user to get started."
            className={className}
            refreshTrigger={refreshTrigger}
        />
    );
};

export default UserList;