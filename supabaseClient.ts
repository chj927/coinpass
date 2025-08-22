/**
 * SECURITY NOTICE: Direct Supabase client has been deprecated for security reasons.
 * 
 * Please use the secure API client instead:
 * import { apiClient } from './api-client';
 * 
 * All database operations should go through the API proxy server
 * to prevent API key exposure and ensure proper authentication.
 */

// Temporary compatibility layer - will be removed
export const supabase = null as any;

// Export a warning for any attempts to use the old client
export class DatabaseUtils {
    static async checkConnection(): Promise<boolean> {
        console.warn('Direct Supabase connection deprecated. Use apiClient instead.');
        return true; // Always return true to prevent breaking existing code
    }
    
    static async getPaginatedData(): Promise<any> {
        console.error('Direct database access is no longer allowed. Use apiClient instead.');
        throw new Error('Security: Direct database access disabled. Use API client.');
    }
    
    static async getCachedQuery(): Promise<any> {
        console.error('Direct database access is no longer allowed. Use apiClient instead.');
        throw new Error('Security: Direct database access disabled. Use API client.');
    }
    
    static async batchInsert(): Promise<any> {
        console.error('Direct database access is no longer allowed. Use apiClient instead.');
        throw new Error('Security: Direct database access disabled. Use API client.');
    }
}

// Migration helper message
if (typeof window !== 'undefined' && window.console) {
    console.warn(
        '%c⚠️ SECURITY UPDATE',
        'color: red; font-size: 16px; font-weight: bold;',
        '\n\nDirect Supabase client has been disabled for security.\n' +
        'Please update your code to use the secure API client:\n\n' +
        'import { apiClient } from \'./api-client\';\n\n' +
        'For more information, see the migration guide.'
    );
}