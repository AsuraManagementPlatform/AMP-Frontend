import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from '@/context/AuthContext.context';
import Home from '@/pages/Home.page';
import AdminPanel from '@/pages/AdminPanel.page';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ROUTES, TOAST_CONFIG } from '@/utils/constants.utils';

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
                <Route path={ROUTES.PROJECTS} element={<AdminPanel />} />
                <Route path={ROUTES.NOT_FOUND} element={<div>Page Not Found</div>} />
                <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
              </Routes>
              <ToastContainer {...TOAST_CONFIG} />
            </div>
          </Router>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
