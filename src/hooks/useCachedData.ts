import { useState, useEffect, useCallback } from 'react';
import { cacheInvalidation } from '@/utils/cacheInvalidation';

export function useCachedData<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    dependencies: any[] = []
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [...dependencies, refreshKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const unsubscribe = cacheInvalidation.subscribe(cacheKey, () => {
            setRefreshKey(prev => prev + 1);
        });

        return unsubscribe;
    }, [cacheKey]);

    const refetch = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return { data, loading, error, refetch };
}
