// Three.js 타입을 사용하기 위해 선언 (TypeScript 환경)
declare const THREE: any;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupScrollAnimations();
    startTypingAnimation();
    setupThreeJSScene(); 
});

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
    if (!heroTitle) return;

    const text = '코인패스와 함께하는 스마트한 암호화폐 투자';

    typingAnimator = new TypingAnimator(heroTitle as HTMLElement, text);
    typingAnimator.startTyping();
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