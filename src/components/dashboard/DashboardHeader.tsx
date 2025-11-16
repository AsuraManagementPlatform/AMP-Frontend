import React from 'react';

interface DashboardHeaderProps {
    userName: string;
    actionButton?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName, actionButton }) => (
    <div className="mb-8">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold mb-2">Bine ai revenit, {userName}!</h1>
                <p className="text-gray-600">Iată ce se întâmplă cu proiectele și activitățile tale.</p>
            </div>
            {actionButton && (
                <div className="ml-4">
                    {actionButton}
                </div>
            )}
        </div>
    </div>
);