import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 초기화
const supabaseUrl = 'YOUR_SUPABASE_URL' // 본인의 URL로 교체
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY' // 본인의 anon key로 교체
const supabase = createClient(supabaseUrl, supabaseAnonKey)

let siteData = {};
let currentLang = 'ko';

document.addEventListener('DOMContentLoaded', async () => {
    setupLanguage();
    await loadRemoteContent(); // LocalStorage 대신 Supabase에서 데이터 로드
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

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('coinpass-lang', lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-ko')?.classList.toggle('active', lang === 'ko');
    document.getElementById('lang-en')?.classList.toggle('active', lang === 'en');
    translateUI();
    renderContent(); // 언어 변경 시에도 전체 콘텐츠 다시 렌더링
}

// 나머지 모든 렌더링 및 UI 관련 함수들 (populateExchangeGrid, setupHero 등)은 기존 index.tsx 코드와 거의 동일합니다.
// (생략)