// Three.js 타입을 사용하기 위해 선언 (TypeScript 환경)
declare const THREE: any;

import { supabase, DatabaseUtils } from './supabaseClient';
import { SecurityUtils } from './security-utils';
import { ErrorHandler, setupGlobalErrorHandling, handleAsyncError } from './error-handler';
import { startPerformanceMonitoring } from './performance-monitor';

// 성능 최적화를 위한 상수들
const DEBOUNCE_DELAY = 250;
const THROTTLE_DELAY = 16;
const MAX_RETRIES = 3;

// 타입 정의
interface HeroData {
    title: {
        ko: string;
        en: string;
    };
    subtitle: {
        ko: string;
        en: string;
    };
}

interface PopupData {
    enabled: boolean;
    type: 'text' | 'image';
    content: {
        ko: string;
        en: string;
    };
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
}

let heroData: HeroData | null = null;
let popupData: PopupData | null = null;

// 캐싱을 위한 Map
const dataCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
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
        startTypingAnimation();
        setupThreeJSScene();
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
    const cached = dataCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
    }
    dataCache.delete(key);
    return null;
}

function setCachedData(key: string, data: any, ttl: number = CACHE_TTL): void {
    dataCache.set(key, { data, timestamp: Date.now(), ttl });
}

async function loadHeroData() {
    const cacheKey = 'hero-data';
    const cached = getCachedData(cacheKey);
    if (cached) {
        heroData = cached;
        return;
    }

    try {
        const { data, error } = await supabase
            .from('single_pages')
            .select('content')
            .eq('page_name', 'hero')
            .single();

        const defaultData = {
            title: { ko: '코인패스와 함께하는 스마트한 암호화폐 투자' },
            subtitle: { ko: '' }
        };

        if (error) {
            console.error('Failed to load hero data:', error);
            heroData = defaultData;
        } else {
            heroData = data?.content || defaultData;
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
        const { data, error } = await supabase
            .from('single_pages')
            .select('content')
            .eq('page_name', 'indexPopup')
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
    private element: HTMLElement;
    private sentences: string[];
    private currentIndex: number = 0;
    private typingSpeed: number = 100;
    private delayBetweenSentences: number = 2000;
    private delayBetweenCycles: number = 3000;
    private isAnimating: boolean = false;

    constructor(element: HTMLElement, sentences: string[]) {
        this.element = element;
        this.sentences = sentences.filter(s => s.trim().length > 0);
    }

    public startTyping() {
        if (this.sentences.length === 0) return;
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.animateLoop();
    }

    public stop() {
        this.isAnimating = false;
    }

    private async animateLoop() {
        while (this.isAnimating) {
            const sentence = this.sentences[this.currentIndex];
            await this.typeText(sentence);
            
            if (!this.isAnimating) break;
            
            await this.eraseText();
            
            if (!this.isAnimating) break;
            
            this.currentIndex = (this.currentIndex + 1) % this.sentences.length;
            
            if (this.currentIndex === 0) {
                await this.sleep(this.delayBetweenCycles);
            } else {
                await this.sleep(this.delayBetweenSentences);
            }
        }
    }

    private async typeText(text: string) {
        this.element.textContent = '';
        
        for (let i = 0; i <= text.length; i++) {
            if (!this.isAnimating) break;
            this.element.textContent = text.substring(0, i);
            await this.sleep(this.typingSpeed);
        }
        
        await this.sleep(this.delayBetweenSentences);
    }

    private async eraseText() {
        const text = this.element.textContent || '';
        
        for (let i = text.length; i >= 0; i--) {
            if (!this.isAnimating) break;
            this.element.textContent = text.substring(0, i);
            await this.sleep(this.typingSpeed * 0.5);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

let typingAnimator: TypingAnimator | null = null;

function startTypingAnimation() {
    const heroTitle = document.getElementById('hero-title');
    if (!heroTitle || !heroData) return;

    // 기존 애니메이션이 있다면 정지
    if (typingAnimator) {
        typingAnimator.stop();
    }

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

    typingAnimator = new TypingAnimator(heroTitle as HTMLElement, sentences);
    typingAnimator.startTyping();
    
    // hero subtitle 업데이트
    const heroSubtitle = document.getElementById('hero-subtitle');
    if (heroSubtitle && heroData.subtitle?.ko) {
        heroSubtitle.textContent = SecurityUtils.sanitizeHtml(heroData.subtitle.ko);
    }
}




function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.anim-fade-in').forEach(el => observer.observe(el));
}

function setupMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-button');
    const nav = document.getElementById('main-nav');
    
    if (!hamburgerBtn || !nav) return;
    
    hamburgerBtn.addEventListener('click', () => {
        const isActive = hamburgerBtn.classList.toggle('is-active');
        nav.classList.toggle('is-active', isActive);
        hamburgerBtn.setAttribute('aria-expanded', isActive.toString());
    });
    
    // Close menu when clicking nav links
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('is-active');
            nav.classList.remove('is-active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

/**
 * Three.js 씬을 설정하고 애니메이션을 시작하는 함수
 */
function setupThreeJSScene() {
    if (typeof THREE === 'undefined') {
        // Use window.THREE_LOADED flag for better performance
        const checkThreeJS = () => {
            if (typeof THREE !== 'undefined' || (window as any).THREE_LOADED) {
                initThreeJSScene();
            } else {
                // Use requestAnimationFrame for better performance than setTimeout
                requestAnimationFrame(checkThreeJS);
            }
        };
        
        // Start checking immediately
        checkThreeJS();
        
        // Fallback timeout
        setTimeout(() => {
            if (typeof THREE === 'undefined') {
                console.warn('Three.js failed to load within timeout');
            }
        }, 10000);
        return;
    }
    initThreeJSScene();
}

// Three.js 씬 관리 클래스
class ThreeJSManager {
    private scene: any = null;
    private renderer: any = null;
    private camera: any = null;
    private animationId: number | null = null;
    private resizeHandler: (() => void) | null = null;
    private isDestroyed = false;

    init() {
        const canvas = document.getElementById('webgl-canvas');
        if (!canvas) return;

        const container = document.querySelector('.hero-3d-container') as HTMLElement;
        if (!container) return;

        // 이미 초기화된 경우 정리 후 재초기화
        if (this.scene) {
            this.dispose();
        }

        // 1. Scene (장면)
        this.scene = new THREE.Scene();

        // 2. Object (객체) - 성능 최적화
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5); // 크기 최적화
        const material = new THREE.MeshStandardMaterial({ 
            color: '#00d4aa',
            metalness: 0.6,
            roughness: 0.3 
        });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);

        // 3. Lights (조명) - 최적화
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // 4. Camera (카메라)
        const sizes = {
            width: container.clientWidth,
            height: container.clientHeight
        };
        this.camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
        this.camera.position.z = 4;

        // 5. Renderer (렌더러) - 모바일 최적화
        const isMobile = window.innerWidth <= 768;
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: !isMobile, // 모바일에서 안티앨리어싱 비활성화
            powerPreference: isMobile ? 'low-power' : 'high-performance',
            precision: isMobile ? 'mediump' : 'highp', // 모바일에서 정밀도 낮춤
            preserveDrawingBuffer: false,
            premultipliedAlpha: false
        });
        this.renderer.setSize(sizes.width, sizes.height);
        this.renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = false; // 그림자 비활성화로 성능 향상
        
        // 모바일에서 추가 최적화
        if (isMobile) {
            this.renderer.setSize(sizes.width * 0.8, sizes.height * 0.8); // 해상도 20% 감소
        }

        // 6. Animation Loop (애니메이션) - 메모리 누수 방지
        const clock = new THREE.Clock();
        const tick = () => {
            if (this.isDestroyed) return;

            const elapsedTime = clock.getElapsedTime();
            cube.rotation.y = 0.3 * elapsedTime; // 회전 속도 최적화
            cube.rotation.x = 0.1 * elapsedTime;
            
            this.renderer.render(this.scene, this.camera);
            this.animationId = window.requestAnimationFrame(tick);
        };
        tick();

        // 7. Responsive handling (반응형 처리) - 디바운스 적용
        this.resizeHandler = this.debounce(() => {
            if (this.isDestroyed || !this.camera || !this.renderer) return;
            
            if (container.clientWidth > 0 && container.clientHeight > 0) {
                sizes.width = container.clientWidth;
                sizes.height = container.clientHeight;

                this.camera.aspect = sizes.width / sizes.height;
                this.camera.updateProjectionMatrix();

                this.renderer.setSize(sizes.width, sizes.height);
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }
        }, 100);
        
        window.addEventListener('resize', this.resizeHandler);

        // 페이지 언로드 시 정리
        window.addEventListener('beforeunload', () => {
            this.dispose();
        });
    }

    // 메모리 누수 방지를 위한 정리 함수
    dispose() {
        this.isDestroyed = true;

        // 애니메이션 중지
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // 이벤트 리스너 제거
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }

        // Three.js 객체 정리
        if (this.scene) {
            this.scene.traverse((object: any) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((material: any) => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            this.scene.clear();
        }

        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
        }

        this.scene = null;
        this.renderer = null;
        this.camera = null;
    }

    // 디바운스 유틸리티
    private debounce(func: Function, wait: number) {
        let timeout: number;
        return function executedFunction(...args: any[]) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = window.setTimeout(later, wait);
        };
    }
}

// 전역 Three.js 매니저 인스턴스
let threeJSManager: ThreeJSManager | null = null;

function initThreeJSScene() {
    if (!threeJSManager) {
        threeJSManager = new ThreeJSManager();
    }
    threeJSManager.init();
}

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
    private grid: HTMLElement;
    private prevBtn: HTMLElement;
    private nextBtn: HTMLElement;
    private dots: NodeListOf<HTMLElement>;
    private cards: NodeListOf<HTMLElement>;
    private currentSlide: number = 0;
    private maxSlides: number;
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
            new CardSlider('.features-section .slider-container');
            new CardSlider('.why-coinpass .slider-container');
        } else {
            // Mobile: reset transforms
            const grids = document.querySelectorAll('.features-grid, .benefits-grid');
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
function showErrorToast(message: string) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

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

    touchableSelectors.forEach(selector => {
        document.addEventListener('DOMContentLoaded', () => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                setupElementTouchFeedback(element as HTMLElement);
            });
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
    console.log('Left swipe detected');
}

// 모바일 제스처 초기화
setupMobileGestures();