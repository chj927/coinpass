// Lazy Loading and Code Splitting Strategies

// 1. Component Lazy Loader
class ComponentLazyLoader {
    private loadedComponents = new Set<string>();
    private loadingComponents = new Map<string, Promise<any>>();

    async loadComponent(
        componentName: string,
        loader: () => Promise<any>
    ): Promise<any> {
        // Already loaded
        if (this.loadedComponents.has(componentName)) {
            return;
        }

        // Currently loading
        if (this.loadingComponents.has(componentName)) {
            return this.loadingComponents.get(componentName);
        }

        // Start loading
        const loadPromise = loader()
            .then(module => {
                this.loadedComponents.add(componentName);
                this.loadingComponents.delete(componentName);
                return module;
            })
            .catch(error => {
                this.loadingComponents.delete(componentName);
                throw error;
            });

        this.loadingComponents.set(componentName, loadPromise);
        return loadPromise;
    }

    // Preload component in idle time
    preloadComponent(
        componentName: string,
        loader: () => Promise<any>
    ) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.loadComponent(componentName, loader);
            });
        } else {
            setTimeout(() => {
                this.loadComponent(componentName, loader);
            }, 1);
        }
    }
}

// 2. Image Lazy Loading with Intersection Observer
class ImageLazyLoader {
    private observer: IntersectionObserver;
    private loadedImages = new WeakSet<HTMLImageElement>();
    private placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="100%25" height="100%25" fill="%23ddd"/%3E%3C/svg%3E';

    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                rootMargin: '50px', // Start loading 50px before visible
                threshold: 0.01
            }
        );
    }

    private handleIntersection(entries: IntersectionObserverEntry[]) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                this.loadImage(img);
            }
        });
    }

    private loadImage(img: HTMLImageElement) {
        if (this.loadedImages.has(img)) return;

        const src = img.dataset.src;
        const srcset = img.dataset.srcset;

        if (!src) return;

        // Create a new image to load
        const tempImg = new Image();
        
        tempImg.onload = () => {
            // Apply loaded image
            img.src = src;
            if (srcset) img.srcset = srcset;
            img.classList.add('loaded');
            
            // Stop observing
            this.observer.unobserve(img);
            this.loadedImages.add(img);
        };

        tempImg.onerror = () => {
            img.classList.add('error');
            this.observer.unobserve(img);
        };

        // Start loading
        if (srcset) tempImg.srcset = srcset;
        tempImg.src = src;
    }

    observe(img: HTMLImageElement) {
        // Set placeholder
        if (!img.src) {
            img.src = this.placeholder;
        }
        
        this.observer.observe(img);
    }

    observeAll(selector: string = 'img[data-src]') {
        const images = document.querySelectorAll<HTMLImageElement>(selector);
        images.forEach(img => this.observe(img));
    }

    disconnect() {
        this.observer.disconnect();
    }
}

// 3. Dynamic Import Manager
class DynamicImportManager {
    private modules = new Map<string, any>();
    
    // Load module on demand
    async loadModule(modulePath: string): Promise<any> {
        if (this.modules.has(modulePath)) {
            return this.modules.get(modulePath);
        }

        try {
            const module = await import(/* @vite-ignore */ modulePath);
            this.modules.set(modulePath, module);
            return module;
        } catch (error) {
            console.error(`Failed to load module: ${modulePath}`, error);
            throw error;
        }
    }

    // Preload modules based on route
    async preloadRouteModules(route: string) {
        const routeModules: Record<string, string[]> = {
            '/': ['./index.tsx', './analytics.ts'],
            '/exchange': ['./exchange.tsx', './supabaseClient.ts'],
            '/admin': ['./admin.tsx', './auth-service.ts'],
            '/articles': ['./articles.tsx', './utils/markdown-parser.ts']
        };

        const modules = routeModules[route] || [];
        
        // Preload in parallel
        await Promise.all(
            modules.map(module => this.preloadModule(module))
        );
    }

    // Preload module without executing
    private async preloadModule(modulePath: string) {
        const link = document.createElement('link');
        link.rel = 'modulepreload';
        link.href = modulePath;
        document.head.appendChild(link);
    }
}

// 4. Optimized Page Initialization
export class OptimizedPageInitializer {
    private lazyLoader = new ComponentLazyLoader();
    private imageLoader = new ImageLazyLoader();
    private importManager = new DynamicImportManager();

    async initializePage(pageName: string) {
        // Phase 1: Critical above-the-fold content
        await this.loadCriticalContent(pageName);

        // Phase 2: Interactive elements (deferred)
        requestAnimationFrame(() => {
            this.loadInteractiveElements(pageName);
        });

        // Phase 3: Below-the-fold content (idle)
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.loadBelowFoldContent(pageName);
            });
        } else {
            setTimeout(() => {
                this.loadBelowFoldContent(pageName);
            }, 100);
        }

        // Setup lazy loading for images
        this.imageLoader.observeAll();
    }

    private async loadCriticalContent(pageName: string) {
        switch (pageName) {
            case 'index':
                // Load only hero section initially
                const heroData = await this.loadHeroData();
                this.renderHero(heroData);
                break;
                
            case 'exchange':
                // Load first 6 exchange cards
                const exchanges = await this.loadExchangesPreview();
                this.renderExchangeCards(exchanges);
                break;
                
            case 'admin':
                // Load auth check only
                await this.checkAuthentication();
                break;
        }
    }

    private async loadInteractiveElements(pageName: string) {
        // Load interactive components dynamically
        if (pageName === 'index') {
            const { TypingAnimator } = await import('./typing-animator');
            const { setupMobileMenu } = await import('./mobile-menu');
            
            // Initialize components
            new TypingAnimator(/* ... */);
            setupMobileMenu();
        }
    }

    private async loadBelowFoldContent(pageName: string) {
        // Load remaining content
        if (pageName === 'index') {
            await Promise.all([
                this.lazyLoader.loadComponent('faqs', () => import('./faq-section')),
                this.lazyLoader.loadComponent('popup', () => import('./popup-manager'))
            ]);
        }
    }

    // Data loading methods
    private async loadHeroData() {
        // Implementation
        return {};
    }

    private async loadExchangesPreview() {
        // Implementation
        return [];
    }

    private async checkAuthentication() {
        // Implementation
        return false;
    }

    private renderHero(data: any) {
        // Implementation
    }

    private renderExchangeCards(exchanges: any[]) {
        // Implementation
    }
}

// 5. Route-based Code Splitting
export class RouteBasedSplitter {
    private routes = new Map<string, () => Promise<any>>();

    constructor() {
        this.setupRoutes();
    }

    private setupRoutes() {
        this.routes.set('/', () => import('./pages/index'));
        this.routes.set('/exchange', () => import('./pages/exchange'));
        this.routes.set('/admin', () => import('./pages/admin'));
        this.routes.set('/articles', () => import('./pages/articles'));
    }

    async loadRoute(path: string) {
        const loader = this.routes.get(path);
        if (!loader) {
            throw new Error(`Route not found: ${path}`);
        }

        return await loader();
    }

    // Prefetch route on hover/focus
    prefetchRoute(path: string) {
        const loader = this.routes.get(path);
        if (!loader) return;

        // Create prefetch link
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'script';
        link.href = path;
        document.head.appendChild(link);
    }
}

// 6. Progressive Enhancement Manager
export class ProgressiveEnhancement {
    private features = new Map<string, boolean>();

    constructor() {
        this.detectFeatures();
    }

    private detectFeatures() {
        // Detect browser capabilities
        this.features.set('intersectionObserver', 'IntersectionObserver' in window);
        this.features.set('requestIdleCallback', 'requestIdleCallback' in window);
        this.features.set('webp', this.checkWebPSupport());
        this.features.set('avif', this.checkAVIFSupport());
        this.features.set('lazy', 'loading' in HTMLImageElement.prototype);
    }

    private checkWebPSupport(): boolean {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
    }

    private checkAVIFSupport(): boolean {
        // Implementation for AVIF support detection
        return false;
    }

    enhance(feature: string, enhancedFn: () => void, fallbackFn?: () => void) {
        if (this.features.get(feature)) {
            enhancedFn();
        } else if (fallbackFn) {
            fallbackFn();
        }
    }
}

// Usage Example
export async function initializeOptimizedApp() {
    const initializer = new OptimizedPageInitializer();
    const routeSplitter = new RouteBasedSplitter();
    const enhancement = new ProgressiveEnhancement();

    // Get current page
    const pageName = window.location.pathname.replace('/', '') || 'index';

    // Initialize page with progressive loading
    await initializer.initializePage(pageName);

    // Setup route prefetching on navigation links
    document.querySelectorAll('a[href^="/"]').forEach(link => {
        link.addEventListener('mouseenter', () => {
            const href = link.getAttribute('href');
            if (href) routeSplitter.prefetchRoute(href);
        });
    });

    // Apply progressive enhancements
    enhancement.enhance('intersectionObserver', () => {
        console.log('Using Intersection Observer for lazy loading');
    }, () => {
        console.log('Falling back to scroll event for lazy loading');
    });

    return {
        initializer,
        routeSplitter,
        enhancement
    };
}