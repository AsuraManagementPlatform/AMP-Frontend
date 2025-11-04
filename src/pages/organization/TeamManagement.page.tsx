import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';
import { ROUTES } from '@/utils/constants.utils';
import { OrganizationMemberWithDetails, OrganizationMemberType, OrganizationMemberStatus } from '@/types/organization-member.types';
import { organizationMemberService } from '@/services/organization-member.service';
import { CreateUserModal } from '@/components/modals/user/CreateUserModal';
import { userService } from '@/services/user.service';

const TeamManagementPage: React.FC = () => {
    const { organizationId } = useParams<{ organizationId: string }>();
    const navigate = useNavigate();
    const [teamMembers, setTeamMembers] = useState<OrganizationMemberWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

    useEffect(() => {
        loadTeamMembers();
    }, [organizationId]);

    const loadTeamMembers = async () => {
        if (!organizationId) return;
        
        try {
            setIsLoading(true);
            const response = await organizationMemberService.getList();
            const filtered = (response.organizationMembersList || []).filter(
                m => m.organization === organizationId
            );
            
            setTeamMembers(filtered);
        } catch (error) {
            showToast.error('Eroare la încărcarea membrilor echipei');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleMemberStatus = async (memberId: string, currentStatus: OrganizationMemberStatus) => {
        const newStatus = currentStatus === OrganizationMemberStatus.ACTIVE 
            ? OrganizationMemberStatus.INACTIVE 
            : OrganizationMemberStatus.ACTIVE;
        const action = newStatus === OrganizationMemberStatus.ACTIVE ? 'activat' : 'dezactivat';
        
        if (!window.confirm(`Sigur doriți să ${action === 'activat' ? 'activați' : 'dezactivați'} acest membru?`)) {
            return;
        }

        try {
            if (newStatus === OrganizationMemberStatus.ACTIVE) {
                await organizationMemberService.reactivateMember(memberId);
            } else {
                await organizationMemberService.deactivateMember(memberId);
            }
            showToast.success(`Membrul a fost ${action} cu succes`);
            loadTeamMembers();
        } catch (error) {
            showToast.error(`Nu s-a putut ${action === 'activat' ? 'activa' : 'dezactiva'} membrul`);
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

    const handleViewMemberDetails = (memberId: string) => {
        if (organizationId) {
            navigate(
                ROUTES.CRM_ORGANIZATION_MEMBER_PROFILE
                    .replace(':organizationId', organizationId)
                    .replace(':userId', memberId)
            );
        }
    };

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

    const filteredMembers = teamMembers.filter(member => {
        const matchesSearch = searchTerm === '' || 
            (member.memberDetails?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.memberDetails?.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = filterRole === 'all' || member.type === filterRole;
        const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
        
        return matchesSearch && matchesRole && matchesStatus;
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
                        <Button onClick={handleOpenCreateUser}>
                            Adaugă Membru
                        </Button>
                    </div>

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
                                                        <Button
                                                            onClick={() => handleViewMemberDetails(member.member)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            Detalii
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleToggleMemberStatus(member.id, member.status)}
                                                            variant="outline"
                                                            size="sm"
                                                            className={member.status === OrganizationMemberStatus.ACTIVE ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                                                        >
                                                            {member.status === OrganizationMemberStatus.ACTIVE ? 'Dezactivează' : 'Activează'}
                                                        </Button>
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
            </div>
        </Layout>
    );
};

export default TeamManagementPage;
