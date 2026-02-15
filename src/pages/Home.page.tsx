import React, { lazy, Suspense, useEffect, useState } from 'react';
import {useAuth} from '@/hooks/useAuth';
import {Button} from "@/components/ui/Button.tsx";
import {AuthState} from "@/types/auth.types.ts";
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx";
import LandingPage from "@/pages/Landing.page.tsx";
import { useTranslation } from 'react-i18next';

const DashboardPage = lazy(() => import("@/pages/Dashboard.page.tsx"));

const Home: React.FC = () => {
    const { authState, isAuthenticated, error, userNotFoundInDatabase, logout } = useAuth();
    const { t } = useTranslation();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('password_reset') === 'success') {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);

        }
    }, []);

    useEffect(() => {
        if (userNotFoundInDatabase && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
        if (userNotFoundInDatabase && countdown === 0) {
            logout();
        }
    }, [userNotFoundInDatabase, countdown, logout]);

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
        if (userNotFoundInDatabase) {
            return (
                <div className="flex justify-center items-center min-h-screen bg-gray-100">
                    <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
                        <div className="mb-6">
                            <svg className="mx-auto h-16 w-16 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('toast.auth.user_not_found_title')}</h2>
                        <p className="text-gray-600 mb-6">{t('toast.auth.user_not_found_in_database')}</p>
                        <p className="text-gray-500 mb-4">{t('toast.auth.redirect_countdown', { seconds: countdown })}</p>
                        <Button onClick={() => logout()} variant="primary">
                            {t('label.back_to_login')}
                        </Button>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-red-600 mb-4">{t('toast.auth.authentication_error')}</h2>
                    <p className="text-gray-600 mb-6">{error || t('toast.auth.authentication_failed')}</p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={() => window.location.reload()} variant="outline">
                            {t('label.button.retry')}
                        </Button>
                        <Button onClick={() => logout()} variant="primary">
                            {t('label.back_to_login')}
                        </Button>
                    </div>
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