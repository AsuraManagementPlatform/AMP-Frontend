import {TableAction, TableColumn} from '@/types/index.types';
import React, {useState} from "react";
import Table from "@/components/ui/Table.tsx";
import { ActionIcons } from '@/components/ui/ActionIcons';
import {OrganizationDocument, DocumentType} from '@/types/organization-document.types';
import {UpdateOrganizationDocumentModal} from '@/components/modals/organization/UpdateOrganizationDocumentModal';
import organizationDocumentService from '@/services/organization-document.service';
import showToast from '@/components/ui/Toast';
import {useConfirmDialog} from "@/components/ui/ConfirmDialog.tsx";
import IconWarning from '@/assets/icons/iconmonstr-warning.svg?react'

interface OrganizationDocumentListProps {
    organization: string;
    refreshTrigger?: number;
    pageSize?: number;
}

export const OrganizationDocumentList: React.FC<OrganizationDocumentListProps> = ({
                                                                          organization,
                                                                          refreshTrigger = 0,
                                                                          pageSize = 10
                                                                      }) => {
    const confirm = useConfirmDialog();
    const [selectedDocument, setSelectedDocument] = useState<OrganizationDocument | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [localRefresh, setLocalRefresh] = useState(0);

    const handleEdit = (document: OrganizationDocument) => {
        setSelectedDocument(document);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (document: OrganizationDocument) => {
      const isConfirmed = await confirm({
        title: 'Șterge document',
        message: `Sigur doriți să ștergeți documentul "${document.name}"?`,
        confirmText: 'Confirmă',
        cancelText: 'Renunță',
        confirmButtonVariant: 'primary',
        icon: (<IconWarning></IconWarning>)
      });

      if (!isConfirmed) {
        return;
      }

        try {
            await organizationDocumentService.delete(document.id);
            showToast.success('Documentul a fost șters cu succes!');
            setLocalRefresh(prev => prev + 1);
        } catch (error: any) {
            const errorMessage = error?.message || 'Eroare la ștergerea documentului';
            showToast.error(errorMessage);
        }
    };

    const handleUpdateSuccess = () => {
        setLocalRefresh(prev => prev + 1);
    };

    const getColumns = (): TableColumn<OrganizationDocument>[] => [
        {
            key: 'name',
            label: 'Nume',
            sortable: true,
            size: 'lg',
        },
        {
            key: 'documentType',
            label: 'Tip',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: 'Certificat de înregistrare', value: DocumentType.REGISTRATION_CERTIFICATE },
                { label: 'Statut', value: DocumentType.STATUTE },
                { label: 'Certificat fiscal', value: DocumentType.TAX_CERTIFICATE },
                { label: 'Raport financiar', value: DocumentType.FINANCIAL_REPORT },
                { label: 'Raport activitate', value: DocumentType.ACTIVITY_REPORT },
                { label: 'Proces verbal', value: DocumentType.MEETING_MINUTES },
                { label: 'Contract', value: DocumentType.CONTRACT },
                { label: 'Acord', value: DocumentType.AGREEMENT },
                { label: 'Autorizație', value: DocumentType.AUTHORIZATION },
                { label: 'Licență', value: DocumentType.LICENSE },
                { label: 'Altele', value: DocumentType.OTHER }
            ],
            size: 'sm',
            render: (documentType: string) => {
                const typeLabels: Record<string, string> = {
                    'REGISTRATION_CERTIFICATE': 'Certificat înregistrare',
                    'STATUTE': 'Statut',
                    'TAX_CERTIFICATE': 'Certificat fiscal',
                    'FINANCIAL_REPORT': 'Raport financiar',
                    'ACTIVITY_REPORT': 'Raport activitate',
                    'MEETING_MINUTES': 'Proces verbal',
                    'CONTRACT': 'Contract',
                    'AGREEMENT': 'Acord',
                    'AUTHORIZATION': 'Autorizație',
                    'LICENSE': 'Licență',
                    'OTHER': 'Altele'
                };
                return typeLabels[documentType] || documentType;
            }
        },
        {
            key: 'documentNumber',
            label: 'Număr document',
            sortable: true,
            size: 'sm',
            render: (documentNumber: string | null) => documentNumber || '-'
        },
        {
            key: 'issueDate',
            label: 'Data emiterii',
            sortable: true,
            size: 'sm',
            render: (issueDate: string | null) => {
                if (!issueDate) return '-';
                return new Date(issueDate).toLocaleDateString('ro-RO');
            }
        },
        {
            key: 'expiryDate',
            label: 'Data expirării',
            sortable: true,
            size: 'sm',
            render: (expiryDate: string | null, row: OrganizationDocument) => {
                if (!expiryDate) return '-';
                const date = new Date(expiryDate).toLocaleDateString('ro-RO');
                if (row.isExpired) {
                    return (
                        <span className="text-red-600 font-semibold">
                            {date}
                        </span>
                    );
                }
                return date;
            }
        },
        {
            key: 'isActive',
            label: 'Status',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: 'Activ', value: 'true' },
                { label: 'Inactiv', value: 'false' }
            ],
            size: 'sm',
            render: (isActive: boolean, row: OrganizationDocument) => {
                if (row.isExpired) {
                    return (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Expirat
                        </span>
                    );
                }
                
                if (isActive) {
                    return (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Activ
                        </span>
                    );
                }
                return (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactiv
                    </span>
                );
            }
        }
    ];

    const getActions = (): TableAction<OrganizationDocument>[] => [
        {
            label: 'Edit',
            variant: 'primary',
            onClick: handleEdit,
            icon: <ActionIcons.Edit />
        },
        {
            label: 'Delete',
            variant: 'danger',
            onClick: handleDelete,
            icon: <ActionIcons.Delete />
        }
    ];

    return (
        <>
            <Table<OrganizationDocument>
                endpoint={`organization-documents/organization/${organization}/list`}
                columns={getColumns()}
                actions={getActions()}
                initialPageSize={pageSize}
                initialSort={{ field: 'created_at', direction: 'desc' }}
                showFilters={true}
                showPagination={true}
                emptyMessage="Nu există documente pentru această organizație."
                refreshTrigger={refreshTrigger + localRefresh}
            />

            {isUpdateModalOpen && selectedDocument && (
                <UpdateOrganizationDocumentModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedDocument(null);
                    }}
                    onSuccess={handleUpdateSuccess}
                    document={selectedDocument}
                    organization={organization}
                />
            )}
        </>
    );
};

export default OrganizationDocumentList;
