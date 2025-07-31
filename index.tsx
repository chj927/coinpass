// Three.js 타입을 사용하기 위해 선언 (TypeScript 환경)
declare const THREE: any;

import { supabase } from './supabaseClient';
import { SecurityUtils } from './security-utils';

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

// 전역 에러 핸들러
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showErrorToast('페이지 로딩 중 오류가 발생했습니다.');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showErrorToast('데이터 로딩 중 오류가 발생했습니다.');
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        showLoadingState(true);
        await Promise.all([
            loadHeroData(),
            loadPopupData()
        ]);
        
        setupEventListeners();
        setupScrollAnimations();
        startTypingAnimation();
        setupThreeJSScene();
        setupPopup();
        setupSliders();
    } catch (error) {
        console.error('Initialization error:', error);
        showErrorToast('페이지 초기화 중 오류가 발생했습니다.');
    } finally {
        showLoadingState(false);
    }
});

async function loadHeroData() {
    try {
        const { data, error } = await supabase
            .from('single_pages')
            .select('content')
            .eq('page_name', 'hero')
            .single();

        if (error) {
            console.error('Failed to load hero data:', error);
            // 기본값 사용
            heroData = {
                title: { ko: '코인패스와 함께하는 스마트한 암호화폐 투자' },
                subtitle: { ko: '' }
            };
        } else {
            heroData = data?.content || {
                title: { ko: '코인패스와 함께하는 스마트한 암호화폐 투자' },
                subtitle: { ko: '' }
            };
        }
    } catch (error) {
        console.error('Error loading hero data:', error);
        // 기본값 사용
        heroData = {
            title: { ko: '코인패스와 함께하는 스마트한 암호화폐 투자' },
            subtitle: { ko: '' }
        };
    }
}

async function loadPopupData() {
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
        console.log('Three.js is not loaded yet.');
        // 최대 10초 대기 후 포기
        const maxRetries = 100;
        let retryCount = 0;
        const checkThreeJS = () => {
            if (typeof THREE !== 'undefined') {
                initThreeJSScene();
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(checkThreeJS, 100);
            } else {
                console.warn('Three.js failed to load after 10 seconds');
            }
        };
        checkThreeJS();
        return;
    }
    initThreeJSScene();
}

function initThreeJSScene() {

    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const container = document.querySelector('.hero-3d-container') as HTMLElement;
    if (!container) return;

    // 1. Scene (장면)
    const scene = new THREE.Scene();

    // 2. Object (객체)
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({ 
        color: '#00d4aa',
        metalness: 0.6,
        roughness: 0.3 
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 3. Lights (조명)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 4. Camera (카메라)
    const sizes = {
        width: container.clientWidth,
        height: container.clientHeight
    };
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    camera.position.z = 4;
    scene.add(camera);

    // 5. Renderer (렌더러)
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 6. Animation Loop (애니메이션)
    const clock = new THREE.Clock();
    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        cube.rotation.y = .5 * elapsedTime;
        cube.rotation.x = .2 * elapsedTime;
        
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };
    tick();

    // 7. Responsive handling (반응형 처리)
    window.addEventListener('resize', () => {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
            sizes.width = container.clientWidth;
            sizes.height = container.clientHeight;

            camera.aspect = sizes.width / sizes.height;
            camera.updateProjectionMatrix();

            renderer.setSize(sizes.width, sizes.height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    });
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
        }, 250);
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