import React, { useState, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import communicationService from '@/services/communication.service';
import activityProposalService from '@/services/activity-proposal.service';
import { organizationMemberService } from '@/services/organization-member.service';
import { Communication, UserCommunicationStatus } from '@/types/communication.types';
import { ActivityProposal, ProposalStatus } from '@/types/activity-proposal.types';
import { CreateCommunicationModal } from '@/components/modals/communication/CreateCommunicationModal';
import { CreateActivityProposalModal } from '@/components/modals/activity-proposal/CreateActivityProposalModal';
import { ViewCommunicationModal } from '@/components/modals/communication/ViewCommunicationModal';
import { AuthContext } from '@/context/Auth.context';
import { SelectOption } from '@/types/form.types';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import showToast from '@/components/ui/Toast';

const CommunicationsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'messages' | 'proposals'>('messages');
    const [showCreateMessageModal, setShowCreateMessageModal] = useState(false);
    const [showCreateProposalModal, setShowCreateProposalModal] = useState(false);
    const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
    const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);
    const authContext = useContext(AuthContext);
    const user = authContext?.user;
    const queryClient = useQueryClient();
    const confirm = useConfirmDialog();

    const { data: communicationsData, isLoading: loadingCommunications } = useQuery({
        queryKey: ['communications'],
        queryFn: () => communicationService.getList()
    });

    const { data: proposalsData, isLoading: loadingProposals } = useQuery({
        queryKey: ['activity-proposals'],
        queryFn: () => activityProposalService.getList()
    });

    const { data: unreadData } = useQuery({
        queryKey: ['communications-unread-count'],
        queryFn: () => communicationService.getUnreadCount(),
        refetchInterval: 30000
    });

    const { data: organizationMembersData } = useQuery({
        queryKey: ['organization-members'],
        queryFn: () => organizationMemberService.getList()
    });

    const communications = communicationsData?.results || [];
    const proposals = proposalsData?.results || [];
    const unreadCount = unreadData?.unreadCount || 0;

    const availableRecipients = useMemo((): SelectOption[] => {
        if (!organizationMembersData?.organizationMembersList) return [];
        
        return organizationMembersData.organizationMembersList
            .filter(member => member.memberDetails.id !== user?.id)
            .map(member => ({
                value: member.memberDetails.id,
                label: `${member.memberDetails.fullName} (${member.memberDetails.email})`
            }));
    }, [organizationMembersData, user?.id]);

    const handleMessageSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['communications'] });
        queryClient.invalidateQueries({ queryKey: ['communications-unread-count'] });
    };

    const handleProposalSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['activity-proposals'] });
    };

    const handleViewCommunication = (comm: Communication) => {
        setSelectedCommunication(comm);
    };

    const handleCloseViewModal = () => {
        setSelectedCommunication(null);
        queryClient.invalidateQueries({ queryKey: ['communications'] });
        queryClient.invalidateQueries({ queryKey: ['communications-unread-count'] });
    };

    const handleCommunicationUpdate = () => {
        queryClient.invalidateQueries({ queryKey: ['communications'] });
        queryClient.invalidateQueries({ queryKey: ['communications-unread-count'] });
    };

    const isUnreadForCurrentUser = (comm: Communication): boolean => {
        if (!user?.id) return false;
        
        if (comm.recipient === user.id) {
            return !comm.isReadByRecipient;
        }
        
        if (comm.sender === user.id) {
            return comm.unreadCountForSender > 0;
        }
        
        return false;
    };

    const toggleDeleteMode = () => {
        setIsDeleteMode(!isDeleteMode);
        setSelectedMessages(new Set());
    };

    const toggleMessageSelection = (messageId: string) => {
        const newSelected = new Set(selectedMessages);
        if (newSelected.has(messageId)) {
            newSelected.delete(messageId);
        } else {
            newSelected.add(messageId);
        }
        setSelectedMessages(newSelected);
    };

    const handleDeleteMultiple = async () => {
        if (selectedMessages.size === 0) {
            showToast.error('Te rog selectează cel puțin un mesaj');
            return;
        }

        const confirmed = await confirm({
            title: 'Șterge mesajele selectate',
            message: `Ești sigur că vrei să ștergi ${selectedMessages.size} mesaj${selectedMessages.size > 1 ? 'e' : ''}? Această acțiune va șterge mesajele doar pentru tine.`,
            confirmText: 'Șterge',
            cancelText: 'Anulează',
            confirmButtonVariant: 'danger',
        });

        if (!confirmed) return;

        try {
            setIsDeletingMultiple(true);
            
            await Promise.all(
                Array.from(selectedMessages).map(id => 
                    communicationService.delete(id)
                )
            );

            showToast.success(`${selectedMessages.size} mesaj${selectedMessages.size > 1 ? 'e au' : ' a'} fost șters${selectedMessages.size > 1 ? 'e' : ''} cu succes`);
            setIsDeleteMode(false);
            setSelectedMessages(new Set());
            handleCommunicationUpdate();
        } catch (error: any) {
            showToast.error(error.message || 'Nu s-au putut șterge mesajele');
        } finally {
            setIsDeletingMultiple(false);
        }
    };

    const getStatusBadge = (status: UserCommunicationStatus | ProposalStatus) => {
        const badges: Record<string, string> = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'IN_PROGRESS': 'bg-blue-100 text-blue-800',
            'RESOLVED': 'bg-green-100 text-green-800',
            'CLOSED': 'bg-gray-100 text-gray-800',
            'APPROVED': 'bg-green-100 text-green-800',
            'REJECTED': 'bg-red-100 text-red-800',
            'CHANGES_REQUESTED': 'bg-orange-100 text-orange-800'
        };
        const labels: Record<string, string> = {
            'PENDING': 'În așteptare',
            'IN_PROGRESS': 'În progres',
            'RESOLVED': 'Rezolvat',
            'CLOSED': 'Închis',
            'APPROVED': 'Aprobat',
            'REJECTED': 'Respins',
            'CHANGES_REQUESTED': 'Modificări solicitate'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Comunicări</h1>
                        <p className="text-gray-600 mt-1">Mesaje și propuneri de activități</p>
                    </div>
                    <div className="flex gap-2">
                        {activeTab === 'messages' && (
                            <>
                                {!isDeleteMode ? (
                                    <>
                                        <Button 
                                            onClick={() => setShowCreateMessageModal(true)}
                                        >
                                            Mesaj Nou
                                        </Button>
                                        {communications.length > 0 && (
                                            <Button 
                                                variant="danger"
                                                onClick={toggleDeleteMode}
                                            >
                                                Șterge Mesaje
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Button 
                                            className="!bg-red-600 hover:!bg-red-700 !text-white font-bold text-base px-6 shadow-md"
                                            onClick={handleDeleteMultiple}
                                            disabled={selectedMessages.size === 0 || isDeletingMultiple}
                                        >
                                            {isDeletingMultiple ? 'Se șterge...' : `Șterge (${selectedMessages.size})`}
                                        </Button>
                                        <Button 
                                            className="!bg-white !border-2 !border-gray-400 !text-gray-800 hover:!bg-gray-100 font-semibold px-6"
                                            onClick={toggleDeleteMode}
                                            disabled={isDeletingMultiple}
                                        >
                                            Anulează
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                        {activeTab === 'proposals' && (
                            <>
                                <Button 
                                    onClick={() => setShowCreateMessageModal(true)}
                                >
                                    Mesaj Nou
                                </Button>
                                {!user?.groups?.includes('organization_admin') && (
                                    <Button 
                                        onClick={() => setShowCreateProposalModal(true)}
                                    >
                                        Propune Activitate
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <Card className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Total Mesaje</div>
                            <div className="text-2xl font-bold text-blue-600">{communications.length}</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Necitite</div>
                            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Total Propuneri</div>
                            <div className="text-2xl font-bold text-yellow-600">{proposals.length}</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600">Propuneri în Așteptare</div>
                            <div className="text-2xl font-bold text-purple-600">
                                {proposals.filter(p => p.status === 'PENDING').length}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="border-b border-gray-200 mb-4">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveTab('messages')}
                                className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                                    activeTab === 'messages'
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Mesaje ({communications.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('proposals')}
                                className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                                    activeTab === 'proposals'
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Propuneri ({proposals.length})
                            </button>
                        </div>
                    </div>

                    {activeTab === 'messages' && (
                        loadingCommunications ? (
                            <div className="text-center py-8 text-gray-500">Se încarcă...</div>
                        ) : communications.length > 0 ? (
                            <div className="space-y-4">
                                {communications.map((comm: Communication) => (
                                    <div 
                                        key={comm.id} 
                                        className={`border rounded-lg p-4 transition-colors ${
                                            isDeleteMode 
                                                ? 'hover:bg-gray-50' 
                                                : 'hover:bg-gray-50 cursor-pointer'
                                        }`}
                                        onClick={() => !isDeleteMode && handleViewCommunication(comm)}
                                    >
                                        <div className="flex items-start gap-3">
                                            {isDeleteMode && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMessages.has(comm.id)}
                                                    onChange={() => toggleMessageSelection(comm.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{comm.subject}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    De la: {comm.senderName} · Către: {comm.recipientName}
                                                </p>
                                                <p className="text-sm text-gray-700 mt-2">{comm.initialMessage}</p>
                                                <div className="mt-3 flex items-center gap-3">
                                                    {getStatusBadge(comm.status)}
                                                    <span className="text-xs text-gray-500">
                                                        {comm.messageCount} mesaj{comm.messageCount !== 1 ? 'e' : ''}
                                                    </span>
                                                    {isUnreadForCurrentUser(comm) && (
                                                        <span className="text-xs font-semibold text-red-600">NOU</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">Nu există mesaje încă.</div>
                        )
                    )}

                    {activeTab === 'proposals' && (
                        loadingProposals ? (
                            <div className="text-center py-8 text-gray-500">Se încarcă...</div>
                        ) : proposals.length > 0 ? (
                            <div className="space-y-4">
                                {proposals.map((proposal: ActivityProposal) => (
                                    <div key={proposal.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{proposal.activityTitle}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Proiect: {proposal.projectName} · Propus de: {proposal.proposerName}
                                                </p>
                                                <p className="text-sm text-gray-700 mt-2">{proposal.description}</p>
                                                <div className="mt-3 flex items-center gap-3">
                                                    {getStatusBadge(proposal.status)}
                                                    <span className="text-xs text-gray-500">
                                                        {proposal.startDate} - {proposal.endDate}
                                                    </span>
                                                    {proposal.estimatedBudget && (
                                                        <span className="text-xs text-gray-500">
                                                            Buget: {proposal.estimatedBudget} RON
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">Vizualizare</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">Nu există propuneri încă.</div>
                        )
                    )}
                </Card>

                <CreateCommunicationModal
                    isOpen={showCreateMessageModal}
                    onClose={() => setShowCreateMessageModal(false)}
                    onSuccess={handleMessageSuccess}
                    organizationId={user?.organizationId || ''}
                    admins={availableRecipients}
                    projects={[]}
                    activities={[]}
                />

                <CreateActivityProposalModal
                    isOpen={showCreateProposalModal}
                    onClose={() => setShowCreateProposalModal(false)}
                    onSuccess={handleProposalSuccess}
                    organizationId={user?.organizationId || ''}
                />

                <ViewCommunicationModal
                    isOpen={!!selectedCommunication}
                    onClose={handleCloseViewModal}
                    communication={selectedCommunication}
                    onUpdate={handleCommunicationUpdate}
                />
            </div>
        </Layout>
    );
};

export default CommunicationsPage;
