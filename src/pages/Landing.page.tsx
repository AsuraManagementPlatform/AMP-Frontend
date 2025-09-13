import React from "react";
import Layout from "@/components/layout/Layout.tsx";
import {Card} from "@/components/ui/Card.tsx";

const LandingPage: React.FC = () => {
    return (
        <Layout showNavigation={false}>
            <div className="text-center py-16">

                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                    Împreună aducem schimbarea!
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 mb-12 italic">
                    "Drumul unei societăți mature este dat de oameni cu principii solide."
                </p>

                <Card className="border-2 border-orange-200 bg-orange-50 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Bine ai venit pe Platforma Asura!
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        AsuraPlatform ajută organizațiile să își gestioneze structura, proiectele și activitățile eficient.
                        Te rugăm să te autentifici pentru a accesa panoul tău personalizat.
                    </p>
                    <div className="mt-4 p-4 bg-orange-100 rounded-md border border-orange-200 text-gray-700">
                        <p className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Autentifică-te pentru a accesa mai multe informații și funcționalități
                        </p>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <Card className="opacity-75" title="Proiecte active">
                        <p className="text-gray-400">Autentifică-te pentru a vedea proiectele tale</p>
                    </Card>

                    <Card className="opacity-75" title="Activități recente">
                        <p className="text-gray-400">Autentifică-te pentru a vedea activitățile</p>
                    </Card>

                    <Card className="opacity-75" title="Statistici">
                        <p className="text-gray-400">Autentifică-te pentru a vedea statisticile</p>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default LandingPage;