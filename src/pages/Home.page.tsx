import React, { lazy, Suspense, useEffect } from 'react';
import {useAuth} from '@/hooks/useAuth';
import {Button} from "@/components/ui/Button.tsx";
import {AuthState} from "@/types/auth.types.ts";
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx";
import LandingPage from "@/pages/Landing.page.tsx";

const DashboardPage = lazy(() => import("@/pages/Dashboard.page.tsx"));

const Home: React.FC = () => {
    const { authState, isAuthenticated, error } = useAuth();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('password_reset') === 'success') {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);

        }
    }, []);

    if (authState === AuthState.LOADING) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <LoadingSpinner size="lg" />
                <div className="ml-4">
                    <p className="text-gray-600">Se inițializează autentificarea...</p>
                </div>
            </div>
        );
    }

    if (authState === AuthState.ERROR) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Eroare de autentificare</h2>
                    <p className="text-gray-600 mb-4">{error || 'Autentificarea nu a putut fi inițializată'}</p>
                    <Button onClick={() => window.location.reload()}>
                        Reîncearcă
                    </Button>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <Suspense fallback={
                <div className="flex justify-center items-center min-h-screen bg-gray-100">
                    <LoadingSpinner size="lg" />
                    <div className="ml-4">
                        <p className="text-gray-600">Se încarcă dashboard-ul...</p>
                    </div>
                </div>
            }>
                <DashboardPage />
            </Suspense>
        );
    }

    return <LandingPage />;
};

export default Home;