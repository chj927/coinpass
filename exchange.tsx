import { apiClient } from './api-client';
import { SecurityUtils } from './security-utils';
import { analytics } from './analytics';

const uiStrings: Record<string, Record<string, string>> = {
    ko: {
        skipLink: '메인 콘텐츠로 건너뛰기',
        'nav.partners': '파트너 혜택',
        'nav.about': '서비스 소개',
        'nav.aboutSubtitle': '코인패스 이야기',
        'nav.howTo': '사용방법',
        'nav.howToSubtitle': '3단계 가이드',
        'nav.guides': '가이드',
        'nav.guidesSubtitle': '사용안내 및 이벤트',
        'nav.faq': '자주 묻는 질문',
        'hero.cta': '파트너 혜택 보기',
        'partners.title': '파트너 거래소',
        'howTo.title': '세 단계로 끝내는 수수료 혜택',
        'howTo.step1.title': '회원가입',
        'howTo.step1.desc': '본 사이트의 제휴 링크를 통해 원하는 거래소에 가입합니다.',
        'howTo.step2.title': '거래하기',
        'howTo.step2.desc': 'KYC 인증 후 자유롭게 거래를 합니다.',
        'howTo.step3.title': '혜택 적용',
        'howTo.step3.desc': '거래할 때마다 수수료 할인이 자동으로 적용됩니다.',
        'faq.title': '자주 묻는 질문 (FAQ)',
        'support.title': '고객센터',
        'support.desc': '서비스 이용 중 궁금한 점이나 불편한 점이 있으신가요?\n텔레그램으로 문의주시면 빠르게 답변해드리겠습니다.',
        'support.cta': '텔레그램 문의하기',
        'footer.disclaimer': '본 서비스는 정보 제공을 목적으로 하며, 투자를 권유하거나 보장하지 않습니다. 모든 투자의 최종 결정과 책임은 투자자 본인에게 있습니다.',
        'popup.close24h': '24시간 보지않기',
        'popup.close': '닫기',
        'card.cta': '가입하고 혜택받기',
    },
};

interface SiteData {
    hero?: {
        title: string;
        subtitle: string;
    };
    aboutUs?: {
        title: string;
        content: string;
    };
    exchanges?: any[];
    faqs?: any[];
    popup?: {
        enabled: boolean;
        type: 'text' | 'image';
        content: string;
        imageUrl: string;
        startDate: string;
        endDate: string;
    };
    support?: {
        telegramUrl: string;
    };
}

let siteData: SiteData = {};
const currentLang = 'ko';

document.addEventListener('DOMContentLoaded', async () => {
    setupLanguage();
    await loadRemoteContent();
    renderContent();
    setupEventListeners();
});

async function loadRemoteContent() {
    try {
        // Use API client instead of direct Supabase calls
        const [exchanges, faqsData] = await Promise.all([
            apiClient.getExchanges(),
            apiClient.getFAQs()
        ]);
        
        // Get site data for about section
        const aboutData = await apiClient.getSiteData('about');
        const singlePages = aboutData ? [aboutData] : [];
    
    siteData = {
        exchanges: exchanges || [],
        faqs: faqsData || [],
    };
    
    // Debug logging for aboutUs
    console.log('Loading page contents:', singlePages?.length, 'pages found');
    
    singlePages?.forEach((page: any) => {
        if(page.page_type && page.content) {
            // Map 'about' from database to 'aboutUs' in siteData
            if (page.page_type === 'about') {
                siteData.aboutUs = page.content;
                console.log('About/AboutUs data loaded:', page.content);
            } else {
                (siteData as any)[page.page_type] = page.content;
            }
        }
    });
    
    // Check if aboutUs was loaded
    if (!siteData.aboutUs) {
        console.warn('AboutUs data not found in page_contents (looking for page_type="about")');
    }
    } catch (error) {
        console.error('Failed to load site data:', error);
        // Track error
        analytics.trackError('Failed to load site data', error?.toString());
    }
}

function renderContent() {
    if (!siteData) return;
    setupHero(siteData.hero);
    updateAboutUs(siteData.aboutUs);
    const allExchanges = siteData.exchanges || [];
    populateExchangeGrid('exchange-grid', allExchanges);
    updateFaqs(siteData.faqs || []);
    updateSupportSection(siteData.support);
    setupPopup();
    setupScrollAnimations();
}

function setupEventListeners() {
    setupMobileMenu();
    setupNavigation();
}

function setupLanguage() {
    document.documentElement.lang = 'ko';
    translateUI();
}


function translateUI() {
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (key && uiStrings[currentLang][key]) {
            el.textContent = uiStrings[currentLang][key];
        }
    });
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
        for (let j = 0; j < fullTxt.length; j++) {
            if (this.isPaused || !this.el.isConnected) return;
            this.el.textContent = fullTxt.substring(0, j + 1);
            await this.sleep(this.typingSpeed);
        }
        await this.sleep(this.delayBetweenPhrases);
        for (let j = fullTxt.length; j > 0; j--) {
            if (this.isPaused || !this.el.isConnected) return;
            this.el.textContent = fullTxt.substring(0, j - 1);
            await this.sleep(this.erasingSpeed);
        }
        await this.sleep(500);
        this.loopNum++;
        this.timeoutId = window.setTimeout(this.tick, 0);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => { this.timeoutId = window.setTimeout(resolve, ms); });
    }
    public pause() { this.isPaused = true; if(this.timeoutId) clearTimeout(this.timeoutId); }
    public resume() { if(this.isPaused) { this.isPaused = false; this.tick(); } }
}

let heroAnimator: TypingAnimator | undefined;
function setupHero(heroData: any) {
    const titleEl = document.getElementById('hero-title');
    const subtitleEl = document.getElementById('hero-subtitle');
    const heroSection = document.querySelector('.hero');
    if (!heroData) return;

    if (titleEl && heroData.title) {
        const sanitizedTitle = SecurityUtils.sanitizeHtml(heroData.title);
        const phrases = sanitizedTitle.split('\n').filter(p => p.trim() !== '');
        if (!heroAnimator) {
             heroAnimator = new TypingAnimator(titleEl as HTMLElement, phrases);
             if(heroSection){
                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => entry.isIntersecting ? heroAnimator?.resume() : heroAnimator?.pause());
                });
                observer.observe(heroSection);
            }
        } else {
            heroAnimator.setPhrases(phrases);
        }
    }
    
    if (subtitleEl && heroData.subtitle) subtitleEl.textContent = heroData.subtitle;
}

function updateAboutUs(aboutUsData: any) {
    const titleEl = document.getElementById('about-us-title');
    const contentEl = document.getElementById('about-us-content');
    
    // Debug logging
    console.log('UpdateAboutUs called with:', aboutUsData);
    
    if (!aboutUsData) {
        console.warn('No aboutUs data provided to updateAboutUs function');
        
        // Set default content if no data
        if (titleEl) {
            titleEl.textContent = '서비스 소개';
        }
        if (contentEl) {
            contentEl.innerHTML = '<p>코인패스는 암호화폐 거래소 수수료 할인 서비스입니다.</p>';
        }
        return;
    }

    if (titleEl && aboutUsData.title) {
        titleEl.textContent = SecurityUtils.sanitizeHtml(aboutUsData.title || '');
        console.log('AboutUs title updated:', aboutUsData.title);
    }
    if (contentEl && aboutUsData.content) {
        contentEl.innerHTML = '';
        const fragment = document.createDocumentFragment();
        const sanitizedContent = SecurityUtils.sanitizeHtml(aboutUsData.content || '');
        const paragraphs = sanitizedContent.split(/\n\s*\n/).filter(p => p.trim() !== '');
        paragraphs.forEach(pText => {
            const p = document.createElement('p');
            p.textContent = pText;
            fragment.appendChild(p);
        });
        contentEl.appendChild(fragment);
        console.log('AboutUs content updated with', paragraphs.length, 'paragraphs');
    }
}

function populateExchangeGrid(gridId: string, exchangesData: any[]) {
    const gridEl = document.getElementById(gridId);
    if (!gridEl || !exchangesData) return;
    
    const fragment = document.createDocumentFragment();
    exchangesData.forEach(exchange => {
        const card = document.createElement('div');
        card.className = 'exchange-card anim-fade-in';
        
        // XSS 방지를 위한 데이터 sanitization
        const name = SecurityUtils.sanitizeHtml(exchange.name_ko || '');
        const benefit1Tag = SecurityUtils.sanitizeHtml(exchange.benefit1_tag_ko || '');
        const benefit1Value = SecurityUtils.sanitizeHtml(exchange.benefit1_value_ko || '');
        const benefit2Tag = SecurityUtils.sanitizeHtml(exchange.benefit2_tag_ko || '');
        const benefit2Value = SecurityUtils.sanitizeHtml(exchange.benefit2_value_ko || '');
        const benefit3Tag = SecurityUtils.sanitizeHtml(exchange.benefit3_tag_ko || '');
        const benefit3Value = SecurityUtils.sanitizeHtml(exchange.benefit3_value_ko || '');
        const benefit4Tag = SecurityUtils.sanitizeHtml(exchange.benefit4_tag_ko || '');
        const benefit4Value = SecurityUtils.sanitizeHtml(exchange.benefit4_value_ko || '');

        let logoHtml = '';
        if (exchange.logoimageurl && SecurityUtils.isValidUrl(exchange.logoimageurl)) {
            const sanitizedUrl = SecurityUtils.sanitizeHtml(exchange.logoimageurl);
            logoHtml = `<div class="exchange-logo"><img src="${sanitizedUrl}" alt="${name} logo" loading="lazy" onerror="this.style.display='none'"></div>`;
        } else {
            logoHtml = `<div class="exchange-logo exchange-logo-text">${name?.substring(0, 3).toUpperCase() || 'N/A'}</div>`;
        }

        // 혜택 항목들을 배열로 정리
        const benefits = [
            { tag: benefit1Tag, value: benefit1Value },
            { tag: benefit2Tag, value: benefit2Value },
            { tag: benefit3Tag, value: benefit3Value },
            { tag: benefit4Tag, value: benefit4Value }
        ];

        // 빈 값이 아닌 혜택들만 필터링
        const validBenefits = benefits.filter(benefit => benefit.tag && benefit.value);
        
        // 혜택 리스트 HTML 생성
        const benefitsHtml = validBenefits.map(benefit => 
            `<li><span class="tag">${benefit.tag}</span> <strong>${benefit.value}</strong></li>`
        ).join('');

        card.innerHTML = `
            <div class="card-header">
                ${logoHtml}
                <h4>${name}</h4>
            </div>
            <ul class="benefits-list">
                ${benefitsHtml}
            </ul>
            <a href="${SecurityUtils.isValidUrl(exchange.link) ? SecurityUtils.sanitizeHtml(exchange.link) : '#'}" class="card-cta" target="_blank" rel="noopener noreferrer nofollow" data-exchange-name="${name}">${uiStrings[currentLang]['card.cta']}</a>
        `;
        
        // Add click tracking for exchange links
        const ctaButton = card.querySelector('.card-cta');
        if (ctaButton) {
            ctaButton.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const exchangeName = target.getAttribute('data-exchange-name') || 'Unknown';
                const link = target.getAttribute('href') || '';
                
                // Track the exchange click
                analytics.trackExchangeClick(exchangeName, link);
                analytics.trackConversion('exchange_referral', undefined);
            });
        }
        
        fragment.appendChild(card);
    });
    gridEl.innerHTML = '';
    gridEl.appendChild(fragment);
}


function updateFaqs(faqsData: any[]) {
    const faqContainerEl = document.getElementById('faq-container');
    if (!faqContainerEl || !faqsData) return;
    
    const fragment = document.createDocumentFragment();
    faqsData.forEach(faq => {
        const details = document.createElement('details');
        details.className = 'anim-fade-in';
        const summary = document.createElement('summary');
        summary.textContent = SecurityUtils.sanitizeHtml(faq.question_ko || '');
        const contentDiv = document.createElement('div');
        contentDiv.className = 'faq-content';
        const p = document.createElement('p');
        p.textContent = SecurityUtils.sanitizeHtml(faq.answer_ko || '');
        contentDiv.appendChild(p);
        details.appendChild(summary);
        details.appendChild(contentDiv);
        fragment.appendChild(details);
    });
    faqContainerEl.innerHTML = '';
    faqContainerEl.appendChild(fragment);
}

function updateSupportSection(supportData: any) {
    const linkEl = document.getElementById('telegram-support-link');
    if (linkEl && supportData?.telegramUrl) {
        linkEl.setAttribute('href', supportData.telegramUrl);
    }
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries, observer) => {
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

function setupNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (this: HTMLAnchorElement, e) {
            const href = this.getAttribute('href');
            if(href && href !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

function setupPopup() {
    if (!siteData.popup || !siteData.popup.enabled) return;
    const hideUntil = localStorage.getItem('coinpass-popup-hide-until');
    if (hideUntil && Date.now() < parseInt(hideUntil, 10)) return;

    const now = new Date();
    const startDate = siteData.popup.startDate ? new Date(siteData.popup.startDate) : null;
    const endDate = siteData.popup.endDate ? new Date(siteData.popup.endDate) : null;
    if ((startDate && now < startDate) || (endDate && now > endDate)) return;

    const container = document.getElementById('popup-container');
    const imageEl = document.getElementById('popup-image');
    const textEl = document.getElementById('popup-text');
    const closeBtn = document.getElementById('popup-close');
    const close24hBtn = document.getElementById('popup-close-24h');
    const overlay = container?.querySelector('.popup-overlay');
    if (!container || !imageEl || !textEl || !closeBtn || !close24hBtn) return;
    
    const contentToDisplay = siteData.popup.content || '';

    if (siteData.popup.type === 'image' && siteData.popup.imageUrl) {
        (imageEl as HTMLImageElement).src = siteData.popup.imageUrl;
        (imageEl as HTMLElement).style.display = 'block';
        (textEl as HTMLElement).style.display = 'none';
    } else if (siteData.popup.type === 'text' && contentToDisplay) {
        textEl.textContent = contentToDisplay;
        (textEl as HTMLElement).style.display = 'block';
        (imageEl as HTMLElement).style.display = 'none';
    } else return;
    
    container.style.display = 'flex';
    const closePopup = () => container.style.display = 'none';
    closeBtn.onclick = closePopup;
    if(overlay) overlay.addEventListener('click', closePopup);
    close24hBtn.onclick = () => {
        localStorage.setItem('coinpass-popup-hide-until', (Date.now() + 24 * 60 * 60 * 1000).toString());
        closePopup();
    };
}