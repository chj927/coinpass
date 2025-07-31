// 성능 모니터링 시스템
import { PerformanceMetrics } from './types';

export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: PerformanceMetrics = {
        loadTime: 0,
        domContentLoaded: 0,
        firstPaint: 0,
        firstContentfulPaint: 0
    };
    private observers: PerformanceObserver[] = [];

    private constructor() {
        this.initializeMonitoring();
    }

    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    private initializeMonitoring(): void {
        // DOM 로딩 시간 측정
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.metrics.domContentLoaded = performance.now();
            });
        } else {
            this.metrics.domContentLoaded = performance.now();
        }

        // 페이지 로드 완료 시간 측정
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now();
            this.measureWebVitals();
        });

        // Paint 이벤트 관찰
        this.observePaintTiming();
        
        // LCP (Largest Contentful Paint) 관찰
        this.observeLCP();
    }

    private observePaintTiming(): void {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.name === 'first-paint') {
                            this.metrics.firstPaint = entry.startTime;
                        } else if (entry.name === 'first-contentful-paint') {
                            this.metrics.firstContentfulPaint = entry.startTime;
                        }
                    }
                });
                observer.observe({ entryTypes: ['paint'] });
                this.observers.push(observer);
            } catch (error) {
                console.warn('Paint timing observation failed:', error);
            }
        }
    }

    private observeLCP(): void {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.largestContentfulPaint = lastEntry.startTime;
                });
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.push(observer);
            } catch (error) {
                console.warn('LCP observation failed:', error);
            }
        }
    }

    private measureWebVitals(): void {
        // CLS (Cumulative Layout Shift) 측정
        if ('PerformanceObserver' in window) {
            try {
                let cls = 0;
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!(entry as any).hadRecentInput) {
                            cls += (entry as any).value;
                        }
                    }
                });
                observer.observe({ entryTypes: ['layout-shift'] });
                this.observers.push(observer);

                // 10초 후 CLS 값 로그
                setTimeout(() => {
                    console.log('Cumulative Layout Shift:', cls);
                }, 10000);
            } catch (error) {
                console.warn('CLS observation failed:', error);
            }
        }
    }

    public getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    public logMetrics(): void {
        const metrics = this.getMetrics();
        console.group('🚀 Performance Metrics');
        console.log('Load time:', `${metrics.loadTime.toFixed(2)}ms`);
        console.log('DOM Content Loaded:', `${metrics.domContentLoaded.toFixed(2)}ms`);
        console.log('First Paint:', `${metrics.firstPaint.toFixed(2)}ms`);
        console.log('First Contentful Paint:', `${metrics.firstContentfulPaint.toFixed(2)}ms`);
        if (metrics.largestContentfulPaint) {
            console.log('Largest Contentful Paint:', `${metrics.largestContentfulPaint.toFixed(2)}ms`);
        }
        console.groupEnd();

        // 성능 이슈 경고
        this.checkPerformanceThresholds(metrics);
    }

    private checkPerformanceThresholds(metrics: PerformanceMetrics): void {
        const warnings: string[] = [];

        if (metrics.firstContentfulPaint > 2000) {
            warnings.push('First Contentful Paint is slow (>2s)');
        }
        if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > 2500) {
            warnings.push('Largest Contentful Paint is slow (>2.5s)');
        }
        if (metrics.loadTime > 5000) {
            warnings.push('Page load time is slow (>5s)');
        }

        if (warnings.length > 0) {
            console.warn('⚠️ Performance warnings:', warnings);
        }
    }

    // 메모리 사용량 모니터링
    public getMemoryUsage(): any {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            return {
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                jsHeapSizeLimit: memory.jsHeapSizeLimit,
                usage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2) + '%'
            };
        }
        return null;
    }

    // 네트워크 성능 모니터링
    public getNetworkTiming(): any {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
            return {
                dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcp: navigation.connectEnd - navigation.connectStart,
                ssl: navigation.connectEnd - navigation.secureConnectionStart,
                ttfb: navigation.responseStart - navigation.requestStart,
                download: navigation.responseEnd - navigation.responseStart
            };
        }
        return null;
    }

    // 정리 함수
    public dispose(): void {
        this.observers.forEach(observer => {
            try {
                observer.disconnect();
            } catch (error) {
                console.warn('Failed to disconnect observer:', error);
            }
        });
        this.observers = [];
    }
}

// 자동 성능 모니터링 시작
export function startPerformanceMonitoring(): void {
    const monitor = PerformanceMonitor.getInstance();
    
    // 페이지 로드 완료 후 메트릭 로그
    window.addEventListener('load', () => {
        setTimeout(() => {
            monitor.logMetrics();
            
            // 메모리 사용량 체크
            const memory = monitor.getMemoryUsage();
            if (memory) {
                console.log('💾 Memory usage:', memory);
            }

            // 네트워크 타이밍 체크
            const network = monitor.getNetworkTiming();
            if (network) {
                console.log('🌐 Network timing:', network);
            }
        }, 1000);
    });

    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', () => {
        monitor.dispose();
    });
}