/**
 * Google Analytics and Tag Manager Integration
 * Provides tracking functions for user events and page views
 */

declare global {
    interface Window {
        dataLayer: any[];
        gtag?: (...args: any[]) => void;
    }
}

// GTM Configuration
const GTM_ID = 'GTM-MH6FMN88';

/**
 * Initialize Google Tag Manager
 * This is automatically done in HTML, but this provides TypeScript support
 */
export class Analytics {
    private static instance: Analytics;
    private initialized: boolean = false;

    private constructor() {
        this.init();
    }

    static getInstance(): Analytics {
        if (!Analytics.instance) {
            Analytics.instance = new Analytics();
        }
        return Analytics.instance;
    }

    private init(): void {
        if (this.initialized || typeof window === 'undefined') {
            return;
        }

        // Initialize dataLayer if not exists
        window.dataLayer = window.dataLayer || [];
        
        this.initialized = true;
        console.log('Analytics initialized with GTM ID:', GTM_ID);
    }

    /**
     * Track custom events
     * @param eventName - Name of the event
     * @param parameters - Event parameters
     */
    trackEvent(eventName: string, parameters?: Record<string, any>): void {
        if (!this.initialized || typeof window === 'undefined') {
            console.warn('Analytics not initialized or not in browser environment');
            return;
        }

        try {
            window.dataLayer.push({
                event: eventName,
                ...parameters
            });
            
            console.log('Event tracked:', eventName, parameters);
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    }

    /**
     * Track page views
     * @param pagePath - Optional custom page path
     * @param pageTitle - Optional custom page title
     */
    trackPageView(pagePath?: string, pageTitle?: string): void {
        if (!this.initialized) return;

        const data: any = {
            event: 'page_view'
        };

        if (pagePath) {
            data.page_path = pagePath;
        }

        if (pageTitle) {
            data.page_title = pageTitle;
        }

        this.trackEvent('page_view', data);
    }

    /**
     * Track user interactions
     */
    trackUserInteraction(action: string, category: string, label?: string, value?: number): void {
        this.trackEvent('user_interaction', {
            action,
            category,
            label,
            value
        });
    }

    /**
     * Track conversions (e.g., sign-ups, exchanges clicked)
     */
    trackConversion(conversionType: string, value?: number, currency: string = 'KRW'): void {
        this.trackEvent('conversion', {
            conversion_type: conversionType,
            value,
            currency
        });
    }

    /**
     * Track exchange link clicks
     */
    trackExchangeClick(exchangeName: string, link: string): void {
        this.trackEvent('exchange_click', {
            exchange_name: exchangeName,
            exchange_link: link,
            event_category: 'engagement',
            event_label: exchangeName
        });
    }

    /**
     * Track search queries
     */
    trackSearch(searchTerm: string, resultsCount?: number): void {
        this.trackEvent('search', {
            search_term: searchTerm,
            results_count: resultsCount
        });
    }

    /**
     * Track errors
     */
    trackError(errorMessage: string, errorStack?: string): void {
        this.trackEvent('error', {
            error_message: errorMessage,
            error_stack: errorStack,
            page_location: window.location.href
        });
    }

    /**
     * Track timing (e.g., page load time)
     */
    trackTiming(category: string, variable: string, time: number, label?: string): void {
        this.trackEvent('timing', {
            timing_category: category,
            timing_variable: variable,
            timing_value: time,
            timing_label: label
        });
    }

    /**
     * Set user properties
     */
    setUserProperties(properties: Record<string, any>): void {
        if (!this.initialized) return;

        window.dataLayer.push({
            event: 'user_properties',
            user_properties: properties
        });
    }

    /**
     * Track admin actions
     */
    trackAdminAction(action: string, details?: Record<string, any>): void {
        this.trackEvent('admin_action', {
            action,
            ...details,
            timestamp: new Date().toISOString()
        });
    }
}

// Export singleton instance
export const analytics = Analytics.getInstance();

// Auto-track page views on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        analytics.trackPageView();
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            analytics.trackEvent('page_visible');
        } else {
            analytics.trackEvent('page_hidden');
        }
    });

    // Track errors globally
    window.addEventListener('error', (event) => {
        analytics.trackError(event.message, event.error?.stack);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        analytics.trackError(`Unhandled Promise Rejection: ${event.reason}`);
    });
}

// Utility function to track link clicks
export function trackLinkClick(element: HTMLElement): void {
    const href = element.getAttribute('href');
    const text = element.textContent || '';
    
    analytics.trackUserInteraction('link_click', 'navigation', text, undefined);
    
    // If it's an exchange link, track it specifically
    if (href && href.includes('exchange')) {
        analytics.trackExchangeClick(text, href);
    }
}

// Utility function to measure and track performance
export function trackPerformance(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart;
            const tcpTime = perfData.connectEnd - perfData.connectStart;
            const requestTime = perfData.responseEnd - perfData.requestStart;

            analytics.trackTiming('performance', 'page_load', pageLoadTime);
            analytics.trackTiming('performance', 'dom_ready', domReadyTime);
            analytics.trackTiming('performance', 'dns_lookup', dnsTime);
            analytics.trackTiming('performance', 'tcp_connect', tcpTime);
            analytics.trackTiming('performance', 'request', requestTime);
        }, 0);
    });
}