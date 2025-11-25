import React, {useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {BaseComponentProps, UserGroup} from "@/types/index.types.ts";
import {ROUTES} from "@/utils/constants.utils.ts";
import {useAuth} from "@/hooks/useAuth.ts";
import logoImage from '@/assets/img/logo.png';
import {t} from "i18next";
import PNRRBanner from './PNRRBanner';
import communicationService from '@/services/communication.service';

interface LayoutProps extends BaseComponentProps {
    showNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({children, className = '', showNavigation = true}) => {
    const {
        user,
        isAuthenticated,
        login,
        logout,
        hasAnyUserGroup,
        hasERP,
        hasCRM
    } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [erpDropdownOpen, setErpDropdownOpen] = useState(false);
    const [crmDropdownOpen, setCrmDropdownOpen] = useState(false);

    const { data: unreadData } = useQuery({
        queryKey: ['communications-unread-count'],
        queryFn: () => communicationService.getUnreadCount(),
        enabled: isAuthenticated,
        refetchInterval: 30000,
        refetchOnWindowFocus: false,
        staleTime: 5000
    });

    const unreadCount = unreadData?.unreadCount || 0;

    const handleLogout = async (): Promise<void> => {
        setDropdownOpen(false);
        try {
            await logout();
        } catch (error) {
        }
    };

    const getUserInitials = (): string => {
        if (!user) return 'U';

        if (user.fullName) {
            const names = user.fullName.split(' ');
            return names.length > 1
                ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
                : names[0][0].toUpperCase();
        }

        return user.email[0].toUpperCase();
    };

    const getUserDisplayName = (): string => {
        if (!user) return '';
        return user.fullName || user.email;
    };

    return (
        <div className={`min-h-screen flex flex-col bg-gray-100 ${className}`}>
            <PNRRBanner />
            <header className="bg-white text-gray-800 shadow-md w-full">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-wrap items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link to={ROUTES.HOME} className="flex items-center">
                                <img src={logoImage} alt="Asura" className="h-10" />
                            </Link>
                        </div>

                        {showNavigation && isAuthenticated && (
                            <nav className="flex items-center">
                                <ul className="flex items-center space-x-1 md:space-x-4">
                                    <li className="relative">
                                        <Link
                                            to={ROUTES.DASHBOARD}
                                            className={`relative px-3 py-2 text-sm transition-all duration-300 inline-block ${
                                                location.pathname === ROUTES.DASHBOARD
                                                    ? 'font-semibold text-orange-600'
                                                    : 'text-gray-700 hover:text-orange-500'
                                            }`}
                                            style={{
                                                textShadow: location.pathname === ROUTES.DASHBOARD 
                                                    ? '0 0 8px rgba(249, 115, 22, 0.4)' 
                                                    : undefined
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.textShadow = '0 0 12px rgba(249, 115, 22, 0.5)'}
                                            onMouseLeave={(e) => {
                                                if (location.pathname !== ROUTES.DASHBOARD) {
                                                    e.currentTarget.style.textShadow = '';
                                                } else {
                                                    e.currentTarget.style.textShadow = '0 0 8px rgba(249, 115, 22, 0.4)';
                                                }
                                            }}
                                        >
                                            Pagina Principală
                                        </Link>
                                    </li>

                                    {isAuthenticated && hasAnyUserGroup([UserGroup.ADMIN]) && (
                                        <li className="relative">
                                            <Link
                                                to={ROUTES.ERP_VATS}
                                                className={`relative px-3 py-2 text-sm transition-all duration-300 inline-block ${
                                                    location.pathname === ROUTES.ERP_VATS
                                                    ? 'font-semibold text-orange-600'
                                                        : 'text-gray-700 hover:text-orange-500'
                                                }`}
                                                style={{
                                                    textShadow: location.pathname === ROUTES.ERP_VATS 
                                                        ? '0 0 8px rgba(249, 115, 22, 0.4)' 
                                                        : undefined
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.textShadow = '0 0 12px rgba(249, 115, 22, 0.5)'}
                                                onMouseLeave={(e) => {
                                                    if (location.pathname !== ROUTES.ERP_VATS) {
                                                        e.currentTarget.style.textShadow = '';
                                                    } else {
                                                        e.currentTarget.style.textShadow = '0 0 8px rgba(249, 115, 22, 0.4)';
                                                    }
                                                }}
                                            >
                                                {t('nav.vats')}
                                            </Link>
                                        </li>
                                    )}

                                    {isAuthenticated && hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]) && hasERP && (
                                        <li className="relative flex items-center">
                                            <button
                                                className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center ${
                                                    location.pathname.startsWith('/erp')
                                                        ? 'font-bold text-orange-500'
                                                        : 'text-gray-700 hover:text-orange-500 hover:font-semibold'
                                                }`}
                                                onClick={() => setErpDropdownOpen(!erpDropdownOpen)}
                                                onBlur={() => setTimeout(() => setErpDropdownOpen(false), 150)}
                                            >
                                                ERP
                                                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {erpDropdownOpen && (
                                                <div className="absolute left-0 top-full w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                                                    <Link
                                                        to={ROUTES.ERP_PROJECTS}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:text-orange-600 transition-all duration-200"
                                                        onClick={() => setErpDropdownOpen(false)}
                                                        onMouseEnter={(e) => e.currentTarget.style.textShadow = '0 0 10px rgba(249, 115, 22, 0.5)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.textShadow = ''}
                                                    >
                                                        Proiecte
                                                    </Link>
                                                    <Link
                                                        to={ROUTES.ERP_MEMBERSHIP_FEES}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:text-orange-600 transition-all duration-200"
                                                        onClick={() => setErpDropdownOpen(false)}
                                                        onMouseEnter={(e) => e.currentTarget.style.textShadow = '0 0 10px rgba(249, 115, 22, 0.5)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.textShadow = ''}
                                                    >
                                                        Cotizații Membri
                                                    </Link>
                                                    <Link
                                                        to={ROUTES.SONDAJE}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:text-orange-600 transition-all duration-200"
                                                        onClick={() => setErpDropdownOpen(false)}
                                                        onMouseEnter={(e) => e.currentTarget.style.textShadow = '0 0 10px rgba(249, 115, 22, 0.5)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.textShadow = ''}
                                                    >
                                                        Sondaje
                                                    </Link>
                                                </div>
                                            )}
                                        </li>
                                    )}

                                    {isAuthenticated && hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]) && hasCRM && (
                                        <li className="relative flex items-center">
                                            <button
                                                className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center ${
                                                    location.pathname.startsWith('/crm')
                                                        ? 'font-bold text-orange-500'
                                                        : 'text-gray-700 hover:text-orange-500 hover:font-semibold'
                                                }`}
                                                onClick={() => setCrmDropdownOpen(!crmDropdownOpen)}
                                                onBlur={() => setTimeout(() => setCrmDropdownOpen(false), 150)}
                                            >
                                                CRM
                                                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {crmDropdownOpen && (
                                                <div className="absolute left-0 top-full w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                                                    <Link
                                                        to={ROUTES.CRM_ORGANIZATION_DETAILS}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:text-orange-600 transition-all duration-200"
                                                        onClick={() => setCrmDropdownOpen(false)}
                                                        onMouseEnter={(e) => e.currentTarget.style.textShadow = '0 0 10px rgba(249, 115, 22, 0.5)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.textShadow = ''}
                                                    >
                                                        Organizația Mea
                                                    </Link>
                                                    <Link
                                                        to={ROUTES.CRM_ENTITIES}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:text-orange-600 transition-all duration-200"
                                                        onClick={() => setCrmDropdownOpen(false)}
                                                        onMouseEnter={(e) => e.currentTarget.style.textShadow = '0 0 10px rgba(249, 115, 22, 0.5)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.textShadow = ''}
                                                    >
                                                        Entități
                                                    </Link>
                                                    <Link
                                                        to={ROUTES.CRM_DONATIONS}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:text-orange-600 transition-all duration-200"
                                                        onClick={() => setCrmDropdownOpen(false)}
                                                        onMouseEnter={(e) => e.currentTarget.style.textShadow = '0 0 10px rgba(249, 115, 22, 0.5)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.textShadow = ''}
                                                    >
                                                        Donații
                                                    </Link>
                                                </div>
                                            )}
                                        </li>
                                    )}

                                    <li className="relative">
                                        <Link
                                            to={ROUTES.CALENDAR}
                                            className={`relative px-3 py-2 text-sm transition-all duration-300 inline-block ${
                                                location.pathname === ROUTES.CALENDAR
                                                    ? 'font-semibold text-orange-600'
                                                    : 'text-gray-700 hover:text-orange-500'
                                            }`}
                                            style={{
                                                textShadow: location.pathname === ROUTES.CALENDAR 
                                                    ? '0 0 8px rgba(249, 115, 22, 0.4)' 
                                                    : undefined
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.textShadow = '0 0 12px rgba(249, 115, 22, 0.5)'}
                                            onMouseLeave={(e) => {
                                                if (location.pathname !== ROUTES.CALENDAR) {
                                                    e.currentTarget.style.textShadow = '';
                                                } else {
                                                    e.currentTarget.style.textShadow = '0 0 8px rgba(249, 115, 22, 0.4)';
                                                }
                                            }}
                                        >
                                            Calendar
                                        </Link>
                                    </li>
                                </ul>
                            </nav>
                        )}

                        <div className="flex items-center gap-3">
                            {isAuthenticated ? (
                                <>
                                    <button
                                        onClick={() => navigate(hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]) ? ROUTES.CRM_COMMUNICATIONS : ROUTES.DASHBOARD)}
                                        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        title="Notificări mesaje"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                            />
                                        </svg>
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

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
                                                {user?.email && (
                                                    <div className="text-xs text-gray-500">@{user.email}</div>
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
                                                        Profil
                                                    </Link>
                                                    {isAuthenticated && (
                                                        <Link
                                                            to={ROUTES.SETTINGS}
                                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                            onClick={() => setDropdownOpen(false)}
                                                        >
                                                            Setări
                                                        </Link>
                                                    )}
                                                    <div className="border-t border-gray-100 my-1"></div>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                                                    >
                                                        Delogheaza-te
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <button
                                    onClick={() => login()}
                                    className="px-4 py-2 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                >
                                    Logheaza-te
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

            <footer className="bg-gray-300 py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-700">
                                PNRR. Finanțat de Uniunea Europeană – NextGenerationEU
                            </p>
                        </div>
                        
                        <div className="text-center text-xs text-gray-600 max-w-4xl mx-auto">
                            <p className="italic">
                                Conținutul acestui material nu reprezintă în mod obligatoriu poziția oficială a Uniunii Europene sau a Guvernului României
                            </p>
                        </div>

                        <div className="flex justify-center gap-6 text-xs">
                            <a
                                href="https://mfe.gov.ro/pnrr/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                PNRR România
                            </a>
                            <a
                                href="https://www.facebook.com/PNRROficial"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                PNRR Facebook
                            </a>
                        </div>

                        <div className="border-t border-gray-400 pt-3 mt-3">
                            <div className="text-center text-gray-600 text-sm">
                                © Asura 2025. Toate drepturile rezervate.
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default React.memo(Layout);
