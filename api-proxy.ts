/**
 * API 프록시 서비스
 * Supabase API 키를 클라이언트에서 숨기고 서버 프록시를 통해 안전하게 처리
 */

interface ProxyConfig {
    baseUrl: string;
    timeout?: number;
    retryAttempts?: number;
}

export class APIProxy {
    private static instance: APIProxy;
    private config: ProxyConfig;
    private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

    private constructor() {
        this.config = {
            baseUrl: import.meta.env.VITE_API_PROXY_URL || '/api/proxy',
            timeout: 30000,
            retryAttempts: 3
        };
    }

    static getInstance(): APIProxy {
        if (!APIProxy.instance) {
            APIProxy.instance = new APIProxy();
        }
        return APIProxy.instance;
    }

    /**
     * 프록시를 통한 안전한 API 요청
     * @param endpoint API 엔드포인트
     * @param options 요청 옵션
     * @returns API 응답
     */
    async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T | null; error: Error | null }> {
        // 캐시 확인
        const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return { data: cached, error: null };
        }

        let lastError: Error | null = null;

        for (let attempt = 0; attempt < this.config.retryAttempts!; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout!);

                const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
                    ...options,
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Request-ID': this.generateRequestId(),
                        'X-Client-Version': '1.0.0',
                        ...options.headers
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                
                // 성공 시 캐싱
                if (options.method === 'GET' || !options.method) {
                    this.setCache(cacheKey, data, 5 * 60 * 1000); // 5분 캐시
                }

                return { data, error: null };
            } catch (error) {
                lastError = error as Error;
                
                if (error instanceof Error && error.name === 'AbortError') {
                    lastError = new Error('Request timeout');
                }

                // 재시도 가능한 에러인지 확인
                if (!this.isRetriableError(lastError) || attempt === this.config.retryAttempts! - 1) {
                    break;
                }

                // 지수 백오프로 재시도
                await this.sleep(Math.pow(2, attempt) * 1000);
            }
        }

        return { data: null, error: lastError };
    }

    /**
     * 데이터베이스 쿼리 프록시
     * @param table 테이블 이름
     * @param query 쿼리 옵션
     */
    async query<T>(table: string, query: {
        select?: string;
        filter?: Record<string, any>;
        order?: { column: string; ascending?: boolean };
        limit?: number;
        offset?: number;
    }): Promise<{ data: T[] | null; error: Error | null }> {
        return this.request<T[]>(`/db/${table}`, {
            method: 'POST',
            body: JSON.stringify(query)
        });
    }

    /**
     * 데이터 삽입 프록시
     */
    async insert<T>(table: string, data: T | T[]): Promise<{ data: T | null; error: Error | null }> {
        return this.request<T>(`/db/${table}/insert`, {
            method: 'POST',
            body: JSON.stringify({ data })
        });
    }

    /**
     * 데이터 업데이트 프록시
     */
    async update<T>(table: string, id: number | string, data: Partial<T>): Promise<{ data: T | null; error: Error | null }> {
        return this.request<T>(`/db/${table}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ data })
        });
    }

    /**
     * 데이터 삭제 프록시
     */
    async delete(table: string, id: number | string): Promise<{ error: Error | null }> {
        const result = await this.request(`/db/${table}/${id}`, {
            method: 'DELETE'
        });
        return { error: result.error };
    }

    /**
     * 인증 관련 프록시
     */
    async auth(action: 'login' | 'logout' | 'refresh', data?: any): Promise<{ data: any; error: Error | null }> {
        return this.request(`/auth/${action}`, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    /**
     * 파일 업로드 프록시
     */
    async uploadFile(bucket: string, file: File, path?: string): Promise<{ data: { url: string } | null; error: Error | null }> {
        const formData = new FormData();
        formData.append('file', file);
        if (path) {
            formData.append('path', path);
        }

        return this.request(`/storage/${bucket}/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                // Content-Type을 설정하지 않음 - 브라우저가 자동으로 설정
            }
        });
    }

    /**
     * 캐시 관리
     */
    private getFromCache(key: string): any | null {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    private setCache(key: string, data: any, ttl: number): void {
        this.cache.set(key, { data, timestamp: Date.now(), ttl });
        
        // 캐시 크기 제한 (100개)
        if (this.cache.size > 100) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    /**
     * 유틸리티 함수들
     */
    private generateRequestId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private isRetriableError(error: Error): boolean {
        const retriableStatuses = [408, 429, 500, 502, 503, 504];
        const message = error.message.toLowerCase();
        
        return retriableStatuses.some(status => message.includes(status.toString())) ||
               message.includes('network') ||
               message.includes('timeout');
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 캐시 초기화
     */
    clearCache(): void {
        this.cache.clear();
    }
}

// 싱글톤 인스턴스 export
export const apiProxy = APIProxy.getInstance();

/**
 * 서버 사이드 프록시 구현 예시 (Node.js/Express)
 * 
 * app.post('/api/proxy/db/:table', async (req, res) => {
 *     try {
 *         // 인증 확인
 *         const authHeader = req.headers.authorization;
 *         if (!authHeader) {
 *             return res.status(401).json({ error: 'Unauthorized' });
 *         }
 * 
 *         // Supabase 클라이언트 생성 (서버 사이드 키 사용)
 *         const supabase = createClient(
 *             process.env.SUPABASE_URL,
 *             process.env.SUPABASE_SERVICE_KEY
 *         );
 * 
 *         // 쿼리 실행
 *         const { table } = req.params;
 *         const { select, filter, order, limit, offset } = req.body;
 * 
 *         let query = supabase.from(table).select(select || '*');
 * 
 *         if (filter) {
 *             Object.entries(filter).forEach(([key, value]) => {
 *                 query = query.eq(key, value);
 *             });
 *         }
 * 
 *         if (order) {
 *             query = query.order(order.column, { ascending: order.ascending });
 *         }
 * 
 *         if (limit) query = query.limit(limit);
 *         if (offset) query = query.range(offset, offset + limit - 1);
 * 
 *         const { data, error } = await query;
 * 
 *         if (error) {
 *             return res.status(400).json({ error: error.message });
 *         }
 * 
 *         res.json({ data });
 *     } catch (error) {
 *         res.status(500).json({ error: 'Internal server error' });
 *     }
 * });
 */