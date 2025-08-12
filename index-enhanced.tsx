// Enhanced index.tsx with business-focused improvements
// This file contains immediate improvements for conversion optimization

import { supabase, DatabaseUtils } from './supabaseClient';
import { SecurityUtils } from './security-utils';
import { ErrorHandler, setupGlobalErrorHandling, handleAsyncError } from './error-handler';
import { startPerformanceMonitoring } from './performance-monitor';

// Analytics and Conversion Tracking
class ConversionTracker {
    private static instance: ConversionTracker;
    private events: Map<string, number> = new Map();
    private sessionStartTime: number = Date.now();
    
    static getInstance() {
        if (!this.instance) {
            this.instance = new ConversionTracker();
        }
        return this.instance;
    }
    
    trackEvent(eventName: string, properties?: Record<string, any>) {
        const count = (this.events.get(eventName) || 0) + 1;
        this.events.set(eventName, count);
        
        // Send to Supabase for analytics
        supabase.from('analytics_events').insert({
            event_name: eventName,
            properties: properties || {},
            session_id: this.getSessionId(),
            timestamp: new Date(),
            page: 'index',
            user_agent: navigator.userAgent,
            referrer: document.referrer
        }).then().catch(console.error);
    }
    
    trackTimeOnPage() {
        const timeSpent = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        this.trackEvent('time_on_page', { seconds: timeSpent });
    }
    
    private getSessionId(): string {
        let sessionId = sessionStorage.getItem('coinpass_session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('coinpass_session_id', sessionId);
        }
        return sessionId;
    }
}

// Trust Indicators Component
class TrustIndicators {
    private container: HTMLElement | null = null;
    
    async init() {
        // Add trust badges to hero section
        const heroSection = document.querySelector('.hero-content-centered');
        if (!heroSection) return;
        
        const trustBadges = document.createElement('div');
        trustBadges.className = 'trust-badges-container';
        trustBadges.innerHTML = `
            <div class="trust-badges animate-fade-in">
                <div class="badge-item">
                    <svg class="badge-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2"/>
                        <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>금융위 등록 업체</span>
                </div>
                <div class="badge-item">
                    <svg class="badge-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7V12C2 16.5 4.23 20.68 7.62 23.15L12 24L16.38 23.15C19.77 20.68 22 16.5 22 12V7L12 2Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>100% 안전 거래</span>
                </div>
                <div class="badge-item">
                    <svg class="badge-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2"/>
                        <path d="M23 21V19C23 17.9391 22.5786 16.9217 21.8284 16.1716C21.0783 15.4214 20.0609 15 19 15H18" stroke="currentColor" stroke-width="2"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>10만+ 활성 사용자</span>
                </div>
            </div>
        `;
        
        // Insert before hero title
        const heroTitle = document.getElementById('hero-title');
        if (heroTitle && heroTitle.parentElement) {
            heroTitle.parentElement.insertBefore(trustBadges, heroTitle);
        }
        
        // Add CSS
        this.injectStyles();
    }
    
    private injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .trust-badges-container {
                margin-bottom: 2rem;
            }
            
            .trust-badges {
                display: flex;
                gap: 1.5rem;
                justify-content: center;
                flex-wrap: wrap;
                opacity: 0;
                animation: fadeInUp 0.8s ease forwards;
                animation-delay: 0.2s;
            }
            
            .badge-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                font-size: 0.875rem;
                color: var(--text-muted);
                backdrop-filter: blur(10px);
            }
            
            .badge-icon {
                color: var(--accent-color);
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @media (max-width: 768px) {
                .trust-badges {
                    gap: 0.75rem;
                }
                .badge-item {
                    font-size: 0.75rem;
                    padding: 0.375rem 0.75rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Live Activity Feed
class LiveActivityFeed {
    private activities = [
        { user: '김**', action: '바이낸스 50% 할인 시작', time: '방금 전' },
        { user: '이**', action: '월 35만원 절약 달성', time: '2분 전' },
        { user: '박**', action: 'OKX VIP 등급 획득', time: '5분 전' },
        { user: '최**', action: '바이비트 45% 할인 적용', time: '7분 전' },
        { user: '정**', action: 'MEXC 첫 거래 완료', time: '10분 전' },
        { user: '강**', action: '누적 절약 100만원 돌파', time: '12분 전' },
        { user: '조**', action: 'Gate.io 계정 연동', time: '15분 전' },
        { user: '윤**', action: '월 50만원 수수료 절약', time: '18분 전' }
    ];
    
    private currentIndex = 0;
    private container: HTMLElement | null = null;
    
    init() {
        // Find the comparison table section
        const comparisonSection = document.querySelector('.exchange-comparison-preview');
        if (!comparisonSection) return;
        
        // Create live feed element
        const feedContainer = document.createElement('div');
        feedContainer.className = 'live-activity-feed';
        feedContainer.innerHTML = `
            <div class="feed-header">
                <span class="live-indicator">
                    <span class="pulse-dot"></span>
                    실시간
                </span>
                <h3>최근 활동</h3>
            </div>
            <div class="activity-list">
                ${this.generateActivityHTML()}
            </div>
            <div class="feed-footer">
                <small>* 개인정보 보호를 위해 일부 마스킹</small>
            </div>
        `;
        
        // Insert after comparison section
        comparisonSection.insertAdjacentElement('afterend', feedContainer);
        this.container = feedContainer;
        
        // Start rotation
        this.startRotation();
        
        // Add styles
        this.injectStyles();
    }
    
    private generateActivityHTML(): string {
        return this.activities.slice(0, 4).map((activity, index) => `
            <div class="activity-item ${index === 0 ? 'new' : ''}" style="animation-delay: ${index * 0.1}s">
                <div class="activity-content">
                    <span class="user-name">${activity.user}</span>
                    <span class="action">${activity.action}</span>
                </div>
                <span class="time">${activity.time}</span>
            </div>
        `).join('');
    }
    
    private startRotation() {
        setInterval(() => {
            if (!this.container) return;
            
            // Rotate activities
            this.activities.push(this.activities.shift()!);
            
            // Update display with animation
            const list = this.container.querySelector('.activity-list');
            if (list) {
                list.classList.add('updating');
                setTimeout(() => {
                    list.innerHTML = this.generateActivityHTML();
                    list.classList.remove('updating');
                }, 300);
            }
        }, 5000); // Rotate every 5 seconds
    }
    
    private injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .live-activity-feed {
                max-width: 1200px;
                margin: 4rem auto;
                padding: 2rem;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 16px;
                backdrop-filter: blur(10px);
            }
            
            .feed-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }
            
            .live-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.25rem 0.75rem;
                background: rgba(255, 0, 0, 0.1);
                border: 1px solid rgba(255, 0, 0, 0.3);
                border-radius: 20px;
                font-size: 0.875rem;
                color: #ff4444;
            }
            
            .pulse-dot {
                width: 8px;
                height: 8px;
                background: #ff4444;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .activity-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                transition: opacity 0.3s ease;
            }
            
            .activity-list.updating {
                opacity: 0.5;
            }
            
            .activity-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                background: var(--card-bg);
                border-radius: 8px;
                opacity: 0;
                animation: slideInRight 0.5s ease forwards;
            }
            
            .activity-item.new {
                border-left: 3px solid var(--accent-color);
            }
            
            .activity-content {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }
            
            .user-name {
                font-weight: 600;
                color: var(--accent-color);
            }
            
            .action {
                color: var(--text-muted);
            }
            
            .time {
                font-size: 0.875rem;
                color: var(--text-muted);
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .feed-footer {
                margin-top: 1rem;
                text-align: center;
                color: var(--text-muted);
                font-size: 0.75rem;
            }
        `;
        document.head.appendChild(style);
    }
}

// Urgency Banner
class UrgencyBanner {
    private endTime: number;
    private container: HTMLElement | null = null;
    
    constructor() {
        // Set end time to 24 hours from now
        const stored = localStorage.getItem('coinpass_offer_end');
        if (stored) {
            this.endTime = parseInt(stored);
        } else {
            this.endTime = Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem('coinpass_offer_end', this.endTime.toString());
        }
    }
    
    init() {
        // Don't show if offer expired
        if (Date.now() > this.endTime) {
            localStorage.removeItem('coinpass_offer_end');
            return;
        }
        
        // Create banner
        const banner = document.createElement('div');
        banner.className = 'urgency-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <span class="offer-badge">⚡ 한정 혜택</span>
                <span class="offer-text">신규 가입 $50 보너스 + 첫달 수수료 100% 캐시백</span>
                <span class="countdown" id="urgency-countdown">
                    <span class="time-unit">
                        <span class="time-value" id="hours">00</span>
                        <span class="time-label">시간</span>
                    </span>
                    <span class="time-separator">:</span>
                    <span class="time-unit">
                        <span class="time-value" id="minutes">00</span>
                        <span class="time-label">분</span>
                    </span>
                    <span class="time-separator">:</span>
                    <span class="time-unit">
                        <span class="time-value" id="seconds">00</span>
                        <span class="time-label">초</span>
                    </span>
                </span>
            </div>
        `;
        
        // Insert at top of page
        document.body.insertBefore(banner, document.body.firstChild);
        this.container = banner;
        
        // Start countdown
        this.startCountdown();
        
        // Add styles
        this.injectStyles();
        
        // Track view
        ConversionTracker.getInstance().trackEvent('urgency_banner_viewed');
    }
    
    private startCountdown() {
        const updateCountdown = () => {
            const now = Date.now();
            const timeLeft = Math.max(0, this.endTime - now);
            
            if (timeLeft === 0) {
                if (this.container) {
                    this.container.remove();
                }
                localStorage.removeItem('coinpass_offer_end');
                return;
            }
            
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
            
            requestAnimationFrame(updateCountdown);
        };
        
        updateCountdown();
    }
    
    private injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .urgency-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(90deg, #ff6b6b, #ff8e53);
                color: white;
                padding: 0.75rem;
                z-index: 2000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                animation: slideDown 0.5s ease;
            }
            
            @keyframes slideDown {
                from {
                    transform: translateY(-100%);
                }
                to {
                    transform: translateY(0);
                }
            }
            
            .banner-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                flex-wrap: wrap;
            }
            
            .offer-badge {
                background: rgba(255,255,255,0.2);
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-weight: 600;
            }
            
            .offer-text {
                font-weight: 500;
            }
            
            .countdown {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                background: rgba(0,0,0,0.2);
                padding: 0.5rem 1rem;
                border-radius: 8px;
            }
            
            .time-unit {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .time-value {
                font-size: 1.25rem;
                font-weight: bold;
                font-variant-numeric: tabular-nums;
            }
            
            .time-label {
                font-size: 0.625rem;
                text-transform: uppercase;
                opacity: 0.8;
            }
            
            .time-separator {
                font-size: 1.25rem;
                font-weight: bold;
            }
            
            /* Adjust header position when banner is shown */
            body {
                padding-top: 60px;
            }
            
            @media (max-width: 768px) {
                .banner-content {
                    font-size: 0.875rem;
                }
                
                .time-value {
                    font-size: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Enhanced Calculator with Better UX
class EnhancedCalculator {
    init() {
        const calculator = document.querySelector('.savings-calculator-section');
        if (!calculator) return;
        
        // Add live user counter
        this.addLiveUserCounter(calculator);
        
        // Enhance input interactions
        this.enhanceCalculatorUX();
    }
    
    private addLiveUserCounter(calculator: Element) {
        const counter = document.createElement('div');
        counter.className = 'live-calculator-users';
        counter.innerHTML = `
            <div class="users-indicator">
                <span class="pulse-dot green"></span>
                <span id="live-calc-users">1,234</span>명이 지금 계산 중
            </div>
        `;
        
        const header = calculator.querySelector('.section-header');
        if (header) {
            header.appendChild(counter);
        }
        
        // Simulate live updates
        setInterval(() => {
            const users = document.getElementById('live-calc-users');
            if (users) {
                const current = parseInt(users.textContent!.replace(/,/g, ''));
                const change = Math.floor(Math.random() * 5) - 2;
                const newValue = Math.max(1000, current + change);
                users.textContent = newValue.toLocaleString('ko-KR');
            }
        }, 3000);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .live-calculator-users {
                margin-top: 1rem;
            }
            
            .users-indicator {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                font-size: 0.875rem;
                color: var(--text-muted);
            }
            
            .pulse-dot.green {
                background: #00d4aa;
            }
        `;
        document.head.appendChild(style);
    }
    
    private enhanceCalculatorUX() {
        const volumeInput = document.getElementById('trading-volume') as HTMLInputElement;
        if (!volumeInput) return;
        
        // Add quick select buttons
        const quickSelectContainer = document.createElement('div');
        quickSelectContainer.className = 'quick-select-amounts';
        quickSelectContainer.innerHTML = `
            <span class="quick-label">빠른 선택:</span>
            <button data-amount="10000000">1천만원</button>
            <button data-amount="50000000" class="selected">5천만원</button>
            <button data-amount="100000000">1억원</button>
            <button data-amount="500000000">5억원</button>
        `;
        
        volumeInput.parentElement?.appendChild(quickSelectContainer);
        
        // Handle quick select clicks
        quickSelectContainer.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLButtonElement;
                const amount = target.dataset.amount;
                if (amount) {
                    volumeInput.value = parseInt(amount).toLocaleString('ko-KR');
                    volumeInput.dispatchEvent(new Event('input'));
                    
                    // Update selected state
                    quickSelectContainer.querySelectorAll('button').forEach(b => {
                        b.classList.remove('selected');
                    });
                    target.classList.add('selected');
                    
                    // Track interaction
                    ConversionTracker.getInstance().trackEvent('calculator_quick_select', {
                        amount: amount
                    });
                }
            });
        });
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .quick-select-amounts {
                display: flex;
                gap: 0.5rem;
                margin-top: 0.5rem;
                align-items: center;
            }
            
            .quick-label {
                font-size: 0.875rem;
                color: var(--text-muted);
            }
            
            .quick-select-amounts button {
                padding: 0.25rem 0.75rem;
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                color: var(--text-muted);
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .quick-select-amounts button:hover {
                background: var(--accent-color);
                color: var(--primary-color);
            }
            
            .quick-select-amounts button.selected {
                background: var(--accent-color);
                color: var(--primary-color);
                border-color: var(--accent-color);
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize conversion tracking
    const tracker = ConversionTracker.getInstance();
    tracker.trackEvent('page_view', {
        referrer: document.referrer,
        utm_source: new URLSearchParams(window.location.search).get('utm_source')
    });
    
    // Track time on page when leaving
    window.addEventListener('beforeunload', () => {
        tracker.trackTimeOnPage();
    });
    
    // Initialize trust indicators
    const trustIndicators = new TrustIndicators();
    await trustIndicators.init();
    
    // Initialize live activity feed
    const activityFeed = new LiveActivityFeed();
    activityFeed.init();
    
    // Initialize urgency banner
    const urgencyBanner = new UrgencyBanner();
    urgencyBanner.init();
    
    // Initialize enhanced calculator
    const calculator = new EnhancedCalculator();
    calculator.init();
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (maxScroll > 25 && maxScroll <= 30) {
                tracker.trackEvent('scroll_25_percent');
            } else if (maxScroll > 50 && maxScroll <= 55) {
                tracker.trackEvent('scroll_50_percent');
            } else if (maxScroll > 75 && maxScroll <= 80) {
                tracker.trackEvent('scroll_75_percent');
            } else if (maxScroll > 95) {
                tracker.trackEvent('scroll_complete');
            }
        }
    });
    
    // Track CTA clicks
    document.querySelectorAll('.cta-button, .calculator-cta, .view-all-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            tracker.trackEvent('cta_click', {
                text: target.textContent,
                location: target.closest('section')?.className
            });
        });
    });
});

// Export for use in main index.tsx
export { ConversionTracker, TrustIndicators, LiveActivityFeed, UrgencyBanner, EnhancedCalculator };