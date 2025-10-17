type CacheInvalidationListener = () => void;

class CacheInvalidationManager {
    private listeners: Map<string, Set<CacheInvalidationListener>> = new Map();

    subscribe(key: string, listener: CacheInvalidationListener) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key)!.add(listener);

        return () => {
            const listeners = this.listeners.get(key);
            if (listeners) {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    this.listeners.delete(key);
                }
            }
        };
    }

    invalidate(key: string) {
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(listener => listener());
        }
    }

    invalidateAll() {
        this.listeners.forEach(listeners => {
            listeners.forEach(listener => listener());
        });
    }
}

export const cacheInvalidation = new CacheInvalidationManager();

export const CACHE_KEYS = {
    ORGANIZATION_MODULES: 'organization_modules',
    ORGANIZATIONS: 'organizations',
    USERS: 'users',
    PROJECTS: 'projects',
    ACTIVITIES: 'activities',
    ENTITIES: 'entities',
} as const;
