/**
 * Centralized fetch helper for cookie-based authentication
 * Automatically includes credentials (cookies) in all requests
 */

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: 'include', // Always send cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use fetchWithAuth instead
 */
export function getAuthHeaders() {
    console.warn('getAuthHeaders is deprecated. Cookies are sent automatically.');
    return {};
}
