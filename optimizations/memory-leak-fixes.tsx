// Memory Leak Fixes for TypingAnimator and Event Listeners

// 1. Improved TypingAnimator with cleanup
class OptimizedTypingAnimator {
    private el: HTMLElement;
    private phrases: string[];
    private loopNum: number = 0;
    private typingSpeed: number = 100;
    private erasingSpeed: number = 50;
    private delayBetweenPhrases: number = 2000;
    private isPaused: boolean = false;
    private isDestroyed: boolean = false;
    private timeoutIds: Set<number> = new Set();
    private abortController: AbortController;
    private observer: IntersectionObserver | null = null;

    constructor(el: HTMLElement, phrases: string[]) {
        if (!el || !phrases || phrases.length === 0) return;
        this.el = el;
        this.phrases = phrases;
        this.abortController = new AbortController();
        this.setupVisibilityObserver();
        this.tick();
    }

    private setupVisibilityObserver() {
        // Automatically pause when not visible
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isDestroyed) {
                        this.resume();
                    } else {
                        this.pause();
                    }
                });
            },
            { threshold: 0.1 }
        );
        this.observer.observe(this.el);
    }

    private async tick() {
        if (this.isPaused || this.isDestroyed || !this.el.isConnected) return;
        
        const i = this.loopNum % this.phrases.length;
        const fullTxt = this.phrases[i];
        
        // Use RAF for smoother animations
        await this.typeText(fullTxt);
        await this.sleep(this.delayBetweenPhrases);
        await this.eraseText(fullTxt);
        await this.sleep(500);
        
        this.loopNum++;
        if (!this.isDestroyed) {
            requestAnimationFrame(() => this.tick());
        }
    }

    private async typeText(text: string) {
        for (let j = 0; j < text.length; j++) {
            if (this.isPaused || this.isDestroyed) return;
            this.el.textContent = text.substring(0, j + 1);
            await this.sleep(this.typingSpeed);
        }
    }

    private async eraseText(text: string) {
        for (let j = text.length; j > 0; j--) {
            if (this.isPaused || this.isDestroyed) return;
            this.el.textContent = text.substring(0, j - 1);
            await this.sleep(this.erasingSpeed);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => {
            const id = window.setTimeout(() => {
                this.timeoutIds.delete(id);
                resolve();
            }, ms);
            this.timeoutIds.add(id);
        });
    }

    public pause() {
        this.isPaused = true;
        this.clearAllTimeouts();
    }

    public resume() {
        if (this.isPaused && !this.isDestroyed) {
            this.isPaused = false;
            this.tick();
        }
    }

    public destroy() {
        this.isDestroyed = true;
        this.isPaused = true;
        this.clearAllTimeouts();
        
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        this.abortController.abort();
    }

    private clearAllTimeouts() {
        this.timeoutIds.forEach(id => clearTimeout(id));
        this.timeoutIds.clear();
    }
}

// 2. Event Listener Manager with automatic cleanup
class EventListenerManager {
    private listeners: Map<EventTarget, Map<string, Set<EventListener>>> = new Map();
    private abortControllers: Set<AbortController> = new Set();

    addEventListener(
        target: EventTarget,
        type: string,
        listener: EventListener,
        options?: AddEventListenerOptions
    ) {
        // Create AbortController for this listener
        const controller = new AbortController();
        this.abortControllers.add(controller);

        // Add listener with signal
        target.addEventListener(type, listener, {
            ...options,
            signal: controller.signal
        });

        // Track for manual cleanup if needed
        if (!this.listeners.has(target)) {
            this.listeners.set(target, new Map());
        }
        const targetListeners = this.listeners.get(target)!;
        if (!targetListeners.has(type)) {
            targetListeners.set(type, new Set());
        }
        targetListeners.get(type)!.add(listener);
    }

    removeAllListeners() {
        // Abort all listeners at once
        this.abortControllers.forEach(controller => controller.abort());
        this.abortControllers.clear();
        this.listeners.clear();
    }

    removeListenersForTarget(target: EventTarget) {
        const targetListeners = this.listeners.get(target);
        if (targetListeners) {
            targetListeners.forEach((listeners, type) => {
                listeners.forEach(listener => {
                    target.removeEventListener(type, listener);
                });
            });
            this.listeners.delete(target);
        }
    }
}

// 3. Optimized Touch Feedback System
class OptimizedTouchFeedback {
    private ripplePool: HTMLElement[] = [];
    private maxPoolSize = 10;
    private activeRipples = new Set<HTMLElement>();

    constructor() {
        this.initializePool();
    }

    private initializePool() {
        // Pre-create ripple elements to avoid DOM manipulation
        for (let i = 0; i < this.maxPoolSize; i++) {
            const ripple = document.createElement('div');
            ripple.className = 'touch-ripple pooled';
            ripple.style.display = 'none';
            document.body.appendChild(ripple);
            this.ripplePool.push(ripple);
        }
    }

    createRippleEffect(event: TouchEvent, element: HTMLElement) {
        const ripple = this.getPooledRipple();
        if (!ripple) return;

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const touch = event.touches[0];
        
        if (!touch) return;
        
        const x = touch.clientX - rect.left - size / 2;
        const y = touch.clientY - rect.top - size / 2;
        
        // Use CSS transforms for better performance
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.transform = `translate(${x}px, ${y}px) scale(0)`;
        ripple.style.display = 'block';
        
        element.appendChild(ripple);
        this.activeRipples.add(ripple);
        
        // Force reflow
        ripple.offsetHeight;
        
        // Animate using CSS
        ripple.style.transform = `translate(${x}px, ${y}px) scale(4)`;
        ripple.style.opacity = '0';
        
        // Return to pool after animation
        setTimeout(() => {
            this.returnToPool(ripple);
        }, 600);
    }

    private getPooledRipple(): HTMLElement | null {
        return this.ripplePool.find(r => !this.activeRipples.has(r)) || null;
    }

    private returnToPool(ripple: HTMLElement) {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
        ripple.style.display = 'none';
        ripple.style.transform = '';
        ripple.style.opacity = '1';
        this.activeRipples.delete(ripple);
        document.body.appendChild(ripple);
    }

    destroy() {
        this.ripplePool.forEach(ripple => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        });
        this.ripplePool = [];
        this.activeRipples.clear();
    }
}

// 4. Cleanup Manager for page lifecycle
class CleanupManager {
    private cleanupTasks: (() => void)[] = [];

    register(cleanupFn: () => void) {
        this.cleanupTasks.push(cleanupFn);
    }

    cleanup() {
        this.cleanupTasks.forEach(task => {
            try {
                task();
            } catch (error) {
                console.error('Cleanup error:', error);
            }
        });
        this.cleanupTasks = [];
    }
}

// Usage Example:
export function initializeOptimizedPage() {
    const cleanupManager = new CleanupManager();
    const eventManager = new EventListenerManager();
    const touchFeedback = new OptimizedTouchFeedback();
    
    // Initialize typing animator with cleanup
    const heroTitle = document.getElementById('hero-title');
    let typingAnimator: OptimizedTypingAnimator | null = null;
    
    if (heroTitle) {
        typingAnimator = new OptimizedTypingAnimator(heroTitle as HTMLElement, [
            '최대 50%까지 수수료 할인!',
            '최고의 혜택을 누구나 무료로!',
            '한번 등록하고 평생 혜택받기!'
        ]);
        cleanupManager.register(() => typingAnimator?.destroy());
    }
    
    // Setup event listeners with automatic cleanup
    eventManager.addEventListener(window, 'resize', () => {
        // Handle resize
    }, { passive: true });
    
    eventManager.addEventListener(document, 'touchstart', (e) => {
        const target = e.target as HTMLElement;
        touchFeedback.createRippleEffect(e as TouchEvent, target);
    }, { passive: true });
    
    cleanupManager.register(() => eventManager.removeAllListeners());
    cleanupManager.register(() => touchFeedback.destroy());
    
    // Setup page unload cleanup
    window.addEventListener('beforeunload', () => {
        cleanupManager.cleanup();
    });
    
    // Also cleanup on visibility change (mobile background)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            typingAnimator?.pause();
        } else {
            typingAnimator?.resume();
        }
    });
    
    return cleanupManager;
}