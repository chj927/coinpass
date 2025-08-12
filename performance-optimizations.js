// Performance Optimizations for CoinPass

// 1. Lazy Loading for Images
class LazyImageLoader {
    constructor() {
        this.imageObserver = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                }
            );

            this.observeImages();
        } else {
            // Fallback for older browsers
            this.loadAllImages();
        }
    }

    observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.imageObserver.observe(img));
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        // Create a new image to preload
        const newImg = new Image();
        newImg.onload = () => {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        };
        newImg.src = src;
    }

    loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }
}

// 2. Skeleton Loading UI
class SkeletonLoader {
    constructor() {
        this.skeletonHTML = {
            card: `
                <div class="skeleton skeleton-card">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
            `,
            tableRow: `
                <tr class="skeleton">
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                    <td><div class="skeleton skeleton-text"></div></td>
                </tr>
            `,
            testimonial: `
                <div class="testimonial-card skeleton">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
            `
        };
    }

    showSkeleton(container, type, count = 1) {
        if (!container) return;
        
        let html = '';
        for (let i = 0; i < count; i++) {
            html += this.skeletonHTML[type] || '';
        }
        container.innerHTML = html;
    }

    replaceSkeleton(container, content) {
        if (!container) return;
        
        // Fade out skeleton
        container.style.opacity = '0';
        
        setTimeout(() => {
            container.innerHTML = content;
            container.style.opacity = '1';
        }, 300);
    }
}

// 3. Optimized Scroll Handler with Throttling
class ScrollOptimizer {
    constructor() {
        this.ticking = false;
        this.scrollCallbacks = [];
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    }

    handleScroll() {
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.scrollCallbacks.forEach(callback => callback());
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    addCallback(callback) {
        this.scrollCallbacks.push(callback);
    }
}

// 4. Mobile Bottom CTA Implementation
class MobileBottomCTA {
    constructor() {
        this.init();
    }

    init() {
        if (window.innerWidth <= 768) {
            this.createBottomCTA();
            this.handleScrollVisibility();
        }
    }

    createBottomCTA() {
        const existingCTA = document.querySelector('.mobile-bottom-cta');
        if (existingCTA) return;

        const bottomCTA = document.createElement('div');
        bottomCTA.className = 'mobile-bottom-cta';
        bottomCTA.innerHTML = `
            <a href="exchange" class="cta-button primary">수수료 혜택 받기</a>
            <a href="compare" class="cta-button secondary">시세 비교</a>
        `;
        document.body.appendChild(bottomCTA);
    }

    handleScrollVisibility() {
        const bottomCTA = document.querySelector('.mobile-bottom-cta');
        if (!bottomCTA) return;

        let lastScrollTop = 0;
        const scrollOptimizer = new ScrollOptimizer();
        
        scrollOptimizer.addCallback(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down - hide
                bottomCTA.style.transform = 'translateY(100%)';
            } else {
                // Scrolling up - show
                bottomCTA.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }
}

// 5. Resource Hints and Preloading
class ResourceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.preconnectDomains();
        this.prefetchResources();
        this.preloadCriticalFonts();
    }

    preconnectDomains() {
        const domains = [
            'https://cdn.jsdelivr.net',
            'https://znixozrpthqcrvgdkgry.supabase.co'
        ];

        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    prefetchResources() {
        const resources = [
            '/exchange',
            '/compare'
        ];

        resources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = resource;
            document.head.appendChild(link);
        });
    }

    preloadCriticalFonts() {
        const font = document.createElement('link');
        font.rel = 'preload';
        font.as = 'style';
        font.href = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css';
        font.crossOrigin = 'anonymous';
        document.head.appendChild(font);
    }
}

// 6. Optimized Animation Observer
class AnimationOptimizer {
    constructor() {
        this.animationObserver = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.animationObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            // Only animate once
                            this.animationObserver.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                }
            );

            this.observeElements();
        }
    }

    observeElements() {
        const elements = document.querySelectorAll('.anim-fade-in, .benefit-card, .section-title');
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            this.animationObserver.observe(el);
        });
    }
}

// 7. Memory Management
class MemoryOptimizer {
    constructor() {
        this.cleanupFunctions = [];
        this.init();
    }

    init() {
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup());
        
        // Periodic cleanup for long sessions
        setInterval(() => this.periodicCleanup(), 60000); // Every minute
    }

    registerCleanup(fn) {
        this.cleanupFunctions.push(fn);
    }

    cleanup() {
        this.cleanupFunctions.forEach(fn => fn());
        
        // Clear timers
        const highestId = window.setTimeout(() => {}, 0);
        for (let i = 0; i < highestId; i++) {
            window.clearTimeout(i);
            window.clearInterval(i);
        }
    }

    periodicCleanup() {
        // Clean up detached DOM nodes
        if (typeof gc === 'function') {
            gc();
        }
    }
}

// 8. Debounced Input Handler
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 9. Main Performance Initialization
class PerformanceManager {
    constructor() {
        this.modules = {};
        this.init();
    }

    init() {
        // Only initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initModules());
        } else {
            this.initModules();
        }
    }

    initModules() {
        try {
            // Initialize all performance modules
            this.modules.lazyLoader = new LazyImageLoader();
            this.modules.skeletonLoader = new SkeletonLoader();
            this.modules.scrollOptimizer = new ScrollOptimizer();
            this.modules.mobileBottomCTA = new MobileBottomCTA();
            this.modules.resourceOptimizer = new ResourceOptimizer();
            this.modules.animationOptimizer = new AnimationOptimizer();
            this.modules.memoryOptimizer = new MemoryOptimizer();
        } catch (error) {
            console.error('Performance module initialization error:', error);
        }

        // Add debounced resize handler
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth <= 768 && !this.modules.mobileBottomCTA) {
                this.modules.mobileBottomCTA = new MobileBottomCTA();
            }
        }, 250));

        // Log performance metrics
        this.logPerformanceMetrics();
    }

    logPerformanceMetrics() {
        if ('performance' in window && 'measure' in window.performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = window.performance.getEntriesByType('navigation')[0];
                    console.log('Performance Metrics:', {
                        'DOM Content Loaded': Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart) + 'ms',
                        'Load Complete': Math.round(perfData.loadEventEnd - perfData.loadEventStart) + 'ms',
                        'Total Load Time': Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms'
                    });
                }, 0);
            });
        }
    }
}

// Initialize Performance Manager
let performanceManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        performanceManager = new PerformanceManager();
    });
} else {
    performanceManager = new PerformanceManager();
}

// Export for use in other modules
window.CoinPassPerformance = {
    getModule: function(moduleName) {
        return performanceManager && performanceManager.modules ? performanceManager.modules[moduleName] : null;
    },
    debounce: debounce
};