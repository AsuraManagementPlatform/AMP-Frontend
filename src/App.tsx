import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastConfig } from '@/components/ui/Toast';
import { ROUTES } from '@/utils/constants.utils';
import { AuthProvider } from "@/context/Auth.context.tsx";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserGroup } from '@/types/index.types';
import { ConfirmDialogProvider } from "@/components/ui/ConfirmDialog.tsx";

const EntityPage = lazy(() => import('@/pages/entity/Entity.page.tsx'));
const Home = lazy(() => import('@/pages/Home.page'));
const AdminPanel = lazy(() => import('@/pages/AdminPanel.page'));
const Projects = lazy(() => import('@/pages/Projects.page'));
const Calendar = lazy(() => import('@/pages/Calendar.page'));
const OrganizationDetails = lazy(() => import('@/pages/OrganizationDetails.page'));
const ProfilePage = lazy(() => import('@/pages/Profile.page'));
const SettingsPage = lazy(() => import('@/pages/Settings.page'));
const EntitiesPage = lazy(() => import('@/pages/crm/Entities.page'));
const OrganizationDonationsPage = lazy(() => import('@/pages/crm/OrganizationDonations.page'));
const CommunicationsPage = lazy(() => import('@/pages/crm/Communications.page'));
const VotingSessionsPage = lazy(() => import('@/pages/crm/VotingSessions.page'));
const GeneralAssemblyPage = lazy(() => import('@/pages/crm/GeneralAssembly.page'));
const GeneralAssemblyMemberVotePage = lazy(() => import('@/pages/crm/GeneralAssemblyMemberVote.page'));
const ProjectPage = lazy(() => import("@/pages/project/Project.page.tsx"));
const MembershipFeesPage = lazy(() => import("@/pages/MembershipFees.page"));
const TeamManagementPage = lazy(() => import("@/pages/organization/TeamManagement.page"));
const Vats = lazy(() => import("@/pages/vat/Vats.page"));
const SmartDevicesPage = lazy(() => import('@/pages/SmartDevices.page'));
const SondajePage = lazy(() => import('./pages/Surveys.page'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
        },
    },
});

function App() {
    return (
        <ConfirmDialogProvider>
            <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <Router>
                            <div className="App">
                                <Suspense fallback={<LoadingFallback />}>
                                    <Routes>
                                        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                                        <Route path={ROUTES.DASHBOARD} element={<Home />} />

                                        <Route
                                            path={ROUTES.PROFILE}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ADMIN, UserGroup.ORGANIZATION_ADMIN, UserGroup.EMPLOYEE, UserGroup.MEMBER, UserGroup.VOLUNTEER]}>
                                                    <ProfilePage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.SETTINGS}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ADMIN, UserGroup.ORGANIZATION_ADMIN, UserGroup.EMPLOYEE, UserGroup.MEMBER, UserGroup.VOLUNTEER]}>
                                                    <SettingsPage />
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Admin Routes */}
                                        <Route
                                            path={ROUTES.CRM_ORGANIZATIONS}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ADMIN]}>
                                                    <AdminPanel />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.CRM_CREATE_ORGANIZATION}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ADMIN]}>
                                                    <AdminPanel />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.CRM_ADMIN_PANEL}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ADMIN]}>
                                                    <AdminPanel />
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* ERP Routes */}
                                        <Route
                                            path={ROUTES.ERP_PROJECTS}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ADMIN, UserGroup.ORGANIZATION_ADMIN]} requireModule="ERP">
                                                    <Projects />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.ERP_PROJECT_DETAILS}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN, UserGroup.MEMBER, UserGroup.EMPLOYEE, UserGroup.VOLUNTEER, UserGroup.MANAGER]}>
                                                    <ProjectPage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.ERP_MEMBERSHIP_FEES}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN]} requireModule="ERP">
                                                    <MembershipFeesPage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.ERP_VATS}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ADMIN]}>
                                                    <Vats />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.SMART_DEVICES}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ADMIN]}>
                                                    <SmartDevicesPage />
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Calendar */}
                                        <Route
                                            path={ROUTES.CALENDAR}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ADMIN, UserGroup.ORGANIZATION_ADMIN, UserGroup.EMPLOYEE, UserGroup.MEMBER, UserGroup.VOLUNTEER]}>
                                                    <Calendar />
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Sondaje */}
                                        <Route
                                            path="/sondaje/*"
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ADMIN, UserGroup.ORGANIZATION_ADMIN, UserGroup.EMPLOYEE, UserGroup.MEMBER, UserGroup.VOLUNTEER]}>
                                                    <SondajePage />
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* CRM Routes */}
                                        <Route
                                            path={ROUTES.CRM_ORGANIZATION_DETAILS}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN]} requireModule="CRM">
                                                    <OrganizationDetails />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.CRM_ENTITIES}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN]} requireModule="CRM">
                                                    <EntitiesPage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.CRM_ENTITY_DETAILS}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN]} requireModule="CRM">
                                                    <EntityPage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.CRM_DONATIONS}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN]} requireModule="CRM">
                                                    <OrganizationDonationsPage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.CRM_COMMUNICATIONS}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN]} requireModule="CRM">
                                                    <CommunicationsPage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.CRM_VOTING_SESSIONS}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN, UserGroup.MEMBER]} requireModule="CRM">
                                                    <VotingSessionsPage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.CRM_GENERAL_ASSEMBLY}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN, UserGroup.MEMBER]} requireModule="CRM">
                                                    <GeneralAssemblyPage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.CRM_GENERAL_ASSEMBLY_MEMBER_VIEW}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN, UserGroup.MEMBER]} requireModule="CRM">
                                                    <GeneralAssemblyMemberVotePage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.CRM_ORGANIZATION_TEAM_MANAGEMENT}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN]} requireModule="CRM">
                                                    <TeamManagementPage />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path={ROUTES.CRM_ORGANIZATION_MEMBER_PROFILE}
                                            element={
                                                <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN]} requireModule="CRM">
                                                    <ProfilePage />
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Legacy Redirects */}
                                        <Route path={ROUTES.PROJECTS} element={<Navigate to={ROUTES.ERP_PROJECTS} replace />} />
                                        <Route path={ROUTES.ORGANIZATIONS} element={<Navigate to={ROUTES.CRM_ORGANIZATIONS} replace />} />
                                        <Route path={ROUTES.CREATE_ORGANIZATION} element={<Navigate to={ROUTES.CRM_CREATE_ORGANIZATION} replace />} />
                                        <Route path={ROUTES.ADMIN_PANEL} element={<Navigate to={ROUTES.CRM_ADMIN_PANEL} replace />} />
                                        <Route path={ROUTES.ORGANIZATION_DETAILS} element={<Navigate to={ROUTES.CRM_ORGANIZATION_DETAILS} replace />} />

                                        {/* Error Routes */}
                                        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
                                        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
                                    </Routes>
                                </Suspense>
                                <ToastConfig />
                            </div>
                        </Router>
                    </AuthProvider>
                    {import.meta.env.MODE === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
                </QueryClientProvider>
            </ErrorBoundary>
        </ConfirmDialogProvider>
    );
}

export default App;