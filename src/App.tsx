import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import Home from '@/pages/Home.page';
import AdminPanel from '@/pages/AdminPanel.page';
import Projects from '@/pages/Projects.page';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastConfig } from '@/components/ui/Toast';
import { ROUTES } from '@/utils/constants.utils';
import {AuthProvider} from "@/context/Auth.context.tsx";

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
                <Route path={ROUTES.PROFILE} element={<Home />} />
                <Route path={ROUTES.ORGANIZATIONS} element={<AdminPanel />} />
                <Route path={ROUTES.CREATE_ORGANIZATION} element={<AdminPanel />} />
                <Route path={ROUTES.PROJECTS} element={<Projects />} />
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
