import { supabase } from './supabaseClient';
import { SecurityUtils } from './security-utils';

// 타입 정의
interface ExchangeData {
    id: number;
    name_ko: string;
    link: string;
    logoImageUrl?: string;
    benefit1_tag_ko: string;
    benefit1_value_ko: string;
    benefit2_tag_ko: string;
    benefit2_value_ko: string;
    benefit3_tag_ko: string;
    benefit3_value_ko: string;
    benefit4_tag_ko: string;
    benefit4_value_ko: string;
}

interface FAQData {
    id: number;
    question_ko: string;
    answer_ko: string;
}

interface SinglePageData {
    type: string;
    content: any;
}

let siteData: {
    exchanges: ExchangeData[];
    dexExchanges: ExchangeData[];
    faqs: FAQData[];
    hero?: any;
    aboutUs?: any;
    popup?: any;
} = {
    exchanges: [],
    dexExchanges: [],
    faqs: []
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadRemoteContent();
    renderContent();
    setupEventListeners();
});

async function loadRemoteContent() {
    try {
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
            faqs: faqsData || []
        };

        // 단일 페이지 데이터 처리
        if (singlePages) {
            singlePages.forEach((page: SinglePageData) => {
                if (page.type === 'hero') siteData.hero = page.content;
                if (page.type === 'aboutUs') siteData.aboutUs = page.content;
                if (page.type === 'popup') siteData.popup = page.content;
            });
        }
    } catch (error) {
        console.error('Failed to load remote content:', error);
        showErrorMessage('데이터를 불러오는데 실패했습니다.');
    }
}

function renderContent() {
    try {
        renderHeroSection();
        renderAboutUsSection();
        renderExchanges();
        renderFAQs();
        checkAndShowPopup();
    } catch (error) {
        console.error('Failed to render content:', error);
        showErrorMessage('콘텐츠를 표시하는데 실패했습니다.');
    }
}

function renderHeroSection() {
    const heroData = siteData.hero;
    if (!heroData) return;

    const titleEl = document.getElementById('hero-title');
    if (titleEl && heroData.title && heroData.title.ko) {
        const sanitizedTitle = SecurityUtils.sanitizeHtml(heroData.title.ko);
        const typingAnimator = new TypingAnimator(titleEl as HTMLElement, sanitizedTitle);
        typingAnimator.start();
    }

    const subtitleEl = document.getElementById('hero-subtitle');
    if (subtitleEl && heroData.subtitle) {
        subtitleEl.textContent = heroData.subtitle.ko || '';
    }
}

function renderAboutUsSection() {
    const aboutUsData = siteData.aboutUs;
    if (!aboutUsData) return;

    const titleEl = document.getElementById('about-title');
    if (titleEl && aboutUsData.title) {
        titleEl.textContent = SecurityUtils.sanitizeHtml(aboutUsData.title.ko || '');
    }

    const contentEl = document.getElementById('about-content');
    if (contentEl && aboutUsData.content) {
        contentEl.innerHTML = '';
        const sanitizedContent = SecurityUtils.sanitizeHtml(aboutUsData.content.ko || '');
        const fragment = document.createDocumentFragment();
        
        sanitizedContent.split('\n').forEach(line => {
            const p = document.createElement('p');
            p.textContent = line.trim();
            fragment.appendChild(p);
        });
        
        contentEl.appendChild(fragment);
    }
}

function renderExchanges() {
    renderExchangeType('cex-grid', siteData.exchanges, '중앙화 거래소');
    renderExchangeType('dex-grid', siteData.dexExchanges, '탈중앙화 거래소');
}

function renderExchangeType(gridId: string, exchanges: ExchangeData[], type: string) {
    const gridEl = document.getElementById(gridId);
    if (!gridEl || !exchanges?.length) return;

    const fragment = document.createDocumentFragment();
    
    exchanges.forEach(exchange => {
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
        if (exchange.logoImageUrl && SecurityUtils.isValidUrl(exchange.logoImageUrl)) {
            const sanitizedUrl = SecurityUtils.sanitizeHtml(exchange.logoImageUrl);
            logoHtml = `<div class="exchange-logo"><img src="${sanitizedUrl}" alt="${name} logo" loading="lazy" onerror="this.style.display='none'"></div>`;
        }

        const card = document.createElement('div');
        card.className = 'exchange-card';
        card.innerHTML = `
            ${logoHtml}
            <h3>${name}</h3>
            <div class="benefits">
                <div class="benefit-item">
                    <span class="benefit-tag">${benefit1Tag}</span>
                    <span class="benefit-value">${benefit1Value}</span>
                </div>
                <div class="benefit-item">
                    <span class="benefit-tag">${benefit2Tag}</span>
                    <span class="benefit-value">${benefit2Value}</span>
                </div>
                <div class="benefit-item">
                    <span class="benefit-tag">${benefit3Tag}</span>
                    <span class="benefit-value">${benefit3Value}</span>
                </div>
                <div class="benefit-item">
                    <span class="benefit-tag">${benefit4Tag}</span>
                    <span class="benefit-value">${benefit4Value}</span>
                </div>
            </div>
            <a href="${SecurityUtils.isValidUrl(exchange.link) ? SecurityUtils.sanitizeHtml(exchange.link) : '#'}" class="card-cta" target="_blank" rel="noopener noreferrer nofollow">혜택 받기</a>
        `;

        fragment.appendChild(card);
    });

    gridEl.innerHTML = '';
    gridEl.appendChild(fragment);
}

function renderFAQs() {
    const faqContainerEl = document.getElementById('faq-container');
    if (!faqContainerEl || !siteData.faqs?.length) return;

    const fragment = document.createDocumentFragment();
    
    siteData.faqs.forEach(faq => {
        const details = document.createElement('details');
        details.className = 'faq-item';
        
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

function checkAndShowPopup() {
    if (!siteData.popup?.enabled) return;

    const hideUntil = localStorage.getItem('coinpass-popup-hide-until');
    if (hideUntil && Date.now() < parseInt(hideUntil, 10)) return;

    const container = document.getElementById('popup-container');
    if (!container) return;

    const contentToDisplay = siteData.popup.content ? siteData.popup.content.ko : '';
    
    const imageEl = container.querySelector('#popup-image') as HTMLImageElement;
    const textEl = container.querySelector('#popup-text');
    
    if (siteData.popup.imageUrl) {
        if (imageEl) imageEl.src = siteData.popup.imageUrl;
        (imageEl as HTMLElement).style.display = 'block';
        (textEl as HTMLElement).style.display = 'none';
    } else {
        if (textEl) textEl.textContent = contentToDisplay;
        (textEl as HTMLElement).style.display = 'block';
        (imageEl as HTMLElement).style.display = 'none';
    }

    container.style.display = 'flex';
    const closePopup = () => container.style.display = 'none';
    
    const overlay = container.querySelector('.popup-overlay');
    if (overlay) overlay.addEventListener('click', closePopup);
    
    // 24시간 동안 숨기기
    const hideButton = container.querySelector('#hide-popup-24h');
    if (hideButton) {
        hideButton.addEventListener('click', () => {
            localStorage.setItem('coinpass-popup-hide-until', (Date.now() + 24 * 60 * 60 * 1000).toString());
            closePopup();
        });
    }
}

function setupEventListeners() {
    setupMobileMenu();
    setupScrollEffects();
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

function setupScrollEffects() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href') || '');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function showErrorMessage(message: string) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 16px;
        border-radius: 8px;
        z-index: 1000;
        max-width: 300px;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000);
}

class TypingAnimator {
    private element: HTMLElement;
    private text: string;
    private typingSpeed: number = 100;

    constructor(element: HTMLElement, text: string) {
        this.element = element;
        this.text = text;
    }

    public start() {
        this.typeText();
    }

    private async typeText() {
        this.element.textContent = '';
        for (let i = 0; i <= this.text.length; i++) {
            this.element.textContent = this.text.substring(0, i);
            await this.sleep(this.typingSpeed);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}