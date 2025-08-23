/**
 * API Client for Supabase
 * Direct Supabase calls with correct table names
 */

import { SecurityUtils } from './security-utils';
// supabaseClient에서 이미 생성된 클라이언트 재사용
import { supabase } from './supabaseClient';

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
    
    // Helper method to handle Supabase errors
    private handleError(error: any): void {
        console.error('Supabase error:', error);
        if (error.code === '42P01') {
            throw new APIError('Table not found', 404, error.code);
        }
        throw new APIError(error.message || 'Database error', 500, error.code);
    }
    
    // ============= Authentication Methods =============
    
    async login(email: string, password: string): Promise<{
        user: any;
        session: any;
    }> {
        // Rate limiting check
        if (!SecurityUtils.checkRateLimit('login', 5, 15 * 60 * 1000)) {
            throw new APIError('Too many login attempts', 429, 'RATE_LIMIT');
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            this.handleError(error);
        }
        
        // Log to login_logs table
        if (data?.user) {
            try {
                await supabase.from('login_logs').insert({
                    user_id: data.user.id,
                    success: true,
                    ip_address: null,
                    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
                    timestamp: new Date().toISOString()
                });
            } catch (logError) {
                console.warn('Failed to log login attempt:', logError);
                // 로그 실패해도 로그인은 계속 진행
            }
        }
        
        return data as any;
    }
    
    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
        }
        TokenManager.clearToken();
    }
    
    async verifySession(): Promise<boolean> {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    }
    
    // ============= Public Data Methods =============
    
    async getExchanges(): Promise<any[]> {
        const { data, error } = await supabase
            .from('exchange_exchanges')
            .select('*')
            .order('name_ko', { ascending: true });
        
        if (error) {
            this.handleError(error);
        }
        
        return data || [];
    }
    
    async getFAQs(): Promise<any[]> {
        const { data, error } = await supabase
            .from('exchange_faqs')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) {
            this.handleError(error);
        }
        
        return data || [];
    }
    
    async getSiteData(section: 'hero' | 'about' | 'popup' | 'benefits'): Promise<any> {
        // page_contents 테이블에서 데이터 가져오기
        const { data, error } = await supabase
            .from('page_contents')
            .select('*')
            .eq('page_type', section === 'hero' ? 'main' : section)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
            console.error('Error fetching site data:', error);
        }
        
        // 데이터 구조 변환
        if (data) {
            return {
                data: {
                    title: data.content?.title || '',
                    subtitle: data.content?.subtitle || '',
                    content: data.content || {},
                    enabled: data.is_active || false,
                    type: data.content_type || 'text'
                }
            };
        }
        
        return { data: null };
    }
    
    async getArticles(options?: {
        category?: string;
        pinned?: boolean;
        limit?: number;
    }): Promise<any[]> {
        let query = supabase.from('articles').select('*');
        
        if (options?.category) {
            query = query.eq('category', options.category);
        }
        if (options?.pinned !== undefined) {
            query = query.eq('is_pinned', options.pinned);
        }
        if (options?.limit) {
            query = query.limit(options.limit);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
            this.handleError(error);
        }
        
        return data || [];
    }
    
    // ============= Admin Methods =============
    
    async createExchange(exchangeData: any): Promise<any> {
        const { data, error } = await supabase
            .from('exchange_exchanges')
            .insert(exchangeData)
            .select()
            .single();
        
        if (error) {
            this.handleError(error);
        }
        
        return data;
    }
    
    async updateExchange(id: number, exchangeData: any): Promise<any> {
        const { data, error } = await supabase
            .from('exchange_exchanges')
            .update(exchangeData)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            this.handleError(error);
        }
        
        return data;
    }
    
    async deleteExchange(id: number): Promise<void> {
        const { error } = await supabase
            .from('exchange_exchanges')
            .delete()
            .eq('id', id);
        
        if (error) {
            this.handleError(error);
        }
    }
    
    async updateSiteData(section: string, data: any): Promise<any> {
        const { data: result, error } = await supabase
            .from('page_contents')
            .upsert({
                page_type: section === 'hero' ? 'main' : section,
                content: data,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) {
            this.handleError(error);
        }
        
        return result;
    }
    
    async getAdminLogs(): Promise<any[]> {
        const { data, error } = await supabase
            .from('login_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);
        
        if (error) {
            this.handleError(error);
        }
        
        return data || [];
    }
    
    // ============= Utility Methods =============
    
    isAuthenticated(): boolean {
        const token = TokenManager.getToken();
        return !!(token && !TokenManager.isTokenExpired(token));
    }
    
    async getCurrentUser(): Promise<any | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        // Check if admin
        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', user.id)
            .single();
        
        return {
            id: user.id,
            email: user.email,
            role: adminUser?.role || 'user',
            isAdmin: adminUser?.role === 'admin'
        };
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
    logoimageurl?: string;
    benefit1_tag_ko: string;
    benefit1_value_ko: string;
    benefit2_tag_ko: string;
    benefit2_value_ko: string;
    benefit3_tag_ko: string;
    benefit3_value_ko: string;
    benefit4_tag_ko: string;
    benefit4_value_ko: string;
    link: string;
    created_at?: string;
    updated_at?: string;
}

export interface FAQ {
    id?: number;
    question_ko: string;
    answer_ko: string;
    created_at?: string;
    updated_at?: string;
}

export interface SiteData {
    section: string;
    data: any;
    updated_at?: string;
}