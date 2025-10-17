import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { organizationService } from '@/services/organization.service';
import { cacheInvalidation, CACHE_KEYS } from '@/utils/cacheInvalidation';

export const useOrganizationModules = () => {
    const { user } = useAuth();
    const [activeModules, setActiveModules] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchOrganizationModules = async () => {
            if (!user?.organizationId) {
                setActiveModules([]);
                setLoading(false);
                return;
            }

            try {
                const organization = await organizationService.getById(user.organizationId);
                setActiveModules(organization.active_modules || []);
            } catch (error) {
                console.error('Error fetching organization modules:', error);
                setActiveModules([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizationModules();
    }, [user?.organizationId, refreshKey]);

    useEffect(() => {
        const unsubscribe = cacheInvalidation.subscribe(
            CACHE_KEYS.ORGANIZATION_MODULES,
            () => setRefreshKey(prev => prev + 1)
        );

        return unsubscribe;
    }, []);

    return {
        activeModules,
        hasERP: activeModules.includes('ERP'),
        hasCRM: activeModules.includes('CRM'),
        loading
    };
};
