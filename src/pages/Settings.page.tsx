import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/utils/constants.utils';

export const SettingsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-4">
                <button
                    onClick={() => navigate(ROUTES.DASHBOARD)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Înapoi la pagina principală
                </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">Setări</h1>

            <Card title="Setări Generale" className="mb-6">
                <div className="space-y-4">
                    <div className="text-gray-600">
                        <p className="mb-4">Aici vor apărea setările aplicației:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Limba aplicației (Română/Engleză)</li>
                            <li>Preferințe notificări email</li>
                            <li>Notificări în aplicație</li>
                            <li>Temă (Light/Dark)</li>
                        </ul>
                    </div>
                </div>
            </Card>

            <Card title="Setări Calendar" className="mb-6">
                <div className="space-y-4">
                    <div className="text-gray-600">
                        <p className="mb-4">Preferințe pentru calendar:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Ziua de start săptămână (Luni/Duminică)</li>
                            <li>Program de lucru (8:00 - 17:00)</li>
                            <li>Reminder-uri (15 min/30 min/1h înainte)</li>
                        </ul>
                    </div>
                </div>
            </Card>

            <Card title="Securitate" className="mb-6">
                <div className="space-y-4">
                    <div className="text-gray-600">
                        <p className="mb-4">Opțiuni de securitate:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Schimbare parolă (Keycloak)</li>
                            <li>Sesiuni active</li>
                            <li>Autentificare cu doi factori (2FA)</li>
                        </ul>
                    </div>
                </div>
            </Card>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                    <strong>Notă:</strong> Setările vor fi implementate în versiunile viitoare ale aplicației.
                </p>
            </div>
        </div>
    );
};

export default SettingsPage;
