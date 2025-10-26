import {TableAction, TableColumn} from '@/types/index.types';
import React, {useState} from "react";
import Table from "@/components/ui/Table.tsx";
import IconEdit from "@/assets/icons/iconmonstr-edit.svg?react";
import IconDelete from "@/assets/icons/iconmonstr-delete.svg?react";
import {ProjectFund} from '@/types/project-fund.types';
import {UpdateProjectFundModal} from '@/components/modals/project-fund/UpdateProjectFundModal';
import projectFundService from '@/services/project-fund.service';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from "@/components/ui/ConfirmDialog";
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react';

interface ProjectFundListProps {
  project: string;
  refreshTrigger?: number;
  pageSize?: number;
}

export const ProjectFundList: React.FC<ProjectFundListProps> = ({
                                                                  project,
                                                                  refreshTrigger = 0,
                                                                  pageSize = 10
                                                                }) => {
    const confirm = useConfirmDialog();
    const [selectedFund, setSelectedFund] = useState<ProjectFund | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleEdit = (fund: ProjectFund) => {
        setSelectedFund(fund);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (fund: ProjectFund) => {
        const isConfirmed = await confirm({
            title: 'Șterge sursa de finanțare',
            message: `Sigur doriți să ștergeți sursa de finanțare "${fund.sourceName}"?`,
            confirmText: 'Confirmă',
            cancelText: 'Renunță',
            confirmButtonVariant: 'primary',
            icon: (<IconWarning />)
        });

        if (!isConfirmed) {
            return;
        }

        try {
            await projectFundService.delete(fund.id);
            showToast.success('Sursa de finanțare a fost ștearsă cu succes!');
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la ștergerea sursei de finanțare';
            showToast.error(errorMessage);
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<ProjectFund>[] => [
        {
            key: 'sourceName',
            label: 'Sursă',
            sortable: true,
            size: 'lg',
        },
        {
            key: 'category',
            label: 'Categorie',
            sortable: true,
            filterable: true,
            filterType: 'text',
            size: 'sm',
        },
        {
            key: 'scope',
            label: 'Scop',
            sortable: true,
            size: 'sm',
        },
        {
            key: 'amount',
            label: 'Sumă',
            sortable: true,
            size: 'sm',
            render: (amount: number, row: ProjectFund) => {
                return `${amount.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} ${row.currency}`;
            }
        },
    ];

    const getActions = (): TableAction<ProjectFund>[] => [
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
      <Table<ProjectFund>
        endpoint={`project_fund/list?project_id=${project}`}
        columns={getColumns()}
        actions={getActions()}
        initialPageSize={pageSize}
        initialSort={{ field: 'date', direction: 'desc' }}
        showFilters={true}
        showPagination={true}
        emptyMessage="Nu există surse de finanțare pentru acest proiect."
        refreshTrigger={refreshTrigger + localRefresh}
      />

      {isUpdateModalOpen && selectedFund && (
        <UpdateProjectFundModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedFund(null);
          }}
          onSuccess={handleUpdateSuccess}
          fund={selectedFund}
          project={project}
        />
      )}
    </>
  );
};

export default ProjectFundList;