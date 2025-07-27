import { supabase } from './supabaseClient';
import { SecurityUtils } from './security-utils';

// 타입 정의
interface GuideData {
    id: number;
    title_ko: string;
    content_ko: string;
}

interface BannerData {
    page: string;
    image_url?: string;
    content?: string;
    enabled: boolean;
}

let siteData: {
    guides: GuideData[];
} = {
    guides: []
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadBannerContent();
    await loadRemoteContent();
    renderContent();
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
            const img = document.createElement('img');
            img.src = bannerData.image_url;
            img.alt = '리서치 배너';
            img.loading = 'lazy';
            bannerContainer.appendChild(img);
        } else if (bannerData.content) {
            const div = document.createElement('div');
            div.className = 'banner-text';
            div.textContent = bannerData.content;
            bannerContainer.appendChild(div);
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

async function loadRemoteContent() {
    try {
        const { data: guidesData, error: guidesError } = await supabase
            .from('guides')
            .select('*')
            .order('id');

        if (guidesError) {
            console.error("Failed to load guides data from Supabase", guidesError);
            showErrorMessage('리서치 데이터를 불러오는데 실패했습니다.');
            return;
        }
        
        siteData.guides = guidesData || [];
    } catch (error) {
        console.error('Failed to load remote content:', error);
        showErrorMessage('데이터를 불러오는데 실패했습니다.');
    }
}

function renderContent() {
    try {
        renderGuides();
    } catch (error) {
        console.error('Failed to render content:', error);
        showErrorMessage('콘텐츠를 표시하는데 실패했습니다.');
    }
}

function renderGuides() {
    const container = document.getElementById('guides-container');
    if (!container || !siteData.guides?.length) {
        if (container) {
            container.innerHTML = `
                <div class="no-content-message">
                    <h3>📚 리서치 자료 준비중</h3>
                    <p>전문가들이 작성한 암호화폐 리서치 자료를 곧 제공할 예정입니다.</p>
                    <ul>
                        <li>프로젝트 심층 분석</li>
                        <li>시장 동향 분석</li>
                        <li>에어드랍 정보</li>
                        <li>투자 전략 가이드</li>
                    </ul>
                </div>
            `;
        }
        return;
    }

    const fragment = document.createDocumentFragment();
    
    siteData.guides.forEach(guide => {
        const item = document.createElement('div');
        item.className = 'guide-item';
        
        const title = document.createElement('h3');
        title.textContent = SecurityUtils.sanitizeHtml(guide.title_ko || '');
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'guide-content';
        const p = document.createElement('p');
        p.textContent = SecurityUtils.sanitizeHtml(guide.content_ko || '');
        contentDiv.appendChild(p);
        
        item.appendChild(title);
        item.appendChild(contentDiv);
        fragment.appendChild(item);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

function setupEventListeners() {
    setupMobileMenu();
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