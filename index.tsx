// Three.js 타입을 사용하기 위해 선언 (TypeScript 환경)
declare const THREE: any;

import { supabase } from './supabaseClient';
import { SecurityUtils } from './security-utils';

let heroData: any = null;
let popupData: any = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadHeroData();
    await loadPopupData();
    setupEventListeners();
    setupScrollAnimations();
    startTypingAnimation();
    setupThreeJSScene();
    setupPopup();
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
    private text: string;
    private typingSpeed: number = 100;
    private delayBetweenCycles: number = 2000;

    constructor(element: HTMLElement, text: string) {
        this.element = element;
        this.text = text;
    }

    public startTyping() {
        this.typeText(this.text);
    }

    private async typeText(text: string) {
        this.element.textContent = '';
        
        // Typing effect
        for (let i = 0; i <= text.length; i++) {
            this.element.textContent = text.substring(0, i);
            await this.sleep(this.typingSpeed);
        }
        
        await this.sleep(this.delayBetweenCycles);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

let typingAnimator: TypingAnimator | null = null;

function startTypingAnimation() {
    const heroTitle = document.getElementById('hero-title');
    if (!heroTitle || !heroData) return;

    // 관리자가 설정한 텍스트 사용, 없으면 기본값 사용
    const titleText = heroData.title?.ko || '코인패스와 함께하는 스마트한 암호화폐 투자';
    
    // 여러 줄로 설정된 경우 첫 번째 줄만 사용하거나 전체 텍스트 사용
    const text = typeof titleText === 'string' ? titleText : String(titleText);

    typingAnimator = new TypingAnimator(heroTitle as HTMLElement, text);
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
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshStandardMaterial({ 
        color: '#00d4aa',
        metalness: 0.7,
        roughness: 0.4 
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

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

        torusKnot.rotation.y = .5 * elapsedTime;
        torusKnot.rotation.x = .2 * elapsedTime;
        
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