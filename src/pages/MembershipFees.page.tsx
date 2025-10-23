import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { Card } from "@/components/ui/Card";
import { PrimaryActionButton } from "@/components/ui/PrimaryActionButton";
import { CreateMembershipFeeModal } from "@/components/modals/membershipFee/CreateMembershipFeeModal";
import { MemberFeesDetailModal } from "@/components/modals/membershipFee/MemberFeesDetailModal";
import { UserGroup } from "@/types/index.types";
import { membershipFeeService } from "@/services/membershipFee.service";
import { MembershipFee, MembershipFeeStatus, MemberContributor } from "@/types/membershipFee.types";
import showToast from "@/components/ui/Toast";
import IconGroup from "@/assets/icons/iconmonstr-group.svg?react";
import IconWallet from "@/assets/icons/iconmonstr-wallet.svg?react";
import IconWarning from "@/assets/icons/iconmonstr-warning.svg?react";

const MembershipFeesPage: React.FC = () => {
    const { user, hasAnyUserGroup } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [contributors, setContributors] = useState<MemberContributor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContributor, setSelectedContributor] = useState<MemberContributor | null>(null);

    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);
    const hasOrganization = user?.organizationId;

    const canManageFees = isOrgAdmin && hasOrganization;

    const loadContributors = useCallback(async () => {
        if (!user?.organizationId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await membershipFeeService.getList({
                organization_id: user.organizationId
            });

            const fees = response.results || [];
            const membersOnlyFees = fees.filter(fee => {
                const groups = fee.memberGroups || [];
                return !groups.includes('ADMIN') && !groups.includes('ORG_ADMIN');
            });
            
            const aggregated = aggregateFeesByMember(membersOnlyFees);
            setContributors(aggregated);
        } catch (error) {
            showToast.error("Eroare la încărcarea datelor cotizanților");
        } finally {
            setLoading(false);
        }
    }, [user?.organizationId]);

    useEffect(() => {
        loadContributors();
    }, [loadContributors]);

    const aggregateFeesByMember = (fees: MembershipFee[]): MemberContributor[] => {
        const memberMap = new Map<string, MemberContributor>();

        fees.forEach(fee => {
            if (!memberMap.has(fee.memberId)) {
                memberMap.set(fee.memberId, {
                    memberId: fee.memberId,
                    memberName: fee.memberName || 'Nume necunoscut',
                    memberType: 'MEMBER',
                    totalPaid: 0,
                    totalPending: 0,
                    totalPendingVerification: 0,
                    totalOverdue: 0,
                    hasOverdueFees: false,
                    feeCount: 0,
                    currency: fee.currency,
                    fees: []
                });
            }

            const contributor = memberMap.get(fee.memberId)!;
            contributor.fees.push(fee);
            contributor.feeCount++;

            const amount = Number(fee.amount) || 0;

            if (fee.status === MembershipFeeStatus.PAID) {
                contributor.totalPaid += amount;
                if (!contributor.lastPaymentDate || fee.paymentDate! > contributor.lastPaymentDate) {
                    contributor.lastPaymentDate = fee.paymentDate;
                }
            } else if (fee.status === MembershipFeeStatus.PENDING) {
                contributor.totalPending += amount;
            } else if (fee.status === MembershipFeeStatus.PENDING_VERIFICATION) {
                contributor.totalPendingVerification += amount;
            } else if (fee.status === MembershipFeeStatus.OVERDUE) {
                contributor.totalOverdue += amount;
                contributor.hasOverdueFees = true;
            }

            if (fee.nextDueDate && (!contributor.nextDueDate || fee.nextDueDate < contributor.nextDueDate)) {
                contributor.nextDueDate = fee.nextDueDate;
            }
        });

        return Array.from(memberMap.values()).sort((a, b) => 
            a.memberName.localeCompare(b.memberName)
        );
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleFeeCreated = () => {
        loadContributors();
        setIsCreateModalOpen(false);
    };

    const handleRefreshModal = useCallback(async () => {
        if (!user?.organizationId) return;
        
        await loadContributors();
        
        if (selectedContributor) {
            const updatedContributor = contributors.find(c => c.memberId === selectedContributor.memberId);
            if (updatedContributor) {
                setSelectedContributor(updatedContributor);
            } else {
                setSelectedContributor(null);
            }
        }
    }, [user?.organizationId, selectedContributor, contributors, loadContributors]);

    const handleMemberClick = (contributor: MemberContributor) => {
        setSelectedContributor(contributor);
    };

    const getStatusBadge = (contributor: MemberContributor) => {
        if (contributor.hasOverdueFees) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <IconWarning className="w-3 h-3 mr-1" />
                    Restanță
                </span>
            );
        }
        if (contributor.totalPending > 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    În așteptare
                </span>
            );
        }
        if (contributor.totalPendingVerification > 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    În curs de validare
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                La zi
            </span>
        );
    };

    if (loading) {
        return (
            <Layout showNavigation={true}>
                <div className="container mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Se încarcă datele...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Cotizanți</h1>
                    <p className="text-gray-600">Lista membrilor care plătesc cotizații către organizație</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{contributors.length}</div>
                                <div className="text-sm text-gray-600">Total cotizanți</div>
                            </div>
                            <IconGroup className="w-8 h-8 text-blue-500" />
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-green-900">
                                    {Number(contributors.reduce((sum, c) => sum + c.totalPaid, 0)).toFixed(2)} RON
                                </div>
                                <div className="text-sm text-gray-600">Total încasat</div>
                            </div>
                            <IconWallet className="w-8 h-8 text-green-500" />
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-yellow-900">
                                    {Number(contributors.reduce((sum, c) => sum + c.totalPending, 0)).toFixed(2)} RON
                                </div>
                                <div className="text-sm text-gray-600">În așteptare</div>
                            </div>
                            <IconWallet className="w-8 h-8 text-yellow-500" />
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-red-900">
                                    {contributors.filter(c => c.hasOverdueFees).length}
                                </div>
                                <div className="text-sm text-gray-600">Cu restanțe</div>
                            </div>
                            <IconWarning className="w-8 h-8 text-red-500" />
                        </div>
                    </Card>
                </div>

                {canManageFees && (
                    <Card
                        title="Acțiuni rapide"
                        className="mb-6"
                        headerActions={
                            <div className="flex gap-4">
                                <PrimaryActionButton
                                    variant="create"
                                    onClick={handleOpenCreateModal}
                                    title="Adaugă o nouă cotizație pentru un membru"
                                >
                                    Adaugă cotizație
                                </PrimaryActionButton>
                            </div>
                        }
                    >
                    </Card>
                )}

                <Card title={`Lista cotizanți (${contributors.length})`} className="mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Membru
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Total plătit
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        În așteptare
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Restanță
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Ultima plată
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Următoare scadență
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Nr. cotizații
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {contributors.length > 0 ? (
                                    contributors.map((contributor) => (
                                        <tr 
                                            key={contributor.memberId} 
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => handleMemberClick(contributor)}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <IconGroup className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="font-medium text-gray-900">{contributor.memberName}</div>
                                                        <div className="text-sm text-gray-500">{contributor.memberType}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {getStatusBadge(contributor)}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="font-medium text-green-900">
                                                    {contributor.totalPaid.toFixed(2)} {contributor.currency}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="font-medium text-yellow-900">
                                                    {contributor.totalPending.toFixed(2)} {contributor.currency}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="font-medium text-red-900">
                                                    {contributor.totalOverdue.toFixed(2)} {contributor.currency}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-700">
                                                    {contributor.lastPaymentDate 
                                                        ? new Date(contributor.lastPaymentDate).toLocaleDateString('ro-RO')
                                                        : '-'
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-700">
                                                    {contributor.nextDueDate 
                                                        ? new Date(contributor.nextDueDate).toLocaleDateString('ro-RO')
                                                        : '-'
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-900 bg-gray-100 rounded-full">
                                                    {contributor.feeCount}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                            Nu există cotizanți înregistrați încă.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {canManageFees && (
                    <CreateMembershipFeeModal
                        isOpen={isCreateModalOpen}
                        onClose={handleCloseCreateModal}
                        onSuccess={handleFeeCreated}
                    />
                )}

                {selectedContributor && (
                    <MemberFeesDetailModal
                        isOpen={!!selectedContributor}
                        onClose={() => setSelectedContributor(null)}
                        memberId={selectedContributor.memberId}
                        memberName={selectedContributor.memberName}
                        fees={selectedContributor.fees}
                        onRefresh={handleRefreshModal}
                    />
                )}
            </div>
        </Layout>
    );
};

export default MembershipFeesPage;
