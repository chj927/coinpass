import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://znixozrpthqcrvgdkgry.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuaXhvenJwdGhxY3J2Z2RrZ3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxODU0MjIsImV4cCI6MjA2ODc2MTQyMn0.YIxAe9FHqaFSUk7uIqtKf9jgR5tzUoA6bhIq9QyEepINON_KEY'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

let currentLang = 'ko';
let guidesData = [];

document.addEventListener('DOMContentLoaded', async () => {
    setupLanguage();
    await loadRemoteGuides(); // LocalStorage 대신 Supabase에서 데이터 로드
    renderGuides(guidesData);
    setupEventListeners();
});

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

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('coinpass-lang', lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-ko')?.classList.toggle('active', lang === 'ko');
    document.getElementById('lang-en')?.classList.toggle('active', lang === 'en');
    translateUI();
    renderGuides(guidesData); // 언어 변경 시 다시 렌더링
}

// 나머지 모든 렌더링 및 UI 관련 함수들은 기존 guide.tsx 코드와 거의 동일합니다.
// (생략)