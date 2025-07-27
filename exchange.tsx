import { supabase } from './supabaseClient';
import { SecurityUtils } from './security-utils';

const uiStrings = {
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
        'cex.title': '파트너 거래소 (CEX)',
        'dex.title': '파트너 거래소 (DEX)',
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
    en: {
        skipLink: 'Skip to main content',
        'nav.partners': 'Partner Benefits',
        'nav.about': 'About Us',
        'nav.aboutSubtitle': 'The Coinpass Story',
        'nav.howTo': 'How to Use',
        'nav.howToSubtitle': '3-Step Guide',
        'nav.guides': 'Guides',
        'nav.guidesSubtitle': 'Info & Events',
        'nav.faq': 'FAQ',
        'hero.cta': 'View Partner Benefits',
        'cex.title': 'Partner Exchanges (CEX)',
        'dex.title': 'Partner Exchanges (DEX)',
        'howTo.title': 'Fee Benefits in Three Steps',
        'howTo.step1.title': 'Sign Up',
        'howTo.step1.desc': 'Sign up for the desired exchange through the affiliate link on this site.',
        'howTo.step2.title': 'Trade',
        'howTo.step2.desc': 'Trade freely after completing KYC verification.',
        'howTo.step3.title': 'Benefit Applied',
        'howTo.step3.desc': 'Fee discounts are automatically applied with every trade.',
        'faq.title': 'Frequently Asked Questions (FAQ)',
        'support.title': 'Customer Support',
        'support.desc': 'Have questions or issues while using the service?\nContact us on Telegram for a quick response.',
        'support.cta': 'Contact on Telegram',
        'footer.disclaimer': 'This service is for informational purposes only and does not constitute an investment recommendation or guarantee. The final decision and responsibility for all investments lie with the investor.',
        'popup.close24h': 'Don\'t show for 24 hours',
        'popup.close': 'Close',
        'card.cta': 'Sign Up & Get Benefits',
    }
};

let siteData = {};
let currentLang = 'ko';

document.addEventListener('DOMContentLoaded', async () => {
    setupLanguage();
    await loadRemoteContent();
    renderContent();
    setupEventListeners();
});

async function loadRemoteContent() {
    const { data: cex, error: cexError } = await supabase.from('cex_exchanges').select('*').order('id');
    const { data: dex, error: dexError } = await supabase.from('dex_exchanges').select('*').order('id');
    const { data: faqsData, error: faqsError } = await supabase.from('faqs').select('*').order('id');
    const { data: singlePages, error: singlePagesError } = await supabase.from('single_pages').select('*');

    if (cexError || dexError || faqsError || singlePagesError) {
        console.error("Failed to load site data from Supabase", { cexError, dexError, faqsError, singlePagesError });
        return;
    }
    
    siteData = {
        exchanges: cex || [],
        dexExchanges: dex || [],
        faqs: faqsData || [],
    };
    
    singlePages?.forEach(page => {
        if(page.page_name && page.content) {
            siteData[page.page_name] = page.content;
        }
    });
}

function renderContent() {
    if (!siteData) return;
    setupHero(siteData.hero);
    updateAboutUs(siteData.aboutUs);
    populateExchangeGrid('exchange-grid', siteData.exchanges);
    populateExchangeGrid('dex-grid', siteData.dexExchanges);
    updateFaqs(siteData.faqs);
    updateSupportSection(siteData.support);
    setupPopup();
    setupScrollAnimations();
}

function setupEventListeners() {
    setupMobileMenu();
    setupNavigation();
}

function setupLanguage() {
    const savedLang = localStorage.getItem('coinpass-lang');
    const browserLang = navigator.language.startsWith('en') ? 'en' : 'ko';
    currentLang = savedLang || browserLang;
    document.getElementById('lang-ko')?.addEventListener('click', () => setLanguage('ko'));
    document.getElementById('lang-en')?.addEventListener('click', () => setLanguage('en'));
    setLanguage(currentLang);
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('coinpass-lang', lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-ko')?.classList.toggle('active', lang === 'ko');
    document.getElementById('lang-en')?.classList.toggle('active', lang === 'en');
    translateUI();
    renderContent();
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
    private el: HTMLElement;
    private phrases: string[];
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

let heroAnimator;
function setupHero(heroData) {
    const titleEl = document.getElementById('hero-title');
    const subtitleEl = document.getElementById('hero-subtitle');
    const heroSection = document.querySelector('.hero');
    if (!heroData) return;

    if (titleEl && heroData.title && heroData.title[currentLang]) {
        const sanitizedTitle = SecurityUtils.sanitizeHtml(heroData.title[currentLang]);
        const phrases = sanitizedTitle.split('\n').filter(p => p.trim() !== '');
        if (!heroAnimator) {
             heroAnimator = new TypingAnimator(titleEl as HTMLElement, phrases);
             if(heroSection){
                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => entry.isIntersecting ? heroAnimator.resume() : heroAnimator.pause());
                });
                observer.observe(heroSection);
            }
        } else {
            heroAnimator.setPhrases(phrases);
        }
    }
    
    if (subtitleEl && heroData.subtitle) subtitleEl.textContent = heroData.subtitle[currentLang];
}

function updateAboutUs(aboutUsData) {
    const titleEl = document.getElementById('about-us-title');
    const contentEl = document.getElementById('about-us-content');
    if (!aboutUsData) return;

    if (titleEl && aboutUsData.title) {
        titleEl.textContent = SecurityUtils.sanitizeHtml(aboutUsData.title[currentLang] || '');
    }
    if (contentEl && aboutUsData.content) {
        contentEl.innerHTML = '';
        const fragment = document.createDocumentFragment();
        const sanitizedContent = SecurityUtils.sanitizeHtml(aboutUsData.content[currentLang] || '');
        const paragraphs = sanitizedContent.split(/\n\s*\n/).filter(p => p.trim() !== '');
        paragraphs.forEach(pText => {
            const p = document.createElement('p');
            p.textContent = pText;
            fragment.appendChild(p);
        });
        contentEl.appendChild(fragment);
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
        const name = SecurityUtils.sanitizeHtml(exchange[`name_${currentLang}`] || '');
        const benefit1Tag = SecurityUtils.sanitizeHtml(exchange[`benefit1_tag_${currentLang}`] || '');
        const benefit1Value = SecurityUtils.sanitizeHtml(exchange[`benefit1_value_${currentLang}`] || '');
        const benefit2Tag = SecurityUtils.sanitizeHtml(exchange[`benefit2_tag_${currentLang}`] || '');
        const benefit2Value = SecurityUtils.sanitizeHtml(exchange[`benefit2_value_${currentLang}`] || '');

        let logoHtml = '';
        if (exchange.logoImageUrl && SecurityUtils.isValidUrl(exchange.logoImageUrl)) {
            const sanitizedUrl = SecurityUtils.sanitizeHtml(exchange.logoImageUrl);
            logoHtml = `<div class="exchange-logo"><img src="${sanitizedUrl}" alt="${name} logo" loading="lazy" onerror="this.style.display='none'"></div>`;
        } else {
            logoHtml = `<div class="exchange-logo exchange-logo-text">${name?.substring(0, 3).toUpperCase() || 'N/A'}</div>`;
        }

        card.innerHTML = `
            <div class="card-header">
                ${logoHtml}
                <h4>${name}</h4>
            </div>
            <ul class="benefits-list">
                <li><span class="tag">${benefit1Tag}</span> <strong>${benefit1Value}</strong></li>
                <li><span class="tag">${benefit2Tag}</span> <strong>${benefit2Value}</strong></li>
            </ul>
            <a href="${SecurityUtils.isValidUrl(exchange.link) ? SecurityUtils.sanitizeHtml(exchange.link) : '#'}" class="card-cta" target="_blank" rel="noopener noreferrer nofollow">${uiStrings[currentLang]['card.cta']}</a>
        `;
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
        summary.textContent = SecurityUtils.sanitizeHtml(faq[`question_${currentLang}`] || '');
        const contentDiv = document.createElement('div');
        contentDiv.className = 'faq-content';
        const p = document.createElement('p');
        p.textContent = SecurityUtils.sanitizeHtml(faq[`answer_${currentLang}`] || '');
        contentDiv.appendChild(p);
        details.appendChild(summary);
        details.appendChild(contentDiv);
        fragment.appendChild(details);
    });
    faqContainerEl.innerHTML = '';
    faqContainerEl.appendChild(fragment);
}

function updateSupportSection(supportData) {
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
    const hamburgerBtn = document.querySelector('.hamburger-button');
    const nav = document.getElementById('main-nav');
    if (!hamburgerBtn || !nav) return;
    hamburgerBtn.addEventListener('click', () => {
        const isActive = hamburgerBtn.classList.toggle('is-active');
        nav.classList.toggle('is-active', isActive);
        hamburgerBtn.setAttribute('aria-expanded', isActive.toString());
    });
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('is-active');
            nav.classList.remove('is-active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

function setupNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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
    
    const contentToDisplay = siteData.popup.content ? siteData.popup.content[currentLang] : '';

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