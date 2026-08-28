import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/hooks/useAuth';
import { realtimeService } from '@/services/realtime.service';

/** Query key fragments each server resource should refresh. */
const RESOURCE_QUERY_KEYS: Record<string, string[]> = {
    'projects': ['projects', 'user-projects-for-proposal', 'financialReport', 'progressReport'],
    'activities': ['activities', 'activity-proposals', 'project-activities-for-proposal', 'progressReport'],
    'project-expenses': ['project-expenses', 'financialReport'],
    'project-funds': ['project-funds', 'financialReport'],
    'communications': ['communications', 'communications-unread-count'],
    'membership-fees': ['membership-fees', 'fees'],
    'entities': ['entities'],
    'entity-donations': ['entity-donations', 'donations'],
};

/**
 * Refetches the affected queries when the server reports a change.
 * Polling stays in place, so losing the socket only makes updates slower, never wrong.
 */
export const useRealtimeInvalidation = (): void => {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isAuthenticated) return;

        const unsubscribe = realtimeService.subscribe((resources) => {
            const fragments = resources.flatMap(resource => RESOURCE_QUERY_KEYS[resource] || [resource]);
            if (!fragments.length) return;

            queryClient.invalidateQueries({
                predicate: query => query.queryKey.some(
                    part => typeof part === 'string' && fragments.some(fragment => part.includes(fragment))
                )
            });
        });

        realtimeService.connect();

        return () => {
            unsubscribe();
            realtimeService.disconnect();
        };
    }, [isAuthenticated, queryClient]);
};
