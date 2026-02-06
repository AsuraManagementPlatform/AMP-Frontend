import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants.utils';

export const NotFoundPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="mb-8">
                    <svg
                        className="mx-auto h-24 w-24 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    {t('label.not_found.title')}
                </h2>
                
                <p className="text-gray-500 mb-8">
                    {t('label.not_found.description')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        variant="primary"
                        onClick={() => navigate(ROUTES.DASHBOARD)}
                    >
                        {t('label.not_found.go_home')}
                    </Button>
                    
                    <Button
                        variant="outline"
                        onClick={() => navigate(-1)}
                    >
                        {t('label.not_found.go_back')}
                    </Button>
                </div>
            </div>
        </div>
    );
};
