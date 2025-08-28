// Network Optimization Strategies

import { createClient } from '@supabase/supabase-js';

// 1. Enhanced Request Manager with deduplication and batching
class RequestManager {
    private pendingRequests = new Map<string, Promise<any>>();
    private batchQueue = new Map<string, Set<() => void>>();
    private batchTimeout: number | null = null;
    private readonly BATCH_DELAY = 50; // ms

    // Deduplicate identical requests
    async deduplicatedFetch<T>(
        key: string,
        fetcher: () => Promise<T>
    ): Promise<T> {
        // Check if request is already pending
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key) as Promise<T>;
        }

        // Create new request
        const promise = fetcher()
            .then(result => {
                this.pendingRequests.delete(key);
                return result;
            })
            .catch(error => {
                this.pendingRequests.delete(key);
                throw error;
            });

        this.pendingRequests.set(key, promise);
        return promise;
    }

    // Batch multiple requests
    batchRequest(endpoint: string, resolver: () => void) {
        if (!this.batchQueue.has(endpoint)) {
            this.batchQueue.set(endpoint, new Set());
        }
        
        this.batchQueue.get(endpoint)!.add(resolver);
        
        // Schedule batch processing
        if (!this.batchTimeout) {
            this.batchTimeout = window.setTimeout(() => {
                this.processBatch();
            }, this.BATCH_DELAY);
        }
    }

    private processBatch() {
        this.batchQueue.forEach((resolvers, endpoint) => {
            // Process all requests for this endpoint at once
            resolvers.forEach(resolver => resolver());
        });
        
        this.batchQueue.clear();
        this.batchTimeout = null;
    }
}

// 2. Optimized Supabase Client with connection pooling
class OptimizedSupabaseClient {
    private static instance: OptimizedSupabaseClient;
    private client: any;
    private connectionPromise: Promise<boolean> | null = null;
    private lastHealthCheck = 0;
    private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
    private requestManager = new RequestManager();

    private constructor() {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        this.client = createClient(supabaseUrl, supabaseAnonKey, {
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
            },
            // Optimize connection pooling
            realtime: {
                params: {
                    eventsPerSecond: 2
                }
            }
        });
    }

    static getInstance(): OptimizedSupabaseClient {
        if (!this.instance) {
            this.instance = new OptimizedSupabaseClient();
        }
        return this.instance;
    }

    // Cached connection check
    async checkConnection(): Promise<boolean> {
        const now = Date.now();
        
        // Use cached result if recent
        if (now - this.lastHealthCheck < this.HEALTH_CHECK_INTERVAL) {
            return true;
        }

        // Deduplicate connection checks
        if (!this.connectionPromise) {
            this.connectionPromise = this.performHealthCheck();
        }

        return this.connectionPromise;
    }

    private async performHealthCheck(): Promise<boolean> {
        try {
            const { error } = await this.client
                .from('exchange_exchanges')
                .select('count', { count: 'exact', head: true });
            
            this.lastHealthCheck = Date.now();
            this.connectionPromise = null;
            
            return !error;
        } catch {
            this.connectionPromise = null;
            return false;
        }
    }

    // Optimized data fetching with request deduplication
    async fetchData<T>(
        table: string,
        options?: {
            select?: string;
            filter?: Record<string, any>;
            orderBy?: { column: string; ascending?: boolean };
            limit?: number;
        }
    ): Promise<T[]> {
        const key = `${table}-${JSON.stringify(options)}`;
        
        return this.requestManager.deduplicatedFetch(key, async () => {
            let query = this.client.from(table).select(options?.select || '*');
            
            if (options?.filter) {
                Object.entries(options.filter).forEach(([col, val]) => {
                    query = query.eq(col, val);
                });
            }
            
            if (options?.orderBy) {
                query = query.order(options.orderBy.column, {
                    ascending: options.orderBy.ascending ?? true
                });
            }
            
            if (options?.limit) {
                query = query.limit(options.limit);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return data || [];
        });
    }
}

// 3. Advanced Cache Strategy with IndexedDB
class AdvancedCache {
    private memoryCache = new Map<string, { data: any; expires: number }>();
    private dbName = 'CoinPassCache';
    private storeName = 'apiCache';
    private db: IDBDatabase | null = null;
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

    async initialize() {
        if (!('indexedDB' in window)) return;

        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'key' });
                }
            };
        });
    }

    // Multi-tier caching: Memory -> IndexedDB -> Network
    async get<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttl: number = this.DEFAULT_TTL
    ): Promise<T> {
        // Check memory cache first
        const memCached = this.memoryCache.get(key);
        if (memCached && memCached.expires > Date.now()) {
            return memCached.data;
        }

        // Check IndexedDB
        const dbCached = await this.getFromDB(key);
        if (dbCached && dbCached.expires > Date.now()) {
            // Promote to memory cache
            this.memoryCache.set(key, dbCached);
            return dbCached.data;
        }

        // Fetch from network
        const data = await fetcher();
        
        // Store in both caches
        const cacheEntry = { data, expires: Date.now() + ttl };
        this.memoryCache.set(key, cacheEntry);
        await this.saveToDB(key, cacheEntry);
        
        return data;
    }

    private async getFromDB(key: string): Promise<any> {
        if (!this.db) return null;

        return new Promise((resolve) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(null);
        });
    }

    private async saveToDB(key: string, value: any): Promise<void> {
        if (!this.db) return;

        return new Promise((resolve) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            store.put({ key, ...value });
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => resolve();
        });
    }

    // Preload critical data
    async preloadCriticalData() {
        const criticalEndpoints = [
            { key: 'exchanges', fetcher: () => this.fetchExchanges() },
            { key: 'hero-content', fetcher: () => this.fetchHeroContent() }
        ];

        // Use Promise.allSettled for resilience
        await Promise.allSettled(
            criticalEndpoints.map(({ key, fetcher }) =>
                this.get(key, fetcher, 10 * 60 * 1000) // 10 min TTL for critical data
            )
        );
    }

    private async fetchExchanges() {
        const client = OptimizedSupabaseClient.getInstance();
        return client.fetchData('exchange_exchanges', {
            orderBy: { column: 'display_order', ascending: true }
        });
    }

    private async fetchHeroContent() {
        const client = OptimizedSupabaseClient.getInstance();
        return client.fetchData('page_contents', {
            filter: { page_type: 'hero', is_active: true }
        });
    }

    // Clear old cache entries
    async cleanup() {
        if (!this.db) return;

        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.openCursor();
        const now = Date.now();

        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
                if (cursor.value.expires < now) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };

        // Also cleanup memory cache
        for (const [key, value] of this.memoryCache.entries()) {
            if (value.expires < now) {
                this.memoryCache.delete(key);
            }
        }
    }
}

// 4. Parallel Data Loader with priority queue
class ParallelDataLoader {
    private highPriorityQueue: (() => Promise<any>)[] = [];
    private lowPriorityQueue: (() => Promise<any>)[] = [];
    private cache = new AdvancedCache();
    private isLoading = false;
    
    async initialize() {
        await this.cache.initialize();
        
        // Start cache cleanup interval
        setInterval(() => this.cache.cleanup(), 60000); // Every minute
    }

    async loadPageData() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            // High priority: Critical above-the-fold content
            this.addHighPriority(
                () => this.cache.get('hero-data', this.fetchHeroData, 10 * 60 * 1000),
                () => this.cache.get('exchanges-preview', this.fetchExchangesPreview, 5 * 60 * 1000)
            );

            // Low priority: Below-the-fold content
            this.addLowPriority(
                () => this.cache.get('faqs', this.fetchFAQs, 15 * 60 * 1000),
                () => this.cache.get('popup-data', this.fetchPopupData, 30 * 60 * 1000)
            );

            // Process high priority first
            const highPriorityResults = await Promise.allSettled(
                this.highPriorityQueue.map(fn => fn())
            );

            // Process low priority in background
            this.processLowPriority();

            return this.processResults(highPriorityResults);
        } finally {
            this.isLoading = false;
        }
    }

    private addHighPriority(...fns: (() => Promise<any>)[]) {
        this.highPriorityQueue.push(...fns);
    }

    private addLowPriority(...fns: (() => Promise<any>)[]) {
        this.lowPriorityQueue.push(...fns);
    }

    private async processLowPriority() {
        // Use requestIdleCallback for low priority tasks
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                Promise.allSettled(
                    this.lowPriorityQueue.map(fn => fn())
                );
            });
        } else {
            // Fallback to setTimeout
            setTimeout(() => {
                Promise.allSettled(
                    this.lowPriorityQueue.map(fn => fn())
                );
            }, 100);
        }
    }

    private processResults(results: PromiseSettledResult<any>[]) {
        const data: any = {};
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                // Map results to data keys
                const keys = ['hero', 'exchanges'];
                if (keys[index]) {
                    data[keys[index]] = result.value;
                }
            }
        });
        
        return data;
    }

    // Data fetchers
    private async fetchHeroData() {
        const client = OptimizedSupabaseClient.getInstance();
        return client.fetchData('page_contents', {
            filter: { page_type: 'hero', is_active: true },
            limit: 1
        });
    }

    private async fetchExchangesPreview() {
        const client = OptimizedSupabaseClient.getInstance();
        return client.fetchData('exchange_exchanges', {
            orderBy: { column: 'display_order', ascending: true },
            limit: 6 // Only fetch visible cards initially
        });
    }

    private async fetchFAQs() {
        const client = OptimizedSupabaseClient.getInstance();
        return client.fetchData('exchange_faqs', {
            orderBy: { column: 'id', ascending: true }
        });
    }

    private async fetchPopupData() {
        const client = OptimizedSupabaseClient.getInstance();
        return client.fetchData('page_contents', {
            filter: { page_type: 'popup', is_active: true },
            limit: 1
        });
    }
}

// Export optimized utilities
export {
    RequestManager,
    OptimizedSupabaseClient,
    AdvancedCache,
    ParallelDataLoader
};

// Usage example
export async function initializeOptimizedDataLoading() {
    const loader = new ParallelDataLoader();
    await loader.initialize();
    
    // Start loading data with priorities
    const data = await loader.loadPageData();
    
    return data;
}