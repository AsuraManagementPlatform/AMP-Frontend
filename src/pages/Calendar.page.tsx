import React from 'react';
import Layout from '@/components/layout/Layout';
import Calendar from '@/components/calendar/Calendar';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { UserGroup } from '@/types/index.types';

const CalendarPage: React.FC = () => {
    const { hasAnyUserGroup } = useAuth();
    const isAdmin = hasAnyUserGroup([UserGroup.ADMIN]);
    const isOrgAdmin = hasAnyUserGroup([UserGroup.ORGANIZATION_ADMIN]);

    return (
        <Layout showNavigation={true}>
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Calendar</h1>
                    <p className="text-gray-600">
                        {isAdmin 
                            ? "Gestionează evenimente și întâlniri pentru toate organizațiile"
                            : isOrgAdmin 
                                ? "Planifică și organizează întâlniri și evenimente pentru organizația ta"
                                : "Vezi evenimente și întâlniri programate"
                        }
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <Card title="Calendar organizațional" className="h-full">
                            <Calendar />
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card title="Acțiuni rapide">
                            <div className="space-y-3">
                                {(isAdmin || isOrgAdmin) && (
                                    <>
                                        <button 
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                                            onClick={() => {}}
                                        >
                                            ➕ Creează întâlnire
                                        </button>
                                        <button 
                                            className="w-full bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                                            onClick={() => {}}
                                        >
                                            🗳️ Programează votare
                                        </button>
                                        <button 
                                            className="w-full bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 transition-colors"
                                            onClick={() => {}}
                                        >
                                            📅 Creează eveniment
                                        </button>
                                    </>
                                )}
                                <button 
                                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                                    onClick={() => {}}
                                >
                                    📄 Exportă calendar
                                </button>
                            </div>
                        </Card>

                        <Card title="Evenimente următoare">
                            <div className="space-y-3">
                                <div className="border-l-4 border-green-500 pl-3 py-2">
                                    <div className="font-medium text-sm">Ședință echipă</div>
                                    <div className="text-xs text-gray-500">30 Sep, 10:00</div>
                                    <div className="text-xs text-green-600">Întâlnire</div>
                                </div>
                                
                                <div className="border-l-4 border-blue-500 pl-3 py-2">
                                    <div className="font-medium text-sm">Votare buget 2025</div>
                                    <div className="text-xs text-gray-500">5 Oct, 14:00</div>
                                    <div className="text-xs text-blue-600">Votare</div>
                                </div>
                                
                                <div className="border-l-4 border-orange-500 pl-3 py-2">
                                    <div className="font-medium text-sm">Eveniment fundraising</div>
                                    <div className="text-xs text-gray-500">12 Oct, 18:00</div>
                                    <div className="text-xs text-orange-600">Eveniment</div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Statistici calendar">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Întâlniri luna aceasta:</span>
                                    <span className="font-medium">8</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Votări programate:</span>
                                    <span className="font-medium">3</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Evenimente:</span>
                                    <span className="font-medium">5</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CalendarPage;