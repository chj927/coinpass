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
            console.log(`🔍 Fetching page content for section: ${section}`);
            
            // USER-DEFINED 타입 문제를 우회하기 위해 모든 데이터를 가져온 후 필터링
            const { data: allData, error } = await supabase
                .from('page_contents')
                .select('*');
            
            if (error) {
                console.error('❌ Error fetching page contents:', error);
                console.error('Error details:', error.message, error.details, error.hint);
                return null;
            }
            
            console.log(`📊 Retrieved ${allData?.length || 0} rows from page_contents table`);
            
            if (!allData || allData.length === 0) {
                console.log('⚠️ No page contents in database - table might be empty');
                
                // RLS 정책 확인을 위한 추가 디버깅
                console.log('Checking if this is an RLS issue...');
                const { data: testData, error: testError } = await supabase
                    .from('page_contents')
                    .select('count');
                console.log('RLS test result:', { testData, testError });
                
                return null;
            }
            
            // 첫 번째 항목 디버깅 출력
            if (allData.length > 0) {
                console.log('Sample data from table:', allData[0]);
                console.log('All page_types in database:', allData.map(item => ({
                    page_type: item.page_type,
                    is_active: item.is_active
                })));
            }
            
            // 클라이언트 측에서 필터링
            const pageContent = allData.find(item => 
                item.page_type === section && 
                item.is_active === true
            );
            
            if (!pageContent) {
                console.log(`❌ No active page content found for section: ${section}`);
                // 디버깅을 위해 모든 page_type 값 출력
                console.log('Available page_types:', allData.map(item => item.page_type));
                console.log('Looking for:', { page_type: section, is_active: true });
                return null;
            }
            
            console.log(`✅ Found page content for ${section}:`, pageContent);
            return pageContent;
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