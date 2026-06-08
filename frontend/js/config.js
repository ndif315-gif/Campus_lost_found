/**
 * Frontend Configuration
 * Centralized API configuration for all frontend requests
 */

// Get the backend URL based on environment
// For development: Backend on port 5000, Frontend on port 5500
// This ensures proper CORS communication between frontend and backend

const getBackendURL = () => {
    // Check if running in development or production
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const isLocalhost = !hostname || hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocalhost) {
        // Development environment or local file preview
        return 'http://localhost:5000';
    } else {
        // Production environment - use same protocol and domain as frontend
        // This works for Render, Vercel, Netlify, etc. where frontend and backend are on same domain
        return `${protocol}//${hostname}`;
    }
};

const Config = {
    // API Base URL
    API_URL: getBackendURL() + '/api',

    // Backend server configuration
    BACKEND: {
        HOST: 'localhost',
        PORT: 5000,
        PROTOCOL: 'http'
    },

    // Frontend server configuration
    FRONTEND: {
        HOST: 'localhost',
        PORT: 5500,
        PROTOCOL: 'http'
    },

    // Application settings
    APP: {
        NAME: 'Campus Lost & Found',
        VERSION: '1.0.0',
        DESCRIPTION: 'Find your lost items and return found items'
    },

    // Storage keys
    STORAGE_KEYS: {
        TOKEN: 'token',
        USER: 'user',
        LANGUAGE: 'language'
    },

    // Request configuration
    REQUEST_CONFIG: {
        TIMEOUT: 5000,
        RETRY_ATTEMPTS: 3
    },

    // API Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            VERIFY: '/auth/verify'
        },
        LOST: {
            GET_ALL: '/lost',
            GET_ONE: '/lost/:id',
            CREATE: '/lost',
            UPDATE: '/lost/:id',
            DELETE: '/lost/:id'
        },
        FOUND: {
            GET_ALL: '/found',
            GET_ONE: '/found/:id',
            CREATE: '/found',
            UPDATE: '/found/:id',
            DELETE: '/found/:id'
        },
        MATCH: {
            GET_MATCHES: '/match',
            CREATE_MATCH: '/match'
        },
        NOTIFICATION: {
            GET_ALL: '/notifications',
            MARK_READ: '/notifications/:id/read'
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}
