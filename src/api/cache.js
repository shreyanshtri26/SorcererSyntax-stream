/**
 * Simple in-memory cache for API requests.
 */

const cache = new Map();
const DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const apiCache = {
    /**
     * Get data from cache
     * @param {string} key - Unique cache key
     * @returns {any|null} - Cached data or null if not found/expired
     */
    get: (key) => {
        if (!cache.has(key)) return null;
        const { data, timestamp, expiry } = cache.get(key);
        if (Date.now() - timestamp > expiry) {
            cache.delete(key);
            return null;
        }
        return data;
    },

    /**
     * Set data in cache
     * @param {string} key - Unique cache key
     * @param {any} data - Data to store
     * @param {number} expiry - Expiry time in ms (default 5 mins)
     */
    set: (key, data, expiry = DEFAULT_EXPIRY) => {
        if (data) {
            cache.set(key, {
                data,
                timestamp: Date.now(),
                expiry
            });
        }
    },

    /**
     * Clear the entire cache
     */
    clear: () => {
        cache.clear();
    },

    /**
     * Remove a specific key
     */
    remove: (key) => {
        cache.delete(key);
    }
};
