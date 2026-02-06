import React, { useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { t } from 'i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Project, Activity, User, TableColumn } from '@/types/index.types';
import toast from 'react-hot-toast';
import { MyCotizatii } from './MyCotizatii';
import DataTable from "@/components/ui/DataTable.tsx";
import {ROUTES} from "@/utils/constants.utils.ts";
import { CreateCommunicationModal } from '@/components/modals/communication/CreateCommunicationModal';
import { CreateActivityProposalModal } from '@/components/modals/activity-proposal/CreateActivityProposalModal';
import { ViewCommunicationModal } from '@/components/modals/communication/ViewCommunicationModal';
import { DirectSponsorshipModal } from '@/components/modals/sponsorship/DirectSponsorshipModal';
import { AuthContext } from '@/context/Auth.context';
import userService from '@/services/user.service';
import communicationService from '@/services/communication.service';
import { Communication } from '@/types/communication.types';
import { apiService } from '@/services/api.service';
import generalAssemblyService from '@/services/general-assembly.service';
import { GeneralAssemblyListItem } from '@/types/general-assembly.types';

interface MemberDashboardProps {
    user: User | null;
    projects: Project[];
    activities: Activity[];
    projectsLoading: boolean;
    activitiesLoading: boolean;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
    user,
    projects,
    activities,
    projectsLoading
}) => {
    const [showSponsorshipModal, setShowSponsorshipModal] = useState(false);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const queryClient = useQueryClient();

    const { data: communicationsData } = useQuery({
        queryKey: ['communications'],
        queryFn: () => communicationService.getList()
    });

    const { data: activeSurveys = [] } = useQuery({
        queryKey: ['active-surveys'],
        queryFn: () => apiService.getActiveSurveyQuestions()
    });

    const { data: unreadData } = useQuery({
        queryKey: ['communications-unread-count'],
        queryFn: () => communicationService.getUnreadCount(),
        refetchInterval: 30000
    });

    const { data: myAssemblies = [] } = useQuery({
        queryKey: ['my-assemblies'],
        queryFn: () => generalAssemblyService.getMyAssemblies(),
        refetchInterval: 60000
    });

    const communications = communicationsData?.results || [];
    const unreadCount = unreadData?.unreadCount || 0;

    const { data: managersData } = useQuery({
        queryKey: ['users', 'organization-members'],
        queryFn: () => userService.getOrganizationMembers(),
        enabled: !!authContext?.user?.organizationId
    });

    const admins = managersData?.results
        ?.filter((member: User) => member.id !== authContext?.user?.id)
        ?.sort((a: User, b: User) => {
            const aIsAdmin = a.groups?.includes('organization_admin') || a.groups?.includes('admin');
            const bIsAdmin = b.groups?.includes('organization_admin') || b.groups?.includes('admin');
            if (aIsAdmin && !bIsAdmin) return -1;
            if (!aIsAdmin && bIsAdmin) return 1;
            return (a.fullName || a.email).localeCompare(b.fullName || b.email);
        })
        .map((member: User) => ({
            value: member.id,
            label: `${member.fullName || member.email}${member.groups?.includes('organization_admin') || member.groups?.includes('admin') ? ' (Admin)' : ''}`
        })) || [];

    const getProjectColumns = (): TableColumn<Project>[] => [
        {
            key: 'name',
            label: 'Proiect',
            sortable: false,
            render: (name: string) => <span className="font-medium">{name}</span>
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            headerAlign: 'center',
            render: (status: string) => (
                <div className="flex justify-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                        status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {status}
                    </span>
                </div>
            )
        },
        {
            key: 'id',
            label: 'Progres',
            sortable: false,
            headerAlign: 'center',
            render: () => (
                <div className="w-full bg-gray-200 rounded-full h-2 max-w-[200px] mx-auto">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
            )
        },
        {
            key: 'id',
            label: 'Număr Activități',
            sortable: false,
            headerAlign: 'center',
            render: (_: string, project: Project) => {
                const projectActivities = activities.filter(a => a.project === project.id);
                return <div className="text-center font-medium text-gray-700">{projectActivities.length}</div>;
            }
        },
        {
            key: 'id',
            label: 'Acțiuni',
            sortable: false,
            headerAlign: 'center',
            render: (_: string, project: Project) => (
                <div className="flex gap-2 justify-center">
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(ROUTES.ERP_PROJECT_DETAILS.replace(':projectId', project.id));
                        }}
                        className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white hover:border-blue-500"
                        size="sm"
                    >
                        Vizualizează
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowProposalModal(true);
                        }}
                        size="sm"
                    >
                        Propune activitate
                    </Button>
                </div>
            )
        }
    ];

    const handleSponsor = () => {
        setShowSponsorshipModal(true);
    };

    const handleSendMessage = () => {
        setShowMessageModal(true);
    };

    const handleMessageSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['communications'] });
        queryClient.invalidateQueries({ queryKey: ['communications-unread-count'] });
        toast.success('Mesajul a fost trimis cu succes!');
    };

    const handleProposalSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['activity-proposals'] });
        toast.success('Propunerea a fost trimisă cu succes!');
    };

    const handleViewCommunication = (comm: Communication) => {
        setSelectedCommunication(comm);
    };

    const handleCloseViewModal = () => {
        setSelectedCommunication(null);
        queryClient.invalidateQueries({ queryKey: ['communications'] });
        queryClient.invalidateQueries({ queryKey: ['communications-unread-count'] });
        
        setTimeout(() => {
            queryClient.refetchQueries({ queryKey: ['communications-unread-count'] });
        }, 100);
    };

    const getStatusLabel = (status: string) => {
        return t(`label.communication.status.${status.toLowerCase()}`);
    };

    return (
        <>
            <div className="mb-6">
                <Card title="Tablou informativ - Proiectele și activitățile mele" className="mb-6">
                    <div className="space-y-4">
                        <div className="text-sm text-gray-600 mb-4">
                            Vezi aici toate proiectele la care participi
                        </div>
                        
                        <DataTable<Project>
                            data={projects}
                            columns={getProjectColumns()}
                            loading={projectsLoading}
                            emptyMessage="Nu participi la niciun proiect în acest moment"
                        />
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Informații despre mine</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Nume:</span> 
                                    <span className="ml-2 font-medium">{user?.fullName || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Email:</span> 
                                    <span className="ml-2 font-medium">{user?.email || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Organizație:</span> 
                                    <span className="ml-2 font-medium">{user?.organizationName || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Status:</span> 
                                    <span className="ml-2 font-medium">{user?.status || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Cotizațiile mele - Secțiune dedicată */}
            <div className="mb-6">
                <MyCotizatii />
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* 1. Direct Sponsorship */}
                <Card title="Sponsorizare" className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">Susține financiar ONG-ul sau un proiect specific</p>
                        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg">
                            <div className="text-center">
                                <p className="text-lg font-semibold text-orange-600 mb-2">Donație</p>
                                <p className="text-xs text-gray-600">Fă o donație</p>
                            </div>
                        </div>
                        <Button 
                            onClick={handleSponsor}
                            className="w-full border-orange-500 text-orange-500 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:text-white hover:border-orange-500"
                            size="sm"
                        >
                            Sponsorizează acum
                        </Button>
                    </div>
                </Card>

                {/* 2. Surveys & Voting */}
                <Card title="Sondaje & Voturi" className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">Sondaje active care așteaptă răspunsul tău</p>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {activeSurveys.filter((s: any) => new Date(s.endDate) >= new Date()).length}
                            </div>
                            <div className="text-xs text-gray-600">sondaje active</div>
                        </div>
                        <div className="space-y-2">
                            {activeSurveys
                                .filter((s: any) => new Date(s.endDate) >= new Date())
                                .slice(0, 1)
                                .map((survey: any) => (
                                    <div key={survey.id} className="text-sm p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100" onClick={() => navigate(`/sondaje/${survey.id}`)}>
                                        <div className="font-medium">{survey.title}</div>
                                        <div className="text-xs text-gray-600">Deadline: {new Date(survey.endDate).toLocaleDateString('ro-RO')}</div>
                                    </div>
                                ))
                            }
                            {activeSurveys
                                .filter((s: any) => new Date(s.endDate) < new Date())
                                .slice(0, 1)
                                .map((survey: any) => (
                                    <div key={survey.id} className="text-sm p-2 bg-red-50 border border-red-200 rounded cursor-pointer hover:bg-red-100" onClick={() => navigate(`/sondaje/${survey.id}`)}>
                                        <div className="flex items-center gap-2">
                                            <div className="font-medium text-red-700">{survey.title}</div>
                                        </div>
                                        <div className="text-xs text-red-600">Expirat: {new Date(survey.endDate).toLocaleDateString('ro-RO')}</div>
                                    </div>
                                ))
                            }
                        </div>
                        <Button 
                            onClick={() => navigate('/sondaje')}
                            className="w-full border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white hover:border-purple-500"
                            size="sm"
                        >
                            Participă la sondaje
                        </Button>
                    </div>
                </Card>

                {/* 3. Meetings/Assemblies */}
                <Card title={t('label.dashboard.meetings')} className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">{t('label.dashboard.meetings_description')}</p>
                        <div className="bg-indigo-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-indigo-600">
                                {myAssemblies.filter((a: GeneralAssemblyListItem) => 
                                    a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS'
                                ).length}
                            </div>
                            <div className="text-xs text-gray-600">{t('label.dashboard.active_meetings')}</div>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {myAssemblies
                                .filter((a: GeneralAssemblyListItem) => 
                                    a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS'
                                )
                                .slice(0, 2)
                                .map((assembly: GeneralAssemblyListItem) => (
                                    <div 
                                        key={assembly.id} 
                                        className={`text-sm p-2 rounded cursor-pointer transition-colors ${
                                            assembly.status === 'IN_PROGRESS' 
                                                ? 'bg-green-50 border border-green-200 hover:bg-green-100' 
                                                : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                        onClick={() => navigate(`/sedinte/${assembly.id}/member`)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium">{assembly.title}</div>
                                            {assembly.status === 'IN_PROGRESS' && (
                                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                                                    {t('label.general_assembly.status.in_progress')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {new Date(assembly.startDate).toLocaleDateString('ro-RO')} {new Date(assembly.startDate).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            }
                            {myAssemblies.filter((a: GeneralAssemblyListItem) => 
                                a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS'
                            ).length === 0 && (
                                <div className="text-center py-4 text-gray-400 text-sm">
                                    {t('label.dashboard.no_meetings')}
                                </div>
                            )}
                        </div>
                        <Button 
                            onClick={() => navigate('/sedinte')}
                            className="w-full border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white hover:border-indigo-500"
                            size="sm"
                        >
                            {t('label.dashboard.view_all_meetings')}
                        </Button>
                    </div>
                </Card>

                {/* 5. Messages/Requests */}
                <Card title="Mesaje" className="hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600">Trimite solicitări către ONG</p>
                        {unreadCount > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                                <span className="text-red-600 font-semibold text-sm">
                                    {unreadCount} mesaj{unreadCount !== 1 ? 'e' : ''} necitit{unreadCount !== 1 ? 'e' : ''}
                                </span>
                            </div>
                        )}
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {communications.length > 0 ? (
                                communications.slice(0, 3).map((comm) => (
                                    <div 
                                        key={comm.id} 
                                        className="text-sm border-b pb-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                        onClick={() => handleViewCommunication(comm)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium">{comm.subject}</div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-xs text-gray-600">
                                                        {new Date(comm.createdAt).toLocaleDateString('ro-RO')}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        comm.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 
                                                        comm.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                        comm.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {getStatusLabel(comm.status)}
                                                    </span>
                                                </div>
                                            </div>
                                            {((comm.recipient === authContext?.user?.id && !comm.isReadByRecipient) || 
                                              (comm.sender === authContext?.user?.id && comm.unreadCountForSender > 0)) && (
                                                <span className="ml-2 text-xs font-semibold text-red-600">NOU</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-400 text-sm">
                                    Nu ai mesaje încă
                                </div>
                            )}
                        </div>
                        <Button 
                            onClick={handleSendMessage}
                            size="sm"
                            fullWidth
                        >
                            Trimite mesaj nou
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Sponsorship Modal */}
            <DirectSponsorshipModal
                isOpen={showSponsorshipModal}
                onClose={() => setShowSponsorshipModal(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['communications'] });
                    queryClient.invalidateQueries({ queryKey: ['communications-unread-count'] });
                }}
                organizationId={authContext?.user?.organizationId || ''}
            />

            {/* Activity Proposal Modal */}
            <CreateActivityProposalModal
                isOpen={showProposalModal}
                onClose={() => setShowProposalModal(false)}
                onSuccess={handleProposalSuccess}
                organizationId={authContext?.user?.organizationId || ''}
            />

            {/* Message Modal */}
            <CreateCommunicationModal
                isOpen={showMessageModal}
                onClose={() => setShowMessageModal(false)}
                onSuccess={handleMessageSuccess}
                organizationId={authContext?.user?.organizationId || ''}
                admins={admins}
                projects={projects.map(p => ({ value: p.id, label: p.name }))}
                activities={activities.map(a => ({ value: a.id, label: a.title }))}
            />

            {/* View Communication Modal */}
            <ViewCommunicationModal
                isOpen={!!selectedCommunication}
                onClose={handleCloseViewModal}
                communication={selectedCommunication}
                onUpdate={handleCloseViewModal}
            />
        </>
    );
};