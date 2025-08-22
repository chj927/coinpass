import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
}

// Create Supabase client with anon key (safe for client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        storageKey: 'coinpass-auth',
        storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    db: {
        schema: 'public'
    },
    global: {
        headers: {
            'x-application-name': 'coinpass'
        }
    }
});

// Database utility functions with proper table names
export class DatabaseUtils {
    /**
     * Check if Supabase connection is working
     */
    static async checkConnection(): Promise<boolean> {
        try {
            const { error } = await supabase.from('exchange_exchanges').select('count', { count: 'exact', head: true });
            return !error;
        } catch {
            return false;
        }
    }

    /**
     * Get paginated data from a table
     */
    static async getPaginatedData(
        table: string,
        page: number = 1,
        pageSize: number = 10,
        filters?: any
    ) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase.from(table).select('*', { count: 'exact' });

        if (filters) {
            Object.keys(filters).forEach(key => {
                query = query.eq(key, filters[key]);
            });
        }

        const { data, error, count } = await query.range(from, to);

        if (error) throw error;

        return {
            data,
            totalCount: count,
            totalPages: Math.ceil((count || 0) / pageSize),
            currentPage: page
        };
    }

    /**
     * Cached query helper
     */
    private static cache = new Map<string, { data: any; timestamp: number }>();
    private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    static async getCachedQuery(key: string, queryFn: () => Promise<any>) {
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }

        const data = await queryFn();
        this.cache.set(key, { data, timestamp: Date.now() });
        
        return data;
    }

    /**
     * Batch insert helper (for admin operations)
     */
    static async batchInsert(table: string, records: any[], batchSize: number = 100) {
        const results = [];
        
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            const { data, error } = await supabase.from(table).insert(batch).select();
            
            if (error) throw error;
            results.push(...(data || []));
        }
        
        return results;
    }

    /**
     * Get exchanges data with proper table name
     */
    static async getExchanges() {
        try {
            const { data, error } = await supabase
                .from('exchange_exchanges')
                .select('*')
                .order('name_ko', { ascending: true });

            if (error) {
                console.error('Error fetching exchanges:', error);
                return [];
            }
            return data || [];
        } catch (err) {
            console.error('Failed to get exchanges:', err);
            return [];
        }
    }

    /**
     * Get FAQs data with proper table name
     */
    static async getFAQs() {
        try {
            const { data, error } = await supabase
                .from('exchange_faqs')
                .select('*')
                .order('id', { ascending: true });
            
            if (error) {
                console.error('Error fetching FAQs:', error);
                return [];
            }
            
            return data || [];
        } catch (err) {
            console.error('Failed to get FAQs:', err);
            return [];
        }
    }

    /**
     * Get page contents (site data) with proper table name
     */
    static async getPageContent(section: string) {
        try {
            // page_type는 USER-DEFINED 타입이므로 정확한 값을 사용해야 함
            const { data, error } = await supabase
                .from('page_contents')
                .select('*')
                .eq('page_type', section)
                .eq('is_active', true)  // 활성화된 컨텐츠만 가져오기
                .single();
            
            if (error) {
                // PGRST116 = no rows returned (데이터가 없는 경우)
                if (error.code === 'PGRST116') {
                    console.log(`No page content found for section: ${section}`);
                    return null;
                }
                console.error('Error fetching page content:', error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Failed to get page content:', error);
            return null;
        }
    }

    /**
     * Get articles with proper table name
     */
    static async getArticles(isPublished: boolean = true) {
        let query = supabase
            .from('articles')
            .select('*');

        if (isPublished) {
            query = query
                .eq('is_published', true)
                .lte('publish_date', new Date().toISOString());
        }

        const { data, error } = await query.order('publish_date', { ascending: false });

        if (error) throw error;
        return data;
    }
}

// Export connection status helper
export const checkSupabaseConnection = DatabaseUtils.checkConnection;