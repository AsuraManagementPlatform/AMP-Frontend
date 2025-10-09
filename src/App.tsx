import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import Home from '@/pages/Home.page';
import AdminPanel from '@/pages/AdminPanel.page';
import Projects from '@/pages/Projects.page';
import Activities from '@/pages/Activities.page';
import Calendar from '@/pages/Calendar.page';
import OrganizationDetails from '@/pages/OrganizationDetails.page';
import ProfilePage from '@/pages/Profile.page';
import SettingsPage from '@/pages/Settings.page';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastConfig } from '@/components/ui/Toast';
import { ROUTES } from '@/utils/constants.utils';
import { AuthProvider } from "@/context/Auth.context.tsx";
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserGroup } from '@/types/index.types';
import ProjectPage from "@/pages/project/Project.page.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path={ROUTES.HOME} element={<Home />} />
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
                
                <Route 
                  path={ROUTES.ERP_PROJECTS} 
                  element={
                    <ProtectedRoute allowedRoles={[UserGroup.ADMIN, UserGroup.ORGANIZATION_ADMIN]}>
                      <Projects />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path={ROUTES.ERP_PROJECT_DETAILS}
                  element={
                      <ProtectedRoute allowedRoles={[UserGroup.ADMIN, UserGroup.ORGANIZATION_ADMIN]}>
                          <ProjectPage />
                      </ProtectedRoute>
                  }
                />
                <Route 
                  path={ROUTES.ERP_ACTIVITIES} 
                  element={
                    <ProtectedRoute allowedRoles={[UserGroup.ADMIN, UserGroup.ORGANIZATION_ADMIN]}>
                      <Activities />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path={ROUTES.CALENDAR} 
                  element={
                    <ProtectedRoute allowedRoles={[UserGroup.ADMIN, UserGroup.ORGANIZATION_ADMIN, UserGroup.EMPLOYEE, UserGroup.MEMBER, UserGroup.VOLUNTEER]}>
                      <Calendar />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path={ROUTES.CRM_ORGANIZATION_DETAILS} 
                  element={
                    <ProtectedRoute allowedRoles={[UserGroup.ORGANIZATION_ADMIN]}>
                      <OrganizationDetails />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path={ROUTES.PROJECTS} element={<Navigate to={ROUTES.ERP_PROJECTS} replace />} />
                <Route path={ROUTES.ACTIVITIES} element={<Navigate to={ROUTES.ERP_ACTIVITIES} replace />} />
                <Route path={ROUTES.ORGANIZATIONS} element={<Navigate to={ROUTES.CRM_ORGANIZATIONS} replace />} />
                <Route path={ROUTES.CREATE_ORGANIZATION} element={<Navigate to={ROUTES.CRM_CREATE_ORGANIZATION} replace />} />
                <Route path={ROUTES.ADMIN_PANEL} element={<Navigate to={ROUTES.CRM_ADMIN_PANEL} replace />} />
                <Route path={ROUTES.ORGANIZATION_DETAILS} element={<Navigate to={ROUTES.CRM_ORGANIZATION_DETAILS} replace />} />
                
                <Route path={ROUTES.NOT_FOUND} element={<div>Page Not Found</div>} />
                <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
              </Routes>
              <ToastConfig />
            </div>
          </Router>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
