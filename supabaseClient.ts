import { createClient } from '@supabase/supabase-js'

// 환경변수에서 Supabase 설정 로드 (보안 강화)
// Vite 환경변수 타입 선언
interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
}

declare global {
    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 입력 검증 추가
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // 보안 강화를 위해 세션 지속성 비활성화
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
            eventsPerSecond: 2 // 실시간 업데이트 제한
        }
    }
})

// 데이터베이스 쿼리 최적화 유틸리티
export class DatabaseUtils {
    // 효율적인 페이지네이션
    static async getPaginatedData(
        table: string, 
        page: number = 1, 
        limit: number = 10,
        columns: string = '*',
        orderBy?: { column: string; ascending?: boolean }
    ) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        
        let query = supabase
            .from(table)
            .select(columns, { count: 'exact' })
            .range(from, to);
            
        if (orderBy) {
            query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
        }
        
        return query;
    }
    
    // 캐시된 데이터 가져오기
    private static queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
    
    static async getCachedQuery(
        cacheKey: string,
        queryFn: () => Promise<any>,
        ttl: number = 5 * 60 * 1000 // 5분 기본 TTL
    ) {
        const cached = this.queryCache.get(cacheKey);
        const now = Date.now();
        
        if (cached && now - cached.timestamp < cached.ttl) {
            return cached.data;
        }
        
        try {
            const result = await queryFn();
            this.queryCache.set(cacheKey, {
                data: result,
                timestamp: now,
                ttl
            });
            return result;
        } catch (error) {
            // 캐시된 데이터가 있으면 반환 (Stale-while-revalidate 패턴)
            if (cached) {
                return cached.data;
            }
            throw error;
        }
    }
    
    // 배치 작업 최적화
    static async batchInsert(table: string, data: any[], batchSize: number = 100) {
        const results = [];
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const result = await supabase.from(table).insert(batch);
            results.push(result);
        }
        return results;
    }
    
    // 연결 상태 확인
    static async checkConnection(): Promise<boolean> {
        try {
            // page_contents 테이블로 변경 (single_pages 테이블이 없을 수 있음)
            const { error } = await supabase.from('page_contents').select('id').limit(1);
            return !error;
        } catch {
            return false;
        }
    }
}