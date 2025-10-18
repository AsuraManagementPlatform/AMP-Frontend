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
                const response = await organizationService.getById(user.organizationId);
                const organization = (response as any).organization || response;
                setActiveModules(organization.activeModules || []);
            } catch (error) {
                console.error('❌ [useOrganizationModules] Error fetching organization modules:', error);
                setActiveModules([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizationModules();

        const pollInterval = setInterval(fetchOrganizationModules, 30000);

        return () => clearInterval(pollInterval);
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
