import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import {Card} from "@/components/ui/Card.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {AuthState} from "@/types/auth.types.ts";
import {LoadingSpinner} from "@/components/ui/LoadingSpinner.tsx";
import {DashboardStats} from "@/types/index.types.ts";

const LandingPage: React.FC = () => {
    const { login } = useAuth();

    return (
        <Layout showNavigation={false}>
            <div className="text-center py-16">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                    Together We Bring Change!
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 mb-12 italic">
                    "The path of a mature society is given by people with solid principles."
                </p>

                <Card className="border-2 border-orange-200 bg-orange-50 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Welcome to Asura Platform!
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        AsuraPlatform helps organizations manage their structure, projects, and activities efficiently.
                        Please sign in to access your personalized dashboard.
                    </p>
                    <div className="mt-4 p-4 bg-orange-100 rounded-md border border-orange-200 text-gray-700">
                        <p className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Sign in to access more information and features
                        </p>
                    </div>
                </Card>

                {/* Feature Preview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <Card className="opacity-75" title="Active Projects">
                        <p className="text-gray-400">Sign in to view your projects</p>
                    </Card>

                    <Card className="opacity-75" title="Recent Activities">
                        <p className="text-gray-400">Sign in to view activities</p>
                    </Card>

                    <Card className="opacity-75" title="Statistics">
                        <p className="text-gray-400">Sign in to view statistics</p>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    const stats: DashboardStats = {
        recentActivities: 0,
        activeProjects: 0,
        totalStats: 0
    };

    const getUserDisplayName = (): string => {
        if (!user) return 'User';
        return user.fullName || user.username;
    };

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {getUserDisplayName()}!</h1>
                    <p className="text-gray-600">Here's what's happening with your projects and activities.</p>
                    {import.meta.env.DEV && (
                        <p className="text-xs text-gray-400 mt-2">
                            User Groups: {user?.userGroups?.join(', ') || 'None'}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card title="Recent Activities" subtitle="Latest updates from your projects">
                        {stats.recentActivities > 0 ? (
                            <div className="text-2xl font-semibold text-orange-600">
                                {stats.recentActivities}
                            </div>
                        ) : (
                            <p className="text-gray-500">No recent activities.</p>
                        )}
                    </Card>

                    <Card title="Active Projects" subtitle="Projects you're currently working on">
                        {stats.activeProjects > 0 ? (
                            <div className="text-2xl font-semibold text-blue-600">
                                {stats.activeProjects}
                            </div>
                        ) : (
                            <p className="text-gray-500">No active projects.</p>
                        )}
                    </Card>

                    <Card title="Statistics" subtitle="Your performance overview">
                        {stats.totalStats > 0 ? (
                            <div className="text-2xl font-semibold text-green-600">
                                {stats.totalStats}
                            </div>
                        ) : (
                            <p className="text-gray-500">No statistical data available.</p>
                        )}
                    </Card>
                </div>

                <Card title="Quick Actions" className="mt-8">
                    <div className="flex flex-wrap gap-4">
                        <Button variant="outline">Create New Project</Button>
                        <Button variant="outline">View Calendar</Button>
                        <Button variant="outline">Generate Report</Button>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

const Home: React.FC = () => {
    const { authState, isAuthenticated, user, error } = useAuth();

    // Debug logging for development
    if (import.meta.env.DEV) {
        console.log('Auth Debug:', {
            authState,
            isAuthenticated,
            user,
            error
        });
    }

    if (authState === AuthState.LOADING) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <LoadingSpinner size="lg" />
                <div className="ml-4">
                    <p className="text-gray-600">Initializing authentication...</p>
                    {import.meta.env.DEV && (
                        <p className="text-xs text-gray-400 mt-2">
                            Checking authentication status with backend...
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (authState === AuthState.ERROR) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h2>
                    <p className="text-gray-600 mb-4">{error || 'Failed to initialize authentication'}</p>
                    <Button onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return isAuthenticated ? <Dashboard /> : <LandingPage />;
};

export default Home;