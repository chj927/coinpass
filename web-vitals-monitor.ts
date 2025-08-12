// Enhanced Web Vitals Monitoring with Real User Metrics
interface WebVitalsMetrics {
    LCP?: number;  // Largest Contentful Paint
    FID?: number;  // First Input Delay
    CLS?: number;  // Cumulative Layout Shift
    FCP?: number;  // First Contentful Paint
    TTFB?: number; // Time to First Byte
    INP?: number;  // Interaction to Next Paint
}

export class WebVitalsMonitor {
    private metrics: WebVitalsMetrics = {};
    private observers: PerformanceObserver[] = [];
    
    constructor() {
        this.initializeMonitoring();
    }
    
    private initializeMonitoring(): void {
        // Monitor Largest Contentful Paint
        this.observeLCP();
        
        // Monitor First Input Delay
        this.observeFID();
        
        // Monitor Cumulative Layout Shift
        this.observeCLS();
        
        // Monitor First Contentful Paint
        this.observeFCP();
        
        // Monitor Time to First Byte
        this.observeTTFB();
        
        // Monitor Interaction to Next Paint (new Core Web Vital)
        this.observeINP();
    }
    
    private observeLCP(): void {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1] as any;
                this.metrics.LCP = lastEntry.renderTime || lastEntry.loadTime;
                this.checkThreshold('LCP', this.metrics.LCP, 2500);
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('LCP monitoring not supported');
        }
    }
    
    private observeFID(): void {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const firstInput = entries[0] as any;
                this.metrics.FID = firstInput.processingStart - firstInput.startTime;
                this.checkThreshold('FID', this.metrics.FID, 100);
            });
            
            observer.observe({ entryTypes: ['first-input'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('FID monitoring not supported');
        }
    }
    
    private observeCLS(): void {
        try {
            let clsValue = 0;
            let clsEntries: any[] = [];
            let sessionValue = 0;
            let sessionEntries: any[] = [];
            let previousValue = 0;
            
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries() as any[]) {
                    // Only count layout shifts without recent user input
                    if (!entry.hadRecentInput) {
                        const firstSessionEntry = sessionEntries[0];
                        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                        
                        // If the entry occurred less than 1 second after the previous entry
                        // and less than 5 seconds after the first entry in the session,
                        // include the entry in the current session. Otherwise, start a new session.
                        if (sessionValue &&
                            entry.startTime - lastSessionEntry.startTime < 1000 &&
                            entry.startTime - firstSessionEntry.startTime < 5000) {
                            sessionValue += entry.value;
                            sessionEntries.push(entry);
                        } else {
                            sessionValue = entry.value;
                            sessionEntries = [entry];
                        }
                        
                        // If the current session value is larger than the current CLS value,
                        // update CLS and the entries contributing to it.
                        if (sessionValue > clsValue) {
                            clsValue = sessionValue;
                            clsEntries = sessionEntries;
                            this.metrics.CLS = clsValue;
                            this.checkThreshold('CLS', this.metrics.CLS, 0.1);
                        }
                    }
                }
            });
            
            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('CLS monitoring not supported');
        }
    }
    
    private observeFCP(): void {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.FCP = entry.startTime;
                        this.checkThreshold('FCP', this.metrics.FCP, 1800);
                        observer.disconnect();
                    }
                }
            });
            
            observer.observe({ entryTypes: ['paint'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('FCP monitoring not supported');
        }
    }
    
    private observeTTFB(): void {
        try {
            const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigationEntry) {
                this.metrics.TTFB = navigationEntry.responseStart - navigationEntry.requestStart;
                this.checkThreshold('TTFB', this.metrics.TTFB, 800);
            }
        } catch (e) {
            console.warn('TTFB monitoring not supported');
        }
    }
    
    private observeINP(): void {
        try {
            let worstINP = 0;
            
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries() as any[]) {
                    if (entry.interactionId) {
                        const inputDelay = entry.processingStart - entry.startTime;
                        const processingTime = entry.processingEnd - entry.processingStart;
                        const presentationDelay = entry.startTime + entry.duration - entry.processingEnd;
                        const duration = inputDelay + processingTime + presentationDelay;
                        
                        if (duration > worstINP) {
                            worstINP = duration;
                            this.metrics.INP = worstINP;
                            this.checkThreshold('INP', this.metrics.INP, 200);
                        }
                    }
                }
            });
            
            observer.observe({ entryTypes: ['event', 'first-input'] });
            this.observers.push(observer);
        } catch (e) {
            console.warn('INP monitoring not supported');
        }
    }
    
    private checkThreshold(metric: string, value: number, threshold: number): void {
        const status = value <= threshold ? '✅' : '⚠️';
        const message = `${status} ${metric}: ${value.toFixed(2)}ms (threshold: ${threshold}ms)`;
        
        if (value > threshold) {
            console.warn(message);
            this.reportToAnalytics(metric, value, 'warning');
        } else {
            console.log(message);
            this.reportToAnalytics(metric, value, 'good');
        }
    }
    
    private reportToAnalytics(metric: string, value: number, status: string): void {
        // Report to analytics service if configured
        if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'web_vitals', {
                metric_name: metric,
                metric_value: value,
                metric_status: status
            });
        }
        
        // Also send to custom monitoring endpoint if needed
        if ('sendBeacon' in navigator) {
            const data = JSON.stringify({
                metric,
                value,
                status,
                timestamp: Date.now(),
                url: window.location.href
            });
            
            // Uncomment and configure your monitoring endpoint
            // navigator.sendBeacon('/api/metrics', data);
        }
    }
    
    public getMetrics(): WebVitalsMetrics {
        return { ...this.metrics };
    }
    
    public logSummary(): void {
        console.group('📊 Web Vitals Summary');
        
        const metrics = this.getMetrics();
        const scores = {
            LCP: this.getScore(metrics.LCP, 2500, 4000),
            FID: this.getScore(metrics.FID, 100, 300),
            CLS: this.getScore(metrics.CLS, 0.1, 0.25),
            FCP: this.getScore(metrics.FCP, 1800, 3000),
            TTFB: this.getScore(metrics.TTFB, 800, 1800),
            INP: this.getScore(metrics.INP, 200, 500)
        };
        
        Object.entries(scores).forEach(([metric, score]) => {
            const value = metrics[metric as keyof WebVitalsMetrics];
            if (value !== undefined) {
                const emoji = score === 'Good' ? '🟢' : score === 'Needs Improvement' ? '🟡' : '🔴';
                console.log(`${emoji} ${metric}: ${value.toFixed(2)}ms (${score})`);
            }
        });
        
        console.groupEnd();
    }
    
    private getScore(value: number | undefined, goodThreshold: number, poorThreshold: number): string {
        if (value === undefined) return 'Not measured';
        if (value <= goodThreshold) return 'Good';
        if (value <= poorThreshold) return 'Needs Improvement';
        return 'Poor';
    }
    
    public dispose(): void {
        this.observers.forEach(observer => {
            try {
                observer.disconnect();
            } catch (e) {
                console.warn('Failed to disconnect observer');
            }
        });
        this.observers = [];
    }
}

// Auto-initialize and export
export const webVitalsMonitor = new WebVitalsMonitor();

// Log summary after page load
window.addEventListener('load', () => {
    setTimeout(() => {
        webVitalsMonitor.logSummary();
    }, 5000);
});

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    webVitalsMonitor.dispose();
});