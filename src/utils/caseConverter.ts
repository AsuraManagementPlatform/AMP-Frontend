export function toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function convertKeysToSnakeCase(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertKeysToSnakeCase(item));
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = toSnakeCase(key);
            acc[snakeKey] = convertKeysToSnakeCase(obj[key]);
            return acc;
        }, {} as any);
    }

    return obj;
}

export function convertKeysToCamelCase(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertKeysToCamelCase(item));
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = toCamelCase(key);
            acc[camelKey] = convertKeysToCamelCase(obj[key]);
            return acc;
        }, {} as any);
    }

    return obj;
}