import React from 'react';

interface DashboardHeaderProps {
    userName: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => (
    <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bine ai revenit, {userName}!</h1>
        <p className="text-gray-600">Iată ce se întâmplă cu proiectele și activitățile tale.</p>
    </div>
);