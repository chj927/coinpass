// Memory Management and Cleanup Utilities
export class MemoryOptimizer {
    private observers: Set<IntersectionObserver> = new Set();
    private timers: Set<number> = new Set();
    private eventListeners: Map<EventTarget, Map<string, EventListener>> = new Map();
    private rafIds: Set<number> = new Set();

    // Register observer for automatic cleanup
    registerObserver(observer: IntersectionObserver): void {
        this.observers.add(observer);
    }

    // Register timer for automatic cleanup
    registerTimer(timerId: number): number {
        this.timers.add(timerId);
        return timerId;
    }

    // Register RAF for automatic cleanup
    registerRAF(rafId: number): number {
        this.rafIds.add(rafId);
        return rafId;
    }

    // Smart event listener management
    addEventListener(
        target: EventTarget,
        event: string,
        listener: EventListener,
        options?: AddEventListenerOptions
    ): void {
        target.addEventListener(event, listener, options);
        
        if (!this.eventListeners.has(target)) {
            this.eventListeners.set(target, new Map());
        }
        this.eventListeners.get(target)!.set(event, listener);
    }

    // Cleanup all registered resources
    cleanup(): void {
        // Disconnect all observers
        this.observers.forEach(observer => {
            try {
                observer.disconnect();
            } catch (e) {
                console.warn('Failed to disconnect observer:', e);
            }
        });
        this.observers.clear();

        // Clear all timers
        this.timers.forEach(timer => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        this.timers.clear();

        // Cancel all RAF
        this.rafIds.forEach(id => {
            cancelAnimationFrame(id);
        });
        this.rafIds.clear();

        // Remove all event listeners
        this.eventListeners.forEach((listeners, target) => {
            listeners.forEach((listener, event) => {
                try {
                    target.removeEventListener(event, listener);
                } catch (e) {
                    console.warn('Failed to remove event listener:', e);
                }
            });
        });
        this.eventListeners.clear();
    }

    // Memory usage monitoring
    getMemoryUsage(): MemoryInfo | null {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            return {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit,
                usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
            };
        }
        return null;
    }

    // Trigger garbage collection hint (if available)
    requestIdleGC(): void {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // Hint to browser that GC might be beneficial
                // Clear any weak references
                if ('gc' in window) {
                    (window as any).gc();
                }
            }, { timeout: 1000 });
        }
    }

    // Image loading optimization with lazy loading
    optimizeImageLoading(selector: string = 'img'): void {
        const images = document.querySelectorAll(selector);
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target as HTMLImageElement;
                    if (img.dataset.src) {
                        // Preload image before setting src
                        const tempImg = new Image();
                        tempImg.onload = () => {
                            img.src = img.dataset.src!;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        };
                        tempImg.src = img.dataset.src;
                    }
                }
            });
        }, {
            rootMargin: '50px',
            threshold: 0.01
        });

        images.forEach(img => {
            const imgElement = img as HTMLImageElement;
            if (imgElement.loading !== 'eager' && !imgElement.complete) {
                imgElement.loading = 'lazy';
            }
            if (imgElement.dataset.src) {
                imageObserver.observe(imgElement);
            }
        });

        this.registerObserver(imageObserver);
    }

    // Debounce heavy operations
    debounce<T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeoutId: number;
        
        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                func(...args);
            }, wait);
            this.registerTimer(timeoutId);
        };
    }

    // Throttle frequent operations
    throttle<T extends (...args: any[]) => any>(
        func: T,
        limit: number
    ): (...args: Parameters<T>) => void {
        let inThrottle: boolean;
        let lastArgs: Parameters<T> | null = null;
        
        return (...args: Parameters<T>) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                const timerId = window.setTimeout(() => {
                    inThrottle = false;
                    if (lastArgs) {
                        func(...lastArgs);
                        lastArgs = null;
                    }
                }, limit);
                this.registerTimer(timerId);
            } else {
                lastArgs = args;
            }
        };
    }
}

interface MemoryInfo {
    used: number;
    total: number;
    limit: number;
    usage: number;
}

// Export singleton instance
export const memoryOptimizer = new MemoryOptimizer();

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
    memoryOptimizer.cleanup();
});