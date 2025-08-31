import React, {useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {BaseComponentProps, UserGroup} from "@/types/index.types.ts";
import {ROUTES} from "@/utils/constants.utils.ts";
import {useAuth} from "@/hooks/useAuth.ts";

interface NavigationItem {
    name: string;
    path: string;
    show: boolean;
    variant?: 'default' | 'admin';
}

interface LayoutProps extends BaseComponentProps {
    showNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({children, className = '', showNavigation = true}) => {
    const {
        user,
        isAuthenticated,
        login,
        logout,
        hasAnyUserGroup
    } = useAuth();

    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const navItems: NavigationItem[] = [
        {
            name: 'Dashboard',
            path: ROUTES.DASHBOARD,
            show: isAuthenticated
        },
        {
            name: hasAnyUserGroup([UserGroup.ADMIN]) ? 'Organizations' : 'Organization',
            path: hasAnyUserGroup([UserGroup.ADMIN]) ? ROUTES.ORGANIZATIONS : '/organization-details',
            show: isAuthenticated
        },
        {
            name: 'Projects',
            path: ROUTES.PROJECTS,
            show: isAuthenticated
        },
        {
            name: 'Calendar',
            path: '/calendar',
            show: isAuthenticated
        },
    ];

    const adminItems: NavigationItem[] = [
        {
            name: 'Admin Panel',
            path: '/admin',
            show: isAuthenticated && hasAnyUserGroup([UserGroup.ADMIN, UserGroup.ORGANIZATION_ADMIN]),
            variant: 'admin'
        }
    ];

    const isActive = (path: string): boolean => {
        return location.pathname === path;
    };

    const handleLogout = (): void => {
        setDropdownOpen(false);
        logout();
    };

    const getUserInitials = (): string => {
        if (!user) return 'U';

        if (user.fullName) {
            const names = user.fullName.split(' ');
            return names.length > 1
                ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
                : names[0][0].toUpperCase();
        }

        return user.username[0].toUpperCase();
    };

    const getUserDisplayName = (): string => {
        if (!user) return '';
        return user.fullName || user.username;
    };

    return (
        <div className={`min-h-screen flex flex-col bg-gray-100 ${className}`}>
            <header className="bg-white text-gray-800 shadow-md w-full">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-wrap items-center justify-between py-4">
                        <div className="flex items-center">
                            <Link to={ROUTES.HOME} className="flex items-center">
                                <div className="h-10 w-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                                    A
                                </div>
                                <span className="ml-2 text-xl font-bold text-gray-800">Asura</span>
                            </Link>
                        </div>

                        {showNavigation && isAuthenticated && (
                            <nav className="flex items-center">
                                <ul className="flex space-x-1 md:space-x-4">
                                    {navItems.map((item, index) => (
                                        item.show && (
                                            <li key={index}>
                                                <Link
                                                    to={item.path}
                                                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                                                        isActive(item.path)
                                                            ? 'font-bold text-orange-500'
                                                            : 'text-gray-700 hover:text-orange-500 hover:font-semibold'
                                                    }`}
                                                >
                                                    {item.name}
                                                </Link>
                                            </li>
                                        )
                                    ))}

                                    {adminItems.some(item => item.show) && (
                                        <li>
                                            <Link
                                                to="/admin"
                                                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                                                    location.pathname.includes('/admin')
                                                        ? 'font-bold text-red-600'
                                                        : 'text-gray-700 hover:text-red-600 hover:font-semibold'
                                                }`}
                                            >
                                                Admin
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </nav>
                        )}

                        <div className="flex items-center">
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        className="flex items-center cursor-pointer rounded-md hover:bg-gray-100 p-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        aria-expanded={dropdownOpen}
                                        aria-haspopup="true"
                                    >
                                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white mr-2">
                                            {getUserInitials()}
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <div className="text-sm font-medium">{getUserDisplayName()}</div>
                                            {user?.username && (
                                                <div className="text-xs text-gray-500">@{user.username}</div>
                                            )}
                                        </div>
                                        <svg
                                            className="ml-1 w-4 h-4 transition-transform duration-200"
                                            style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {dropdownOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setDropdownOpen(false)}
                                            />

                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                                                <Link
                                                    to={ROUTES.PROFILE}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    Profile
                                                </Link>
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => login()}
                                    className="px-4 py-2 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {children}
                </div>
            </main>

            <footer className="bg-gray-300 py-4 mt-auto">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center text-gray-600 text-sm">
                        © Asura 2025. All rights reserved
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;