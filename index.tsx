// Three.js 제거 - 이미지로 대체

import { supabase, DatabaseUtils } from './supabaseClient';
import { SecurityUtils } from './security-utils';
import { ErrorHandler, setupGlobalErrorHandling, handleAsyncError } from './error-handler';
import { startPerformanceMonitoring } from './performance-monitor';

// 성능 최적화를 위한 상수들
const DEBOUNCE_DELAY = 250;

// 타입 정의
interface HeroData {
    title: {
        ko: string;
    };
    subtitle: {
        ko: string;
    };
}

interface PopupData {
    enabled: boolean;
    type: 'text' | 'image';
    content: {
        ko: string;
    };
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
}

let heroData: HeroData | null = null;
let popupData: PopupData | null = null;

// Enhanced caching with LRU implementation
class LRUCache {
    private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
    private maxSize = 50;
    
    get(key: string): any | null {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, item);
        return item.data;
    }
    
    set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
        // Remove oldest if at capacity
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        
        this.cache.set(key, { data, timestamp: Date.now(), ttl });
    }
    
    clear(): void {
        this.cache.clear();
    }
}

const dataCache = new LRUCache();
const CACHE_TTL = 5 * 60 * 1000; // 5분

// 전역 에러 핸들러 설정
setupGlobalErrorHandling();

// 성능 모니터링 시작
startPerformanceMonitoring();

// 모바일 터치 피드백 시스템 초기화
setupMobileTouchFeedback();

document.addEventListener('DOMContentLoaded', handleAsyncError(async () => {
    try {
        showLoadingState(true);
        
        // 즉시 기본 타이핑 애니메이션 시작 (데이터 로딩 전)
        startTypingAnimationWithDefaults();
        
        // 데이터베이스 연결 상태 확인
        const isConnected = await DatabaseUtils.checkConnection();
        if (!isConnected) {
            ErrorHandler.getInstance().showWarning('데이터베이스 연결에 문제가 있습니다. 일부 기능이 제한될 수 있습니다.');
        }
        
        // 병렬 데이터 로딩 with 개별 에러 처리
        const [heroResult, popupResult] = await Promise.allSettled([
            loadHeroData(),
            loadPopupData()
        ]);
        
        // 실패한 로딩 결과 처리
        if (heroResult.status === 'rejected') {
            ErrorHandler.getInstance().handleError(heroResult.reason, 'Hero Data Loading');
        }
        if (popupResult.status === 'rejected') {
            ErrorHandler.getInstance().handleError(popupResult.reason, 'Popup Data Loading');
        }
        
        setupEventListeners();
        setupScrollAnimations();
        // 데이터 로드 완료 후 실제 데이터로 타이핑 업데이트
        if (heroData) {
            startTypingAnimation();
        }
        // Three.js 제거 - 이미지로 대체됨
        setupPopup();
        setupSliders();
        // Theme setup is handled by theme-toggle.js
    } catch (error) {
        ErrorHandler.getInstance().handleError(error as Error, 'Page Initialization');
    } finally {
        showLoadingState(false);
    }
}));

// 캐시 유틸리티 함수
function getCachedData(key: string): any | null {
    return dataCache.get(key);
}

function setCachedData(key: string, data: any, ttl: number = CACHE_TTL): void {
    dataCache.set(key, data, ttl);
}

async function loadHeroData() {
    const cacheKey = 'hero-data';
    const cached = getCachedData(cacheKey);
    if (cached) {
        heroData = cached;
        return;
    }

    try {
        if (!supabase) {
            throw new Error('Supabase not configured');
        }
        const { data, error } = await supabase
            .from('page_contents')
            .select('content')
            .eq('page_type', 'hero')
            .single();

        const defaultData = {
            title: { ko: '코인패스와 함께하는 스마트한 암호화폐 투자' },
            subtitle: { ko: '' }
        };

        if (error) {
            console.error('Failed to load hero data:', error);
            heroData = defaultData;
        } else {
            const rawContent = data?.content || {};
            // Transform flat structure to expected nested structure
            heroData = {
                title: { ko: rawContent.title || defaultData.title.ko },
                subtitle: { ko: rawContent.subtitle || defaultData.subtitle.ko }
            };
            setCachedData(cacheKey, heroData);
        }
    } catch (error) {
        console.error('Error loading hero data:', error);
        heroData = {
            title: { ko: '코인패스와 함께하는 스마트한 암호화폐 투자' },
            subtitle: { ko: '' }
        };
    }
}

async function loadPopupData() {
    const cacheKey = 'popup-data';
    const cached = getCachedData(cacheKey);
    if (cached) {
        popupData = cached;
        return;
    }

    try {
        if (!supabase) {
            throw new Error('Supabase not configured');
        }
        const { data, error } = await supabase
            .from('page_contents')
            .select('content')
            .eq('page_type', 'popup')
            .single();

        if (error) {
            console.error('Failed to load popup data:', error);
            popupData = null;
        } else {
            popupData = data?.content || null;
            if (popupData) {
                setCachedData(cacheKey, popupData);
            }
        }
    } catch (error) {
        console.error('Error loading popup data:', error);
        popupData = null;
    }
}

function setupEventListeners() {
    setupMobileMenu();
}

class TypingAnimator {
    private el!: HTMLElement;
    private phrases!: string[];
    private loopNum: number = 0;
    private typingSpeed: number = 100;
    private erasingSpeed: number = 50;
    private delayBetweenPhrases: number = 2000;
    private isPaused: boolean = false;
    private timeoutId: number | null = null;

    constructor(el: HTMLElement, phrases: string[]) {
        if (!el || !phrases || phrases.length === 0) return;
        this.el = el;
        this.phrases = phrases;
        this.tick();
    }

    public setPhrases(phrases: string[]) {
        this.phrases = phrases;
        this.loopNum = 0;
        if(this.timeoutId) clearTimeout(this.timeoutId);
        this.el.textContent = '';
        if(!this.isPaused) this.tick();
    }

    private tick = async () => {
        if (this.isPaused || !this.el.isConnected) return;
        const i = this.loopNum % this.phrases.length;
        const fullTxt = this.phrases[i];
        
        // 타이핑 애니메이션
        for (let j = 0; j < fullTxt.length; j++) {
            if (this.isPaused || !this.el.isConnected) return;
            this.el.textContent = fullTxt.substring(0, j + 1);
            await this.sleep(this.typingSpeed);
        }
        
        // 완성된 텍스트를 보여주는 시간
        await this.sleep(this.delayBetweenPhrases);
        
        // 삭제 애니메이션
        for (let j = fullTxt.length; j > 0; j--) {
            if (this.isPaused || !this.el.isConnected) return;
            this.el.textContent = fullTxt.substring(0, j - 1);
            await this.sleep(this.erasingSpeed);
        }
        
        // 다음 문구 시작 전 짧은 대기
        await this.sleep(500);
        
        this.loopNum++;
        this.timeoutId = window.setTimeout(this.tick, 0);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => { 
            this.timeoutId = window.setTimeout(resolve, ms); 
        });
    }
    
    public pause() { 
        this.isPaused = true; 
        if(this.timeoutId) clearTimeout(this.timeoutId); 
    }
    
    public resume() { 
        if(this.isPaused) { 
            this.isPaused = false; 
            this.tick(); 
        } 
    }
    
    public stop() {
        this.isPaused = true;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
}

let typingAnimator: TypingAnimator | null = null;

// 즉시 기본값으로 타이핑 시작
function startTypingAnimationWithDefaults() {
    const heroTitle = document.getElementById('hero-title');
    const heroSection = document.querySelector('.hero');
    if (!heroTitle) return;
    
    // 기존 애니메이션이 있다면 정지
    if (typingAnimator) {
        typingAnimator.stop();
        typingAnimator = null;
    }
    
    const defaultSentences = [
        '최대 50%까지 수수료 할인!',
        '최고의 혜택을 누구나 무료로!',
        '한번 등록하고 평생 혜택받기!'
    ];
    
    typingAnimator = new TypingAnimator(heroTitle as HTMLElement, defaultSentences);
    
    // Intersection Observer로 가시성에 따라 애니메이션 제어
    if(heroSection && typingAnimator){
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typingAnimator?.resume();
                } else {
                    typingAnimator?.pause();
                }
            });
        }, { threshold: 0.1 });
        observer.observe(heroSection);
    }
}

function startTypingAnimation() {
    const heroTitle = document.getElementById('hero-title');
    const heroSection = document.querySelector('.hero');
    if (!heroTitle || !heroData) return;

    // 관리자가 설정한 문장들 사용, 없으면 기본값 사용
    let sentences: string[] = [];
    
    if (heroData.title?.ko) {
        // 줄바꿈으로 구분된 여러 문장을 배열로 변환
        sentences = heroData.title.ko.split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0);
    }
    
    // 문장이 없으면 기본값 사용
    if (sentences.length === 0) {
        sentences = [
            '최대 50%까지 수수료 할인!',
            '최고의 혜택을 누구나 무료로!',
            '한번 등록하고 평생 혜택받기!'
        ];
    }

    // 기존 애니메이션이 있다면 새 문장으로 업데이트
    if (typingAnimator) {
        typingAnimator.setPhrases(sentences);
    } else {
        typingAnimator = new TypingAnimator(heroTitle as HTMLElement, sentences);
        
        // Intersection Observer로 가시성에 따라 애니메이션 제어
        if(heroSection && typingAnimator){
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        typingAnimator?.resume();
                    } else {
                        typingAnimator?.pause();
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(heroSection);
        }
    }
    
    // hero subtitle 업데이트
    const heroSubtitle = document.getElementById('hero-subtitle');
    if (heroSubtitle && heroData.subtitle?.ko) {
        heroSubtitle.textContent = SecurityUtils.sanitizeHtml(heroData.subtitle.ko);
    }
}




function setupScrollAnimations() {
    // Batch animation observations for better performance
    const animationQueue: Element[] = [];
    let rafId: number | null = null;
    
    const processAnimationQueue = () => {
        if (animationQueue.length === 0) {
            rafId = null;
            return;
        }
        
        // Process up to 5 elements per frame
        const batch = animationQueue.splice(0, 5);
        batch.forEach(element => {
            element.classList.add('is-visible');
        });
        
        rafId = requestAnimationFrame(processAnimationQueue);
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animationQueue.push(entry.target);
                observer.unobserve(entry.target);
                
                if (!rafId) {
                    rafId = requestAnimationFrame(processAnimationQueue);
                }
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading slightly before element is visible
    });
    
    // Use querySelectorAll more efficiently
    const elements = document.querySelectorAll('.anim-fade-in');
    elements.forEach(el => observer.observe(el));
}

function setupMobileMenu() {
    const hamburgerButton = document.querySelector('.hamburger-button') as HTMLButtonElement;
    const mainNav = document.getElementById('main-nav');
    
    if (!hamburgerButton || !mainNav) {
        console.warn('Hamburger menu elements not found');
        return;
    }
    
    // Toggle menu on hamburger click
    hamburgerButton.addEventListener('click', function() {
        const isActive = hamburgerButton.classList.contains('is-active');
        
        if (isActive) {
            // Close menu
            hamburgerButton.classList.remove('is-active');
            hamburgerButton.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            // Open menu
            hamburgerButton.classList.add('is-active');
            hamburgerButton.setAttribute('aria-expanded', 'true');
            mainNav.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const target = event.target as HTMLElement;
        if (!hamburgerButton.contains(target) && !mainNav.contains(target)) {
            if (hamburgerButton.classList.contains('is-active')) {
                hamburgerButton.classList.remove('is-active');
                hamburgerButton.setAttribute('aria-expanded', 'false');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && hamburgerButton.classList.contains('is-active')) {
            hamburgerButton.classList.remove('is-active');
            hamburgerButton.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && hamburgerButton.classList.contains('is-active')) {
            hamburgerButton.classList.remove('is-active');
            hamburgerButton.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking nav links
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerButton.classList.remove('is-active');
            mainNav.classList.remove('active');
            hamburgerButton.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

// Three.js 관련 코드 제거 - 이미지로 대체됨

// Three.js 관련 코드 모두 제거 - 정적 이미지로 대체됨

function setupPopup() {
    if (!popupData || !popupData.enabled) return;
    
    const hideUntil = localStorage.getItem('coinpass-index-popup-hide-until');
    if (hideUntil && Date.now() < parseInt(hideUntil, 10)) return;

    const now = new Date();
    const startDate = popupData.startDate ? new Date(popupData.startDate) : null;
    const endDate = popupData.endDate ? new Date(popupData.endDate) : null;
    if ((startDate && now < startDate) || (endDate && now > endDate)) return;

    const container = document.getElementById('popup-container');
    const imageEl = document.getElementById('popup-image');
    const textEl = document.getElementById('popup-text');
    const closeBtn = document.getElementById('popup-close');
    const close24hBtn = document.getElementById('popup-close-24h');
    const overlay = container?.querySelector('.popup-overlay');
    if (!container || !imageEl || !textEl || !closeBtn || !close24hBtn) return;
    
    const contentToDisplay = popupData.content ? popupData.content.ko : '';

    if (popupData.type === 'image' && popupData.imageUrl) {
        (imageEl as HTMLImageElement).src = popupData.imageUrl;
        (imageEl as HTMLElement).style.display = 'block';
        (textEl as HTMLElement).style.display = 'none';
    } else if (popupData.type === 'text' && contentToDisplay) {
        textEl.textContent = SecurityUtils.sanitizeHtml(contentToDisplay);
        (textEl as HTMLElement).style.display = 'block';
        (imageEl as HTMLElement).style.display = 'none';
    } else return;
    
    container.style.display = 'flex';
    const closePopup = () => container.style.display = 'none';
    closeBtn.onclick = closePopup;
    if(overlay) overlay.addEventListener('click', closePopup);
    close24hBtn.onclick = () => {
        localStorage.setItem('coinpass-index-popup-hide-until', (Date.now() + 24 * 60 * 60 * 1000).toString());
        closePopup();
    };
}

class CardSlider {
    private container: HTMLElement;
    private grid!: HTMLElement;
    private prevBtn!: HTMLElement;
    private nextBtn!: HTMLElement;
    private dots!: NodeListOf<HTMLElement>;
    private cards!: NodeListOf<HTMLElement>;
    private currentSlide: number = 0;
    private maxSlides!: number;
    private cardsPerSlide: number = 3;

    constructor(containerSelector: string) {
        this.container = document.querySelector(containerSelector)!;
        if (!this.container) return;

        this.grid = this.container.querySelector('.features-grid, .benefits-grid')!;
        this.prevBtn = this.container.querySelector('.slider-nav.prev')!;
        this.nextBtn = this.container.querySelector('.slider-nav.next')!;
        this.dots = this.container.querySelectorAll('.dot');
        this.cards = this.grid.querySelectorAll('.feature-card, .benefit-item');
        
        this.maxSlides = Math.ceil(this.cards.length / this.cardsPerSlide);
        
        this.setupEventListeners();
        this.updateSlider();
        this.updateDots();
    }

    private setupEventListeners() {
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Touch/swipe support
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;

        this.grid.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        this.grid.addEventListener('touchmove', (e) => {
            e.preventDefault();
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
        });

        this.grid.addEventListener('touchend', () => {
            const deltaX = startX - currentX;
            const deltaY = Math.abs(startY - currentY);
            
            // Only if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        });
    }

    private prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateSlider();
            this.updateDots();
        }
    }

    private nextSlide() {
        if (this.currentSlide < this.maxSlides - 1) {
            this.currentSlide++;
            this.updateSlider();
            this.updateDots();
        }
    }

    private goToSlide(slideIndex: number) {
        if (slideIndex >= 0 && slideIndex < this.maxSlides) {
            this.currentSlide = slideIndex;
            this.updateSlider();
            this.updateDots();
        }
    }

    private updateSlider() {
        const translateX = -(this.currentSlide * 100);
        this.grid.style.transform = `translateX(${translateX}%)`;
        
        // Update navigation buttons
        if (this.prevBtn) {
            this.prevBtn.style.display = this.currentSlide === 0 ? 'none' : 'flex';
        }
        if (this.nextBtn) {
            this.nextBtn.style.display = this.currentSlide === this.maxSlides - 1 ? 'none' : 'flex';
        }
    }

    private updateDots() {
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }
}

function setupSliders() {
    // Setup sliders based on screen size
    const setupSlidersForCurrentSize = () => {
        const width = window.innerWidth;
        if (width > 768) {
            // Desktop and tablet get sliders
            new CardSlider('.why-coinpass .slider-container');
        } else {
            // Mobile: reset transforms
            const grids = document.querySelectorAll('.benefits-grid');
            grids.forEach(grid => {
                (grid as HTMLElement).style.transform = 'translateX(0)';
            });
        }
    };

    setupSlidersForCurrentSize();
    
    // Handle window resize with debouncing
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => {
            setupSlidersForCurrentSize();
        }, DEBOUNCE_DELAY);
    });
}

// 유틸리티 함수들

function showLoadingState(show: boolean) {
    const existingLoader = document.getElementById('page-loader');
    
    if (show && !existingLoader) {
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = `
            <div class="loader-backdrop">
                <div class="loader-spinner">
                    <div class="spinner"></div>
                    <p>로딩 중...</p>
                </div>
            </div>
        `;
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .loader-backdrop {
                background: rgba(0, 0, 0, 0.8);
                border-radius: 12px;
                padding: 2rem;
                text-align: center;
            }
            .loader-spinner {
                color: white;
            }
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(255,255,255,0.3);
                border-left: 4px solid #00d4aa;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(loader);
        
    } else if (!show && existingLoader) {
        existingLoader.style.opacity = '0';
        setTimeout(() => {
            if (existingLoader.parentNode) {
                document.body.removeChild(existingLoader);
            }
        }, 300);
    }
}

// Theme Management (delegated to theme-toggle.js for consistency)

// 모바일 터치 피드백 시스템
function setupMobileTouchFeedback() {
    // 터치 피드백을 위한 CSS 스타일 동적 추가
    const touchStyles = document.createElement('style');
    touchStyles.textContent = `
        .touch-feedback {
            position: relative;
            overflow: hidden;
        }
        
        .touch-feedback::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(0, 212, 170, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
            pointer-events: none;
            z-index: 1;
        }
        
        .touch-feedback.touch-active::before {
            width: 300px;
            height: 300px;
        }
        
        .touch-ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(0, 212, 170, 0.4);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        /* 햅틱 피드백을 위한 미세한 진동 효과 */
        .haptic-feedback:active {
            transform: scale(0.98);
            filter: brightness(1.1);
        }
    `;
    document.head.appendChild(touchStyles);

    // 터치 가능한 요소들 감지 및 피드백 추가
    const touchableSelectors = [
        'button',
        '.cta-button',
        '.card-cta',
        '.hamburger-button',
        '#theme-toggle',
        '.nav-link',
        '.feature-link',
        '.slider-nav',
        '.dot',
        '.popup-actions button'
    ];

    // DOMContentLoaded 이벤트를 기다리지 않고 바로 실행 (이미 DOMContentLoaded 내에서 호출됨)
    touchableSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            setupElementTouchFeedback(element as HTMLElement);
        });
    });

    // 동적으로 생성되는 요소를 위한 이벤트 위임
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
}

function setupElementTouchFeedback(element: HTMLElement) {
    if (!element) return;
    
    element.classList.add('touch-feedback', 'haptic-feedback');
    
    element.addEventListener('touchstart', (e) => {
        createRippleEffect(e, element);
        // 진동 피드백 (지원되는 기기에서)
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    });
}

function createRippleEffect(event: TouchEvent, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('div');
    const size = Math.max(rect.width, rect.height);
    const touch = event.touches[0];
    
    if (!touch) return;
    
    const x = touch.clientX - rect.left - size / 2;
    const y = touch.clientY - rect.top - size / 2;
    
    ripple.classList.add('touch-ripple');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    // 애니메이션 후 제거
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

function handleTouchStart(event: TouchEvent) {
    const target = event.target as HTMLElement;
    if (target && isTouchableElement(target)) {
        target.classList.add('touch-active');
    }
}

function handleTouchEnd(event: TouchEvent) {
    const target = event.target as HTMLElement;
    if (target && isTouchableElement(target)) {
        setTimeout(() => {
            target.classList.remove('touch-active');
        }, 150);
    }
}

function isTouchableElement(element: HTMLElement): boolean {
    const touchableTypes = ['BUTTON', 'A', 'INPUT'];
    const touchableClasses = ['cta-button', 'card-cta', 'hamburger-button', 'clickable'];
    
    return touchableTypes.includes(element.tagName) || 
           touchableClasses.some(className => element.classList.contains(className)) ||
           element.hasAttribute('role') && ['button', 'link'].includes(element.getAttribute('role') || '');
}

// 모바일 전용 제스처 지원
function setupMobileGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        if (!e.changedTouches[0]) return;
        
        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // 스와이프 감지 (최소 50px 이동)
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                // 오른쪽 스와이프
                handleSwipeRight();
            } else {
                // 왼쪽 스와이프
                handleSwipeLeft();
            }
        }
    }, { passive: true });
}

function handleSwipeRight() {
    // 모바일 메뉴가 열려있으면 닫기
    const nav = document.getElementById('main-nav');
    const hamburger = document.querySelector('.hamburger-button');
    
    if (nav?.classList.contains('is-active')) {
        nav.classList.remove('is-active');
        hamburger?.classList.remove('is-active');
    }
    
    // 팝업이 열려있으면 닫기
    const popup = document.getElementById('popup-container');
    if (popup && popup.style.display !== 'none') {
        popup.style.display = 'none';
    }
}

function handleSwipeLeft() {
    // 왼쪽 스와이프 동작 (필요시 구현)
    // Left swipe detected
}

// 모바일 제스처 초기화
setupMobileGestures();