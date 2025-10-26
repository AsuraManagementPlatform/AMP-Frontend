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
    pageSize?: number;
    showFilters?: boolean;
    showPagination?: boolean;
    showAllMembers?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
                                                      onEdit,
                                                      onView,
                                                      onDelete,
                                                      onRowClick,
                                                      refreshTrigger = 0,
                                                      showActions = { edit: true, delete: true, view: false },
                                                      canDeleteUser,
                                                      pageSize = 20,
                                                      showFilters = true,
                                                      showPagination = true,
                                                      showAllMembers = false
                                                  }) => {

    const getColumns = (): TableColumn<User>[] => [
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            filterable: true,
            filterType: 'text',
            size: 'lg',
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
            size: 'sm',
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
            endpoint="user/list"
            columns={getColumns()}
            actions={getActions()}
            onRowClick={onRowClick}
            initialPageSize={pageSize}
            initialSort={{ field: 'email', direction: 'asc' }}
            initialFilters={showAllMembers ? [
                { field: 'status', operator: 'exact', value: [UserStatus.DRAFT, UserStatus.ACTIVE] }
            ] : [
                { field: 'status', operator: 'exact', value: UserStatus.DRAFT }
            ]}
            showFilters={showFilters}
            showPagination={showPagination}
            emptyMessage="Nu au fost găsiți utilizatori. Creează primul utilizator pentru a începe."
            refreshTrigger={refreshTrigger}
        />
    );
};

export default UserList;