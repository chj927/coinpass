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
        'footer.disclaimer': '본 서비스는 정보 제공을 목적으로 하며, 투자를 권유하거나 보장하지 않습니다. 모든 투자의 최종 결정과 책임은 투자자 본인에게 있습니다.',
        'guides.pageTitle': '이용 가이드',
        'guides.pageSubtitle': '초보자용 상세 가이드와 거래소 이벤트를 확인해보세요.',
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
        'footer.disclaimer': 'This service is for informational purposes only and does not constitute an investment recommendation or guarantee. The final decision and responsibility for all investments lie with the investor.',
        'guides.pageTitle': 'User Guides',
        'guides.pageSubtitle': 'Check out our detailed guides and exchange events for beginners.',
    }
};

let currentLang = 'ko';
let guidesData = [];

document.addEventListener('DOMContentLoaded', async () => {
    setupLanguage();
    await loadBannerContent();
    await loadRemoteGuides();
    renderGuides(guidesData);
    setupEventListeners();
});

async function loadBannerContent() {
    try {
        const { data: bannerData, error } = await supabase
            .from('banners')
            .select('*')
            .eq('page', 'research')
            .eq('enabled', true)
            .single();

        const bannerContainer = document.getElementById('banner-content');
        if (!bannerContainer) return;

        if (error || !bannerData) {
            bannerContainer.style.display = 'none';
            return;
        }

        if (bannerData.image_url) {
            bannerContainer.innerHTML = `<img src="${bannerData.image_url}" alt="리서치 배너" loading="lazy">`;
        } else if (bannerData.content) {
            bannerContainer.innerHTML = `<div class="banner-text">${bannerData.content}</div>`;
        } else {
            bannerContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to load banner content:', error);
        const bannerContainer = document.getElementById('banner-content');
        if (bannerContainer) {
            bannerContainer.style.display = 'none';
        }
    }
}

async function loadRemoteGuides() {
    const { data, error } = await supabase.from('guides').select('*').order('id');
    if (error) {
        console.error("Failed to load guides from Supabase", error);
        return;
    }
    guidesData = data || [];
}

function setupEventListeners() {
    setupScrollAnimations();
    setupMobileMenu();
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
    renderGuides(guidesData);
}

function translateUI() {
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (key && uiStrings[currentLang][key]) {
            el.textContent = uiStrings[currentLang][key];
        }
    });
}

function renderGuides(guides: any[]) {
    const container = document.getElementById('guides-container');
    if (!container) return;

    const fragment = document.createDocumentFragment();
    guides.forEach(guide => {
        const item = document.createElement('details');
        item.className = 'guide-item anim-fade-in';

        const title = document.createElement('summary');
        title.className = 'guide-title';
        title.textContent = SecurityUtils.sanitizeHtml(guide[`title_${currentLang}`] || '');

        const contentDiv = document.createElement('div');
        contentDiv.className = 'guide-content';
        const p = document.createElement('p');
        p.textContent = SecurityUtils.sanitizeHtml(guide[`content_${currentLang}`] || '');
        contentDiv.appendChild(p);
        
        item.appendChild(title);
        item.appendChild(contentDiv);
        fragment.appendChild(item);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
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