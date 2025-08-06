// Supabase 클라이언트 - 최적화된 버전
// 필요한 기능만 import하여 번들 크기 감소

import type { SupabaseClient } from '@supabase/supabase-js'

// 환경변수에서 Supabase 설정 로드
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 입력 검증
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing');
}

// Supabase 클라이언트를 lazy load
let supabaseInstance: SupabaseClient | null = null;

export async function getSupabase(): Promise<SupabaseClient> {
    if (!supabaseInstance) {
        // Dynamic import로 필요할 때만 로드
        const { createClient } = await import('@supabase/supabase-js');
        
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                storageKey: 'coinpass-admin-auth',
                storage: window.sessionStorage,
            },
            db: {
                schema: 'public'
            },
            global: {
                headers: {
                    'X-Client-Info': 'coinpass-web@1.0.0'
                }
            },
            realtime: {
                params: {
                    eventsPerSecond: 2
                }
            }
        });
    }
    
    return supabaseInstance;
}

// 경량화된 데이터베이스 유틸리티
export class DatabaseUtilsLite {
    // 기본 쿼리 캐시
    private static queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
    
    // 데이터 조회 (캐싱 포함)
    static async select(
        table: string,
        columns: string = '*',
        filter?: Record<string, any>,
        options?: {
            orderBy?: { column: string; ascending?: boolean };
            limit?: number;
            cache?: boolean;
            cacheTTL?: number;
        }
    ) {
        const cacheKey = `${table}-${columns}-${JSON.stringify(filter)}-${JSON.stringify(options)}`;
        
        // 캐시 확인
        if (options?.cache !== false) {
            const cached = this.getFromCache(cacheKey);
            if (cached) return { data: cached, error: null };
        }
        
        const supabase = await getSupabase();
        let query = supabase.from(table).select(columns);
        
        // 필터 적용
        if (filter) {
            Object.entries(filter).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        // 정렬
        if (options?.orderBy) {
            query = query.order(options.orderBy.column, { 
                ascending: options.orderBy.ascending ?? true 
            });
        }
        
        // 제한
        if (options?.limit) {
            query = query.limit(options.limit);
        }
        
        const result = await query;
        
        // 성공 시 캐싱
        if (!result.error && result.data && options?.cache !== false) {
            this.setCache(cacheKey, result.data, options?.cacheTTL || 5 * 60 * 1000);
        }
        
        return result;
    }
    
    // 단일 항목 조회
    static async selectSingle(
        table: string,
        columns: string = '*',
        filter: Record<string, any>
    ) {
        const result = await this.select(table, columns, filter, { limit: 1 });
        
        if (result.error) return { data: null, error: result.error };
        if (!result.data || result.data.length === 0) {
            return { data: null, error: new Error('No data found') };
        }
        
        return { data: result.data[0], error: null };
    }
    
    // 데이터 삽입
    static async insert(table: string, data: any) {
        const supabase = await getSupabase();
        const result = await supabase.from(table).insert(data).select();
        
        // 캐시 무효화
        this.invalidateCache(table);
        
        return result;
    }
    
    // 데이터 업데이트
    static async update(table: string, id: number | string, data: any) {
        const supabase = await getSupabase();
        const result = await supabase.from(table).update(data).eq('id', id);
        
        // 캐시 무효화
        this.invalidateCache(table);
        
        return result;
    }
    
    // 데이터 삭제
    static async delete(table: string, id: number | string) {
        const supabase = await getSupabase();
        const result = await supabase.from(table).delete().eq('id', id);
        
        // 캐시 무효화
        this.invalidateCache(table);
        
        return result;
    }
    
    // 연결 상태 확인
    static async checkConnection(): Promise<boolean> {
        try {
            const result = await this.select('page_contents', 'id', {}, { 
                limit: 1, 
                cache: false 
            });
            return !result.error;
        } catch {
            return false;
        }
    }
    
    // 캐시 관리
    private static getFromCache(key: string): any | null {
        const cached = this.queryCache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.data;
        }
        this.queryCache.delete(key);
        return null;
    }
    
    private static setCache(key: string, data: any, ttl: number): void {
        this.queryCache.set(key, { data, timestamp: Date.now(), ttl });
        
        // 캐시 크기 제한 (50개)
        if (this.queryCache.size > 50) {
            const firstKey = this.queryCache.keys().next().value;
            if (firstKey) {
                this.queryCache.delete(firstKey);
            }
        }
    }
    
    private static invalidateCache(table: string): void {
        // 해당 테이블과 관련된 모든 캐시 삭제
        for (const key of this.queryCache.keys()) {
            if (key.startsWith(table)) {
                this.queryCache.delete(key);
            }
        }
    }
    
    static clearCache(): void {
        this.queryCache.clear();
    }
}

// Auth 헬퍼 함수들 (필요한 것만 export)
export async function signIn(email: string, password: string) {
    const supabase = await getSupabase();
    return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
    const supabase = await getSupabase();
    return supabase.auth.signOut();
}

export async function getSession() {
    const supabase = await getSupabase();
    return supabase.auth.getSession();
}

export async function getUser() {
    const supabase = await getSupabase();
    return supabase.auth.getUser();
}

export async function refreshSession() {
    const supabase = await getSupabase();
    return supabase.auth.refreshSession();
}

// 기존 코드와의 호환성을 위한 export
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return async (...args: any[]) => {
            const instance = await getSupabase();
            return (instance as any)[prop](...args);
        };
    }
});

export const DatabaseUtils = DatabaseUtilsLite;