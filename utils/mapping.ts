/**
 * Utility to convert between snake_case (DB) and camelCase (React/JS)
 */

export const toCamel = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => toCamel(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [key.replace(/([-_][a-z])/g, group =>
                    group.toUpperCase().replace('-', '').replace('_', '')
                )]: toCamel(obj[key]),
            }),
            {}
        );
    }
    return obj;
};

export const toSnake = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => toSnake(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)]: toSnake(obj[key]),
            }),
            {}
        );
    }
    return obj;
};
