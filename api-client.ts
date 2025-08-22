/**
 * Secure API Client
 * This replaces direct Supabase calls with secure API proxy calls
 */

import { SecurityUtils } from './security-utils';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token management
class TokenManager {
    private static TOKEN_KEY = 'coinpass_auth_token';
    
    static setToken(token: string): void {
        // Store in memory for maximum security
        sessionStorage.setItem(this.TOKEN_KEY, token);
    }
    
    static getToken(): string | null {
        return sessionStorage.getItem(this.TOKEN_KEY);
    }
    
    static clearToken(): void {
        sessionStorage.removeItem(this.TOKEN_KEY);
    }
    
    static isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return Date.now() >= payload.exp * 1000;
        } catch {
            return true;
        }
    }
}

// API Error class
export class APIError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = 'APIError';
    }
}

// Main API Client
export class APIClient {
    private static instance: APIClient;
    
    private constructor() {}
    
    static getInstance(): APIClient {
        if (!this.instance) {
            this.instance = new APIClient();
        }
        return this.instance;
    }
    
    // Generic request method with authentication
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = TokenManager.getToken();
        
        // Check token expiration
        if (token && TokenManager.isTokenExpired(token)) {
            TokenManager.clearToken();
            throw new APIError('Session expired', 401, 'TOKEN_EXPIRED');
        }
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };
        
        // Add auth header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
                credentials: 'include', // Include cookies for additional security
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new APIError(
                    data.error || 'Request failed',
                    response.status,
                    data.code
                );
            }
            
            return data;
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError('Network error', 0, 'NETWORK_ERROR');
        }
    }
    
    // ============= Authentication Methods =============
    
    async login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            role: string;
            isAdmin: boolean;
        };
    }> {
        // Rate limiting check
        if (!SecurityUtils.checkRateLimit('login', 5, 15 * 60 * 1000)) {
            throw new APIError('Too many login attempts', 429, 'RATE_LIMIT');
        }
        
        const response = await this.request<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        // Store token securely
        if (response.token) {
            TokenManager.setToken(response.token);
        }
        
        return response;
    }
    
    async logout(): Promise<void> {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            TokenManager.clearToken();
        }
    }
    
    async verifySession(): Promise<boolean> {
        try {
            const response = await this.request<{ valid: boolean }>('/auth/verify');
            return response.valid;
        } catch (error) {
            if (error instanceof APIError && error.statusCode === 401) {
                TokenManager.clearToken();
                return false;
            }
            throw error;
        }
    }
    
    // ============= Public Data Methods =============
    
    async getExchanges(): Promise<any[]> {
        const { data } = await this.request<{ data: any[] }>('/exchanges');
        return data;
    }
    
    async getFAQs(): Promise<any[]> {
        const { data } = await this.request<{ data: any[] }>('/faqs');
        return data;
    }
    
    async getSiteData(section: 'hero' | 'about' | 'popup' | 'benefits'): Promise<any> {
        const { data } = await this.request<{ data: any }>(`/site-data/${section}`);
        return data;
    }
    
    async getArticles(options?: {
        category?: string;
        pinned?: boolean;
        limit?: number;
    }): Promise<any[]> {
        const params = new URLSearchParams();
        if (options?.category) params.append('category', options.category);
        if (options?.pinned !== undefined) params.append('pinned', String(options.pinned));
        if (options?.limit) params.append('limit', String(options.limit));
        
        const queryString = params.toString();
        const endpoint = `/articles${queryString ? `?${queryString}` : ''}`;
        
        const { data } = await this.request<{ data: any[] }>(endpoint);
        return data;
    }
    
    // ============= Admin Methods =============
    
    async createExchange(exchangeData: any): Promise<any> {
        const { data } = await this.request<{ data: any }>('/admin/exchanges', {
            method: 'POST',
            body: JSON.stringify(exchangeData),
        });
        return data;
    }
    
    async updateExchange(id: number, exchangeData: any): Promise<any> {
        const { data } = await this.request<{ data: any }>('/admin/exchanges', {
            method: 'POST',
            body: JSON.stringify({ ...exchangeData, id }),
        });
        return data;
    }
    
    async deleteExchange(id: number): Promise<void> {
        await this.request(`/admin/exchanges/${id}`, {
            method: 'DELETE',
        });
    }
    
    async updateSiteData(section: string, data: any): Promise<any> {
        const response = await this.request<{ data: any }>('/admin/site-data', {
            method: 'POST',
            body: JSON.stringify({ section, data }),
        });
        return response.data;
    }
    
    async getAdminLogs(): Promise<any[]> {
        const { data } = await this.request<{ data: any[] }>('/admin/logs');
        return data;
    }
    
    // ============= Utility Methods =============
    
    isAuthenticated(): boolean {
        const token = TokenManager.getToken();
        return !!(token && !TokenManager.isTokenExpired(token));
    }
    
    getCurrentUser(): any | null {
        const token = TokenManager.getToken();
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.id,
                email: payload.email,
                role: payload.role,
                isAdmin: payload.role === 'admin',
            };
        } catch {
            return null;
        }
    }
}

// Export singleton instance
export const apiClient = APIClient.getInstance();

// Export types
export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        role: string;
        isAdmin: boolean;
    };
}

export interface Exchange {
    id?: number;
    name_ko: string;
    name_en: string;
    link: string;
    description?: string;
    benefits?: string;
    logo_url?: string;
    is_active?: boolean;
}

export interface FAQ {
    id?: number;
    question: string;
    answer: string;
    order_index?: number;
}

export interface SiteData {
    section: string;
    data: any;
    updated_at?: string;
}