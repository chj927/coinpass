import { supabase } from './supabaseClient';

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
        siteData[page.page_name] = page.content;
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

class TypingAnimator { /* ... (기존과 동일, 생략 가능) ... */ }
let heroAnimator;

function setupHero(heroData) {
    // ... (기존과 동일)
}

function updateAboutUs(aboutUsData) {
    // ... (기존과 동일)
}

function populateExchangeGrid(gridId: string, exchangesData: any[]) {
    const gridEl = document.getElementById(gridId);
    if (!gridEl || !exchangesData) return;
    
    const fragment = document.createDocumentFragment();
    exchangesData.forEach(exchange => {
        const card = document.createElement('div');
        card.className = 'exchange-card anim-fade-in';

        const header = document.createElement('div');
        header.className = 'card-header';
        
        const logoEl = document.createElement('div');
        logoEl.className = 'exchange-logo';
        
        if (exchange.logoImageUrl) {
            const img = document.createElement('img');
            img.src = exchange.logoImageUrl;
            img.alt = `${exchange[`name_${currentLang}`]} logo`;
            img.loading = 'lazy';
            logoEl.appendChild(img);
        } else {
            logoEl.classList.add('exchange-logo-text');
            logoEl.textContent = exchange[`name_${currentLang}`]?.substring(0, 3).toUpperCase() || 'N/A';
        }

        const h4 = document.createElement('h4');
        h4.textContent = exchange[`name_${currentLang}`];

        header.appendChild(logoEl);
        header.appendChild(h4);

        const benefitsList = document.createElement('ul');
        benefitsList.className = 'benefits-list';

        const benefit1 = document.createElement('li');
        benefit1.innerHTML = `<span class="tag">${exchange[`benefit1_tag_${currentLang}`]}</span> <strong>${exchange[`benefit1_value_${currentLang}`]}</strong>`;
        
        const benefit2 = document.createElement('li');
        benefit2.innerHTML = `<span class="tag">${exchange[`benefit2_tag_${currentLang}`]}</span> <strong>${exchange[`benefit2_value_${currentLang}`]}</strong>`;
        
        benefitsList.appendChild(benefit1);
        benefitsList.appendChild(benefit2);

        const ctaLink = document.createElement('a');
        ctaLink.href = exchange.link;
        ctaLink.className = 'card-cta';
        ctaLink.target = '_blank';
        ctaLink.rel = 'noopener noreferrer nofollow';
        ctaLink.textContent = uiStrings[currentLang]['card.cta'];

        card.appendChild(header);
        card.appendChild(benefitsList);
        card.appendChild(ctaLink);
        
        fragment.appendChild(card);
    });
    gridEl.innerHTML = '';
    gridEl.appendChild(fragment);
}

function updateFaqs(faqsData: any[]) {
    // ... (기존과 동일)
}

function updateSupportSection(supportData: any) {
    // ... (기존과 동일)
}

function setupScrollAnimations() {
    // ... (기존과 동일)
}

function setupMobileMenu() {
    // ... (기존과 동일)
}

function setupNavigation() {
    // ... (기존과 동일)
}

function setupPopup() {
    // ... (기존과 동일)
}

// export {}; // 불필요하므로 제거