import { TableAction, TableColumn } from '@/types/index.types';
import React, { useState } from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import { ProjectMember, ProjectMemberStatus, ProjectMemberType } from '@/types/project-member.types';
import { UpdateProjectMemberModal } from '@/components/modals/project-member/UpdateProjectMemberModal';
import projectMemberService from '@/services/project-member.service';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from "@/components/ui/ConfirmDialog.tsx";
import IconWarning from "@/assets/icons/iconmonstr-warning.svg?react"

interface ProjectMemberListProps {
    project: string;
    organizationId: string;
    refreshTrigger?: number;
    className?: string;
    pageSize?: number;
}

export const ProjectMemberList: React.FC<ProjectMemberListProps> = ({
                                                                        project,
                                                                        organizationId,
                                                                        refreshTrigger = 0,
                                                                        className = '',
                                                                        pageSize = 10
                                                                    }) => {
    const confirm = useConfirmDialog();
    const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleEdit = (member: ProjectMember) => {
        setSelectedMember(member);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (member: ProjectMember) => {
      const isConfirmed = await confirm({
        title: 'Elimină membru din echipa proiectului',
        message: `Sigur doriți să eliminați membrul "${member.memberName}" din proiect?`,
        confirmText: 'Confirmă',
        cancelText: 'Renunță',
        confirmButtonVariant: 'primary',
        icon: (<IconWarning />)
      });

      if (!isConfirmed) {
        return;
      }

        try {
            await projectMemberService.delete(member.id);
            showToast.success('Membrul a fost eliminat cu succes!');
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la eliminarea membrului';
            showToast.error(errorMessage);
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<ProjectMember>[] => [
        {
            key: 'memberName',
            label: 'Nume',
            sortable: false,
            width: '200px',
        },
        {
            key: 'memberEmail',
            label: 'Email',
            sortable: false,
            width: '200px',
        },
        {
            key: 'userRole',
            label: 'Rol',
            sortable: true,
            width: '150px',
        },
        {
            key: 'type',
            label: 'Tip',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: 'Angajat', value: ProjectMemberType.EMPLOYEE },
                { label: 'Voluntar', value: ProjectMemberType.VOLUNTEER },
                { label: 'Contractor', value: ProjectMemberType.CONTRACTOR },
                { label: 'Consultant', value: ProjectMemberType.CONSULTANT },
                { label: 'Partener', value: ProjectMemberType.PARTNER }
            ],
            width: '120px',
            render: (type: string) => {
                const typeLabels = {
                    'EMPLOYEE': 'Angajat',
                    'VOLUNTEER': 'Voluntar',
                    'CONTRACTOR': 'Contractor',
                    'CONSULTANT': 'Consultant',
                    'PARTNER': 'Partener'
                };
                return typeLabels[type as keyof typeof typeLabels] || type;
            }
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: 'Activ', value: ProjectMemberStatus.ACTIVE },
                { label: 'Inactiv', value: ProjectMemberStatus.INACTIVE },
                { label: 'Suspendat', value: ProjectMemberStatus.SUSPENDED },
                { label: 'Finalizat', value: ProjectMemberStatus.COMPLETED }
            ],
            width: '120px',
            render: (status: string) => {
                const statusColors = {
                    'ACTIVE': 'bg-green-100 text-green-800',
                    'INACTIVE': 'bg-gray-100 text-gray-800',
                    'SUSPENDED': 'bg-yellow-100 text-yellow-800',
                    'COMPLETED': 'bg-blue-100 text-blue-800'
                };

                const statusLabels = {
                    'ACTIVE': 'Activ',
                    'INACTIVE': 'Inactiv',
                    'SUSPENDED': 'Suspendat',
                    'COMPLETED': 'Finalizat'
                };

                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[status as keyof typeof statusLabels] || status}
                    </span>
                );
            }
        },
        {
            key: 'activeFrom',
            label: 'Activ de la',
            sortable: true,
            width: '120px',
            render: (date: string) => {
                return date ? new Date(date).toLocaleDateString('ro-RO') : '-';
            }
        },
        {
            key: 'activeTo',
            label: 'Activ până la',
            sortable: true,
            width: '120px',
            render: (date: string) => {
                return date ? new Date(date).toLocaleDateString('ro-RO') : '-';
            }
        }
    ];

    const getActions = (): TableAction<ProjectMember>[] => [
        {
            label: 'Edit',
            variant: 'primary',
            onClick: handleEdit,
            icon: <IconEdit />
        },
        {
            label: 'Delete',
            variant: 'danger',
            onClick: handleDelete,
            icon: <IconDelete />
        }
    ];

    return (
        <>
            <Table<ProjectMember>
                endpoint={`project_member/list?project_id=${project}`}
                columns={getColumns()}
                actions={getActions()}
                pageSize={pageSize}
                initialSort={{ field: 'added_to_project', direction: 'desc' }}
                showSearch={true}
                showFilters={true}
                showPagination={true}
                emptyMessage="Nu există membri în acest proiect."
                className={className}
                refreshTrigger={refreshTrigger + localRefresh}
            />

            {isUpdateModalOpen && selectedMember && (
                <UpdateProjectMemberModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedMember(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    member={selectedMember}
                    organizationId={organizationId}
                />
            )}
        </>
    );
};

export default ProjectMemberList;
