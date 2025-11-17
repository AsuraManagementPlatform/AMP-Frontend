import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants.utils';
import { OrganizationMemberWithDetails, OrganizationMemberType, OrganizationMemberStatus, ImportJobStatus } from '@/types/organization-member.types';
import { organizationMemberService } from '@/services/organization-member.service';
import { CreateUserModal } from '@/components/modals/user/CreateUserModal';
import { EditUserModal } from '@/components/modals/user/EditUserModal';
import { userService } from '@/services/user.service';
import { UserCreateRequest } from '@/schemas/user.schema';
import { UserMeResponse } from '@/types/user.types';
import { UserGroup } from '@/types/auth.types';

const TeamManagementPage: React.FC = () => {
    const { organizationId } = useParams<{ organizationId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const confirm = useConfirmDialog();
    const { user: currentUser, hasAnyUserGroup } = useAuth();
    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);
    const [teamMembers, setTeamMembers] = useState<OrganizationMemberWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserMeResponse | null>(null);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [importJobId, setImportJobId] = useState<string | null>(null);
    const [importStatus, setImportStatus] = useState<ImportJobStatus | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [showErrorReport, setShowErrorReport] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadTeamMembers();
    }, [organizationId]);

    const loadTeamMembers = async () => {
        if (!organizationId) return;
        
        try {
            setIsLoading(true);
            const response = await organizationMemberService.getList(organizationId);
            setTeamMembers(response.organizationMembersList || []);
        } catch (error: any) {
            const message = error?.message || t('toast.organization_member.load_error');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleMemberStatus = async (memberId: string, currentStatus: OrganizationMemberStatus) => {
        if (currentUser?.id === memberId && currentStatus === OrganizationMemberStatus.ACTIVE) {
            showToast.error(t('toast.organization_member.cannot_deactivate_self'));
            return;
        }
        
        const newStatus = currentStatus === OrganizationMemberStatus.ACTIVE 
            ? OrganizationMemberStatus.INACTIVE 
            : OrganizationMemberStatus.ACTIVE;
        
        const confirmMessage = newStatus === OrganizationMemberStatus.ACTIVE 
            ? t('label.organization_member.confirm_activate')
            : t('label.organization_member.confirm_deactivate');
        
        const confirmed = await confirm({
            message: confirmMessage,
            title: 'Confirmare',
            confirmText: 'OK',
            cancelText: 'Cancel',
            confirmButtonVariant: 'danger'
        });
        
        if (!confirmed) {
            return;
        }

        try {
            if (newStatus === OrganizationMemberStatus.ACTIVE) {
                await organizationMemberService.activateMember(memberId);
                showToast.success(t('toast.organization_member.activated'));
            } else {
                await organizationMemberService.deactivateMember(memberId);
                showToast.success(t('toast.organization_member.deactivated'));
            }
            loadTeamMembers();
        } catch (error: any) {
            const errorKey = newStatus === OrganizationMemberStatus.ACTIVE 
                ? 'toast.organization_member.activate_error'
                : 'toast.organization_member.deactivate_error';
            const message = error?.message || t(errorKey);
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        }
    };

    const handleOpenCreateUser = () => {
        setIsCreateUserModalOpen(true);
    };

    const handleCloseCreateUser = () => {
        setIsCreateUserModalOpen(false);
    };

    const handleCreateUser = async (data: any): Promise<void> => {
        try {
            await userService.create(data);
            showToast.success('Utilizator creat cu succes!');
            loadTeamMembers();
        } catch (error) {
            throw error;
        }
    };

    const handleOpenEditUser = async (member: OrganizationMemberWithDetails) => {
        try {
            const fullUserData = await userService.getById(member.member);
            const userMeResponse: UserMeResponse = {
                id: fullUserData.id,
                fullName: fullUserData.fullName,
                firstName: fullUserData.firstName,
                lastName: fullUserData.lastName,
                email: fullUserData.email,
                cnp: fullUserData.cnp,
                personalNumericalNumber: fullUserData.personalNumericalNumber,
                isLegalEntity: fullUserData.isLegalEntity || false,
                companyNumber: fullUserData.companyNumber,
                companyName: fullUserData.companyName,
                cui: fullUserData.cui,
                phoneNumber: fullUserData.phoneNumber,
                secondaryPhone: fullUserData.secondaryPhone,
                address: fullUserData.address,
                city: fullUserData.city,
                county: fullUserData.county,
                postalCode: fullUserData.postalCode,
                country: fullUserData.country,
                groups: Array.isArray(fullUserData.groups) 
                    ? fullUserData.groups 
                    : [fullUserData.groups].filter(Boolean),
                status: fullUserData.status as any,
                organizationId: fullUserData.organizationId,
                lastLogin: fullUserData.lastLogin,
                registrationDate: fullUserData.registrationDate,
                isActive: fullUserData.isActive,
                profession: fullUserData.profession,
                bio: fullUserData.bio
            };
            setSelectedUser(userMeResponse);
            setSelectedMemberId(member.member);
            setIsEditUserModalOpen(true);
        } catch (error: any) {
            const message = error?.message || 'Eroare la încărcarea datelor utilizatorului';
            showToast.error(message);
        }
    };

    const handleCloseEditUser = () => {
        setIsEditUserModalOpen(false);
        setSelectedUser(null);
        setSelectedMemberId(null);
    };

    const handleEditUser = async (data: UserCreateRequest): Promise<void> => {
        if (!selectedUser || !selectedMemberId) return;

        const oldEmail = selectedUser.email;

        try {
            await userService.update(selectedMemberId, data);
            showToast.success('Utilizator actualizat cu succes!');
            
            const shouldResetPassword = oldEmail !== data.email;
            
            if (shouldResetPassword) {
                const confirmed = await confirm({
                    message: 'Email-ul a fost modificat. Doriți să trimiteți email cu parola nouă?',
                    title: 'Resetare parolă',
                    confirmText: 'Da, trimite email',
                    cancelText: 'Nu acum'
                });

                if (confirmed) {
                    try {
                        const result = await userService.resetPassword(selectedMemberId);
                        showToast.success(`Email cu parola nouă trimis la ${result.email}`);
                    } catch (error: any) {
                        const message = error?.message || 'Eroare la trimiterea email-ului cu parola';
                        showToast.error(message);
                    }
                }
            }

            loadTeamMembers();
            handleCloseEditUser();
        } catch (error) {
            throw error;
        }
    };

    const handleViewMemberDetails = (memberId: string) => {
        if (organizationId) {
            navigate(
                ROUTES.CRM_ORGANIZATION_MEMBER_PROFILE
                    .replace(':organizationId', organizationId)
                    .replace(':userId', memberId)
            );
        }
    };

    const handleExportUsers = async () => {
        try {
            const blob = await organizationMemberService.exportUsers();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `membri_organizatie_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            showToast.success(t('toast.export.success'));
        } catch (error: any) {
            const message = error?.message || t('toast.export.failed');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
        }
    };

    const handleImportUsers = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        console.log('[Import Debug] File selected:', file.name);

        if (!file.name.endsWith('.csv')) {
            showToast.error(t('toast.import.invalid_file_type'));
            return;
        }

        try {
            setIsImporting(true);
            console.log('[Import Debug] Starting import...');
            const result = await organizationMemberService.importUsers(file);
            console.log('[Import Debug] Import response:', result);
            setImportJobId(result.jobId);
            console.log('[Import Debug] Set importJobId to:', result.jobId);
            showToast.info(t('toast.import.started', { count: result.totalRows }));
        } catch (error: any) {
            console.error('[Import Debug] Import error:', error);
            const message = error?.message || t('toast.import.upload_failed');
            const translatedMessage = message.includes('.') ? t(message) : message;
            showToast.error(translatedMessage);
            setIsImporting(false);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    useEffect(() => {
        if (!importJobId) return;

        console.log('[Import Debug] Starting polling for job:', importJobId);

        const pollInterval = setInterval(async () => {
            try {
                console.log('[Import Debug] Polling status...');
                const status = await organizationMemberService.getImportStatus(importJobId);
                console.log('[Import Debug] Status received:', status);
                setImportStatus(status);

                if (status.status === 'COMPLETED') {
                    console.log('[Import Debug] Import COMPLETED');
                    clearInterval(pollInterval);
                    showToast.success(
                        t('toast.import.success', { count: status.successCount })
                    );
                    loadTeamMembers();
                    setImportJobId(null);
                    setIsImporting(false);
                } else if (status.status === 'FAILED') {
                    console.log('[Import Debug] Import FAILED:', status.errorReport);
                    clearInterval(pollInterval);
                    showToast.error(t('toast.import.failed'));
                    setShowErrorReport(status.errorReport);
                    setImportJobId(null);
                    setIsImporting(false);
                }
            } catch (error) {
                console.error('[Import Debug] Error polling status:', error);
                clearInterval(pollInterval);
                showToast.error(t('toast.import.status_error'));
                setImportJobId(null);
                setIsImporting(false);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [importJobId]);

    const getTypeBadge = (type: OrganizationMemberType) => {
        const config = {
            [OrganizationMemberType.EMPLOYEE]: { text: 'Angajat', className: 'bg-green-100 text-green-800' },
            [OrganizationMemberType.VOLUNTEER]: { text: 'Voluntar', className: 'bg-yellow-100 text-yellow-800' },
            [OrganizationMemberType.MEMBER]: { text: 'Membru', className: 'bg-gray-100 text-gray-800' },
        };
        
        const typeConfig = config[type] || { text: type, className: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.className}`}>
                {typeConfig.text}
            </span>
        );
    };

    const getStatusBadge = (status: OrganizationMemberStatus) => {
        const config = {
            [OrganizationMemberStatus.ACTIVE]: { text: 'Activ', className: 'bg-green-100 text-green-800' },
            [OrganizationMemberStatus.INACTIVE]: { text: 'Inactiv', className: 'bg-red-100 text-red-800' },
            [OrganizationMemberStatus.PENDING]: { text: 'În așteptare', className: 'bg-yellow-100 text-yellow-800' },
            [OrganizationMemberStatus.SUSPENDED]: { text: 'Suspendat', className: 'bg-orange-100 text-orange-800' }
        };
        
        const statusConfig = config[status] || { text: status, className: 'bg-gray-100 text-gray-800' };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                {statusConfig.text}
            </span>
        );
    };

    const filteredMembers = teamMembers
        .filter(member => {
            const matchesSearch = searchTerm === '' || 
                (member.memberDetails?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.memberDetails?.email.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesRole = filterRole === 'all' || member.type === filterRole;
            const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
            
            return matchesSearch && matchesRole && matchesStatus;
        })
        .sort((a, b) => {
            if (a.member === currentUser?.id) return -1;
            if (b.member === currentUser?.id) return 1;
            return 0;
        });

    const getStats = () => {
        const employees = teamMembers.filter(m => m.type === OrganizationMemberType.EMPLOYEE).length;
        const volunteers = teamMembers.filter(m => m.type === OrganizationMemberType.VOLUNTEER).length;
        const members = teamMembers.filter(m => m.type === OrganizationMemberType.MEMBER).length;
        const activeMembers = teamMembers.filter(m => m.status === OrganizationMemberStatus.ACTIVE).length;
        
        return { employees, volunteers, members, activeMembers };
    };

    const stats = getStats();

    if (isLoading) {
        return (
            <Layout>
                <div className="container mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Se încarcă echipa...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto">
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Management Echipă</h1>
                        <div className="flex gap-2">
                            {isOrgAdmin && (
                                <>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept=".csv"
                                        className="hidden"
                                    />
                                    <Button 
                                        onClick={handleExportUsers}
                                        variant="secondary"
                                        className="border-0 bg-blue-500 text-white hover:bg-blue-600"
                                    >
                                        Exportă Utilizatori
                                    </Button>
                                    <Button 
                                        onClick={handleImportUsers}
                                        variant="secondary"
                                        disabled={isImporting}
                                        className="border-0 bg-green-500 text-white hover:bg-green-600"
                                    >
                                        {isImporting ? 'Importare în curs...' : 'Importă Utilizatori'}
                                    </Button>
                                </>
                            )}
                            <Button 
                                onClick={handleOpenCreateUser}
                                className="border-0 bg-orange-500 text-white hover:bg-orange-600"
                            >
                                Creează utilizator
                            </Button>
                        </div>
                    </div>

                    {/* Import Progress */}
                    {isImporting && importStatus && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                                    <span className="text-blue-900 font-medium">
                                        Import în curs: {importStatus.processedRows}/{importStatus.totalRows} procesate
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Report Modal */}
                    {showErrorReport && (
                        <div 
                            className="fixed inset-0 flex items-center justify-center z-50 p-4"
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                        >
                            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-auto">
                                <h3 className="text-lg font-bold text-red-600 mb-4">Erori la import</h3>
                                <div className="space-y-3">
                                    {Array.isArray(showErrorReport) ? (
                                        showErrorReport.map((error: any, index: number) => (
                                            <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                                <div className="mb-2">
                                                    <span className="font-semibold text-gray-900">Rând {error.row}:</span>
                                                    <span className="ml-2 text-gray-700">{error.fullName || error.full_name}</span>
                                                    <span className="ml-2 text-gray-500">({error.email})</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {error.errors.map((err: any, i: number) => {
                                                        const message = typeof err === 'string' 
                                                            ? err 
                                                            : (err.message?.includes('.') 
                                                                ? t(err.message, err.params || {}) 
                                                                : err.message);
                                                        
                                                        return (
                                                            <div key={i} className="flex items-start text-sm">
                                                                <span className="inline-block w-32 font-medium text-red-800 flex-shrink-0">
                                                                    {err.field === 'full_name' && '📝 Nume complet:'}
                                                                    {err.field === 'email' && '📧 Email:'}
                                                                    {err.field === 'group' && '👥 Grup:'}
                                                                    {err.field === 'is_contributor' && '💰 Cotizant:'}
                                                                    {err.field === 'auto_generate_fees' && '🔄 Cotizații auto:'}
                                                                    {!err.field && '⚠️ Eroare:'}
                                                                </span>
                                                                <span className="text-red-700 flex-1">
                                                                    {message}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-red-700 font-medium">
                                                {showErrorReport.fatalError || showErrorReport.fatal_error || 'Eroare necunoscută'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <Button onClick={() => setShowErrorReport(null)} variant="secondary">
                                        Închide
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
                            <div className="text-sm text-gray-600">Total Membri Echipă</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.employees}</div>
                            <div className="text-sm text-gray-600">Angajați</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{stats.volunteers}</div>
                            <div className="text-sm text-gray-600">Voluntari</div>
                        </Card>
                        <Card className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.activeMembers}</div>
                            <div className="text-sm text-gray-600">Membri Activi</div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card title="Filtre" className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Caută</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Nume sau email..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
                                <select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Toate tipurile</option>
                                    <option value={OrganizationMemberType.EMPLOYEE}>Angajat</option>
                                    <option value={OrganizationMemberType.VOLUNTEER}>Voluntar</option>
                                    <option value={OrganizationMemberType.MEMBER}>Membru</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Toate statusurile</option>
                                    <option value={OrganizationMemberStatus.ACTIVE}>Activ</option>
                                    <option value={OrganizationMemberStatus.INACTIVE}>Inactiv</option>
                                    <option value={OrganizationMemberStatus.PENDING}>În așteptare</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Team Members Table */}
                    <Card title={`Membri Echipă (${filteredMembers.length})`}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Membru
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Rol
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Proiect/Activitate
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Cotizant
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Acțiuni
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredMembers.length > 0 ? (
                                        filteredMembers.map((member) => (
                                            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                            {member.memberDetails?.fullName?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="font-medium text-gray-900">{member.memberDetails?.fullName || 'N/A'}</div>
                                                            <div className="text-sm text-gray-500">{member.memberDetails?.email || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {getTypeBadge(member.type)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-sm text-gray-700">
                                                        {member.currentProjects && member.currentProjects.length > 0 ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-900">
                                                                    📂 {member.currentProjects.length} {member.currentProjects.length === 1 ? 'proiect' : 'proiecte'}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 italic">Fără proiect</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        member.type === OrganizationMemberType.MEMBER 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {member.type === OrganizationMemberType.MEMBER ? 'Da' : 'Nu'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {getStatusBadge(member.status)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleViewMemberDetails(member.member)}
                                                            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                                        >
                                                            Detalii
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEditUser(member)}
                                                            className="px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
                                                        >
                                                            Editează
                                                        </button>
                                                        {member.member !== currentUser?.id && (
                                                            <button
                                                                onClick={() => handleToggleMemberStatus(member.id, member.status)}
                                                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                                                    member.status === OrganizationMemberStatus.ACTIVE 
                                                                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                                                                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                                                }`}
                                                            >
                                                                {member.status === OrganizationMemberStatus.ACTIVE ? 'Dezactivează' : 'Activează'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                                Nu au fost găsiți membri care să corespundă filtrelor selectate.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                
                <CreateUserModal
                    isOpen={isCreateUserModalOpen}
                    onClose={handleCloseCreateUser}
                    onSubmit={handleCreateUser}
                    isOrgAdmin={true}
                />

                {selectedUser && (
                    <EditUserModal
                        isOpen={isEditUserModalOpen}
                        onClose={handleCloseEditUser}
                        onSubmit={handleEditUser}
                        user={selectedUser}
                        isOrgAdmin={true}
                    />
                )}
            </div>
        </Layout>
    );
};

export default TeamManagementPage;
