import { supabase, DatabaseUtils } from './supabaseClient';
import { SecurityUtils } from './security-utils';
import { authService } from './auth-service';

// 타입 정의
interface DatabaseRecord {
    id?: number;
    created_at?: string;
    [key: string]: string | number | boolean | undefined;
}


interface ExchangeData {
    id?: number;
    name_ko: string;
    logoimageurl: string;
    benefit1_tag_ko: string;
    benefit1_value_ko: string;
    benefit2_tag_ko: string;
    benefit2_value_ko: string;
    benefit3_tag_ko: string;
    benefit3_value_ko: string;
    benefit4_tag_ko: string;
    benefit4_value_ko: string;
    link: string;
}

interface FAQData {
    id?: number;
    question_ko: string;
    answer_ko: string;
}

interface PinnedArticle {
    id?: number;
    position: number;
    badge_text: string;
    badge_type: string;
    image_url: string;
    category: string;
    category_icon: string;
    title: string;
    description: string;
    footer_type: string;
    footer_text: string;
    cta_text: string;
    link_url: string;
    is_active: boolean;
}

interface Article {
    id?: string;
    title: string;
    category: 'notice' | 'guide' | 'event' | 'airdrop';
    content_type: 'external' | 'internal';
    content: string | null;
    excerpt: string | null;
    external_url: string | null;
    image_url: string | null;
    author: string;
    is_pinned: boolean;
    is_published: boolean;
    view_count: number;
    created_at?: string;
    updated_at?: string;
}


interface PopupContent {
    enabled: boolean;
    type: 'text' | 'image';
    content: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
}

interface SiteData {
    hero: {
        title: string;
        subtitle: string;
    };
    aboutUs: {
        title: string;
        content: string;
    };
    exchanges: ExchangeData[];
    faqs: FAQData[];
    popup: PopupContent;
    indexPopup: PopupContent;
    support: {
        telegramUrl: string;
    };
    pinnedArticles: PinnedArticle[];
    articles: Article[];
}

// 기본 데이터 구조는 유지합니다.
const defaultSiteData: SiteData = {
    hero: { title: '', subtitle: '' },
    aboutUs: { title: '', content: '' },
    exchanges: [],
    faqs: [],
    popup: { enabled: false, type: 'text', content: '', imageUrl: '', startDate: '', endDate: '' },
    indexPopup: { enabled: false, type: 'text', content: '', imageUrl: '', startDate: '', endDate: '' },
    support: { telegramUrl: '#' },
    pinnedArticles: [],
    articles: []
};

let siteData: SiteData = JSON.parse(JSON.stringify(defaultSiteData));

// SHA256 해싱 함수 제거 - 서버사이드 인증으로 대체

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container') as HTMLDivElement;
    const adminPanel = document.getElementById('admin-panel') as HTMLDivElement;
    const loginButton = document.getElementById('login-button') as HTMLButtonElement;
    const passwordInput = document.getElementById('password-input') as HTMLInputElement;
    const emailInput = document.getElementById('email-input') as HTMLInputElement;
    const loginError = document.getElementById('login-error') as HTMLParagraphElement;

    // 로그인 버튼 이벤트 핸들러 - 서버사이드 인증 사용
    loginButton.addEventListener('click', async () => {
        // Rate limiting 체크
        if (!SecurityUtils.checkRateLimit('admin-login', 3, 60000)) {
            loginError.textContent = '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.';
            return;
        }

        const enteredEmail = emailInput.value.trim();
        const enteredPassword = passwordInput.value;
        
        // 입력 검증
        if (!enteredEmail || !enteredPassword) {
            loginError.textContent = '이메일과 비밀번호를 입력해주세요.';
            return;
        }

        // 로딩 상태 표시
        loginButton.disabled = true;
        loginButton.textContent = '로그인 중...';

        try {
            // 서버사이드 인증 시도
            const result = await authService.login(enteredEmail, enteredPassword);
            
            if (result.success) {
                // 로그인 성공
                // SecurityUtils 세션도 시작 (두 시스템 동기화)
                SecurityUtils.startSession();
                loginContainer.style.display = 'none';
                adminPanel.style.display = 'flex';
                await initializeApp();
                showToast('로그인 성공', 'success');
            } else {
                // 로그인 실패
                loginError.textContent = result.error || '로그인에 실패했습니다.';
                passwordInput.value = '';
                
                // 실패 시 진동 효과
                loginContainer.classList.add('shake');
                setTimeout(() => {
                    loginContainer.classList.remove('shake');
                }, 500);
            }
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = '로그인 처리 중 오류가 발생했습니다.';
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = '로그인';
        }
    });
    // 엔터키 이벤트 처리
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });
    
    emailInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            passwordInput.focus();
        }
    });
    
    // 기존 세션 확인
    async function checkExistingSession() {
        try {
            const hasValidSession = await authService.checkSession();
            if (hasValidSession) {
                // Supabase 세션이 유효하면 SecurityUtils 세션도 동기화
                SecurityUtils.startSession();
                loginContainer.style.display = 'none';
                adminPanel.style.display = 'flex';
                await initializeApp();
            }
        } catch (error) {
            console.error('Session check error:', error);
        }
    }
    
    // 로그아웃 버튼 추가
    const logoutButton = document.createElement('button');
    logoutButton.textContent = '로그아웃';
    logoutButton.className = 'logout-button';
    logoutButton.onclick = async () => {
        await authService.logout();
        SecurityUtils.clearSession(); // SecurityUtils 세션도 정리
        location.reload();
    };
    adminPanel.querySelector('.admin-header')?.appendChild(logoutButton);
    
    // 초기 세션 확인 호출
    checkExistingSession();
});

async function initializeApp() {
    await fetchDataFromSupabase();
    renderAll();
    setupEventListeners();
    setupNavigation();
}

// --- Supabase 데이터 통신 함수들 ---

async function fetchDataFromSupabase() {
    showToast('데이터를 불러오는 중...');
    
    try {
        // 데이터베이스 연결 확인
        const isConnected = await DatabaseUtils.checkConnection();
        if (!isConnected) {
            showToast('데이터베이스 연결 실패', 'error');
            return;
        }
        
        const { data: cex, error: cexError } = await supabase.from('exchange_exchanges').select('*').order('id');
        const { data: faqsData, error: faqsError } = await supabase.from('exchange_faqs').select('*').order('id');
        const { data: singlePages, error: singlePagesError } = await supabase.from('page_contents').select('*');
        const { data: pinnedData, error: pinnedError } = await supabase.from('pinned_articles').select('*').order('position');
        const { data: articlesData, error: articlesError } = await supabase.from('articles').select('*').order('created_at', { ascending: false });

        if (cexError) {
            console.error('Exchange data error:', cexError);
            showToast('거래소 데이터 로딩 실패', 'error');
        }
        if (faqsError) {
            console.error('FAQ data error:', faqsError);
            showToast('FAQ 데이터 로딩 실패', 'error');
        }
        if (singlePagesError) {
            console.error('Page contents error:', singlePagesError);
            showToast('페이지 콘텐츠 로딩 실패', 'error');
        }
        if (pinnedError) {
            console.error('Pinned articles error:', pinnedError);
            // Pinned articles table might not exist yet
        }
        if (articlesError) {
            console.error('Articles data error:', articlesError);
            // Articles table might not exist yet
        }
        
        // 오류가 발생하더라도 빈 배열로 초기화
        siteData.exchanges = cex || [];
        siteData.faqs = faqsData || [];
        siteData.pinnedArticles = pinnedData || [];
        siteData.articles = articlesData || [];

    singlePages?.forEach((page: any) => {
        if (page.page_type === 'hero' && page.content) {
            siteData.hero = page.content;
        } else if (page.page_type === 'aboutUs' && page.content) {
            siteData.aboutUs = page.content;
        } else if (page.page_type === 'popup' && page.content) {
            siteData.popup = page.content;
        } else if (page.page_type === 'indexPopup' && page.content) {
            siteData.indexPopup = page.content;
        } else if (page.page_type === 'support' && page.content) {
            siteData.support = page.content;
        }
    });
    
        showToast('데이터 로딩 완료!');
    } catch (error) {
        console.error('Database fetch error:', error);
        showToast('데이터 로딩 중 예상치 못한 오류 발생', 'error');
    }
}

async function saveItem(tableName: string, itemData: any, id?: number) {
    // 세션 유효성 검사 (두 시스템 모두 확인)
    const supabaseSessionValid = await authService.checkSession();
    const securityUtilsSessionValid = SecurityUtils.isSessionValid();
    
    if (!supabaseSessionValid || !securityUtilsSessionValid) {
        // 세션 불일치 시 재동기화 시도
        if (supabaseSessionValid && !securityUtilsSessionValid) {
            SecurityUtils.startSession();
        } else {
            showToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
            location.reload();
            return;
        }
    }

    // CSRF 토큰 검증
    const csrfToken = SecurityUtils.getCSRFToken();
    if (!SecurityUtils.validateCSRFToken(csrfToken)) {
        showToast('보안 토큰이 유효하지 않습니다.', 'error');
        return;
    }

    // 테이블명 화이트리스트 검증
    const allowedTables = ['exchange_exchanges', 'exchange_faqs'];
    if (!allowedTables.includes(tableName)) {
        showToast('허용되지 않는 테이블입니다.', 'error');
        return;
    }

    try {
        // 입력 데이터 검증 및 sanitization
        const sanitizedData: DatabaseRecord = {};
        for (const [key, value] of Object.entries(itemData)) {
            if (typeof value === 'string') {
                if (key.includes('Url') || key === 'link') {
                    // URL 검증
                    if (value && !SecurityUtils.isValidUrl(value)) {
                        showToast(`잘못된 URL 형식: ${key}`, 'error');
                        return;
                    }
                    sanitizedData[key] = value;
                } else {
                    // 일반 텍스트 검증 및 sanitization
                    sanitizedData[key] = SecurityUtils.validateInput(value, 2000);
                }
            } else {
                sanitizedData[key] = value as string | number | boolean | undefined;
            }
        }

        // id 필드는 자동 생성되므로 insert/update 데이터에서 제외
        delete sanitizedData.id;
        delete sanitizedData.created_at;

        let response;
        if (id && id > 0) {
            // 기존 항목 업데이트
            response = await supabase.from(tableName).update(sanitizedData).eq('id', id);
        } else {
            // 새 항목 생성
            response = await supabase.from(tableName).insert(sanitizedData).select();
        }

        if (response.error) {
            console.error(`Error saving to ${tableName}:`, response.error);
            console.error('Error details:', response.error.message);
            showToast(`오류: ${tableName} 저장 실패 - ${response.error.message}`, 'error');
        } else {
            showToast(`${tableName} 항목이 저장되었습니다.`);
            console.log('Save successful:', response.data);
            // 새로 생성된 항목인 경우에만 데이터를 다시 불러옵니다
            if ((!id || id < 0) && response.data) {
                await fetchDataFromSupabase();
                renderAll();
            }
        }
    } catch (error) {
        console.error('Save error:', error);
        showToast('데이터 저장 중 오류가 발생했습니다.', 'error');
    }
}

async function saveSinglePage(pageName: string, content: any) {
    // 세션 유효성 검사 (두 시스템 모두 확인)
    const supabaseSessionValid = await authService.checkSession();
    const securityUtilsSessionValid = SecurityUtils.isSessionValid();
    
    if (!supabaseSessionValid || !securityUtilsSessionValid) {
        // 세션 불일치 시 재동기화 시도
        if (supabaseSessionValid && !securityUtilsSessionValid) {
            SecurityUtils.startSession();
        } else {
            showToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
            location.reload();
            return;
        }
    }

    // 페이지명 화이트리스트 검증
    const allowedPages = ['hero', 'aboutUs', 'popup', 'indexPopup', 'support'];
    if (!allowedPages.includes(pageName)) {
        showToast('허용되지 않는 페이지입니다.', 'error');
        return;
    }

    try {
        // 콘텐츠 sanitization
        const sanitizedContent = sanitizeContent(content);
        
        // 먼저 해당 page_type의 레코드가 존재하는지 확인
        const { data: existing } = await supabase
            .from('page_contents')
            .select('id')
            .eq('page_type', pageName)
            .single();
            
        let result;
        if (existing) {
            // 기존 레코드 업데이트
            result = await supabase
                .from('page_contents')
                .update({ content: sanitizedContent })
                .eq('page_type', pageName);
        } else {
            // 새 레코드 생성
            result = await supabase
                .from('page_contents')
                .insert({ 
                    page_type: pageName, 
                    content: sanitizedContent 
                });
        }
        
        if (result.error) {
            console.error(`Error saving ${pageName}:`, result.error);
            console.error('Error details:', result.error.message);
            showToast(`오류: ${pageName} 저장 실패 - ${result.error.message}`, 'error');
        } else {
            showToast(`${pageName} 섹션이 저장되었습니다.`);
        }
    } catch (error) {
        console.error('Save single page error:', error);
        showToast('페이지 저장 중 오류가 발생했습니다.', 'error');
    }
    
    await fetchDataFromSupabase();
    renderAll();
}

// 콘텐츠 sanitization 함수
function sanitizeContent(content: any): any {
    if (typeof content === 'string') {
        return SecurityUtils.validateInput(content, 5000);
    } else if (typeof content === 'object' && content !== null) {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(content)) {
            if (typeof value === 'string') {
                if (key.includes('Url') || key.includes('url')) {
                    // URL 검증
                    if (value && !SecurityUtils.isValidUrl(value)) {
                        throw new Error(`잘못된 URL 형식: ${key}`);
                    }
                    sanitized[key] = value;
                } else {
                    sanitized[key] = SecurityUtils.validateInput(value, 5000);
                }
            } else if (typeof value === 'object') {
                sanitized[key] = sanitizeContent(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    return content;
}

async function deleteItem(tableName: string, id: number) {
    // 임시 ID(음수)인 경우 로컬에서만 삭제
    if (id < 0) {
        if (tableName === 'exchange_exchanges') {
            siteData.exchanges = siteData.exchanges.filter(item => item.id !== id);
            renderExchanges();
        } else if (tableName === 'exchange_faqs') {
            siteData.faqs = siteData.faqs.filter(item => item.id !== id);
            renderFaqs();
        }
        showToast('항목이 삭제되었습니다.');
        return;
    }
    
    if (!confirm('정말로 삭제하시겠습니까?')) return;
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        showToast(`오류: ${tableName} 삭제 실패`, 'error');
    } else {
        showToast(`${tableName} 항목이 삭제되었습니다.`);
        await fetchDataFromSupabase();
        renderAll();
    }
}

// --- 렌더링 함수들 ---

function showToast(message: string, type: 'success' | 'error' = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
}

function renderAll() {
    renderHero();
    renderAboutUs();
    renderPopup();
    renderSupport();
    renderExchanges();
    renderFaqs();
    renderPinnedArticles();
    renderArticles();
    updateDashboard();
}

function updateDashboard() {
    // 대시보드 통계 업데이트
    const exchangeCount = document.getElementById('exchange-count');
    const faqCount = document.getElementById('faq-count');
    const popupCount = document.getElementById('popup-count');
    const lastUpdate = document.getElementById('last-update');
    
    if (exchangeCount) exchangeCount.textContent = siteData.exchanges.length.toString();
    if (faqCount) faqCount.textContent = siteData.faqs.length.toString();
    
    let activePopups = 0;
    if (siteData.popup?.enabled) activePopups++;
    if (siteData.indexPopup?.enabled) activePopups++;
    if (popupCount) popupCount.textContent = activePopups.toString();
    
    if (lastUpdate) {
        const now = new Date();
        lastUpdate.textContent = now.toLocaleTimeString('ko-KR');
    }
}

function createBilingualFormGroup(container: HTMLElement, baseName: string, labels: { ko: string, en: string }, item: any, elType = 'input') {
    const group = document.createElement('div');
    group.className = 'bilingual-group';

    const koGroup = document.createElement('div');
    koGroup.className = 'form-group';
    const koLabel = document.createElement('label');
    koLabel.textContent = labels.ko;
    const koInput = document.createElement(elType) as HTMLInputElement | HTMLTextAreaElement;
    koInput.value = item[baseName]?.ko || '';
    koInput.className = `item-input ${baseName}`;
    koInput.dataset.lang = 'ko';
    if(elType === 'textarea') (koInput as HTMLTextAreaElement).rows = 10;
    koGroup.append(koLabel, koInput);

    const enGroup = document.createElement('div');
    enGroup.className = 'form-group';
    const enLabel = document.createElement('label');
    enLabel.textContent = labels.en;
    const enInput = document.createElement(elType) as HTMLInputElement | HTMLTextAreaElement;
    enInput.value = item[baseName]?.en || '';
    enInput.className = `item-input ${baseName}`;
    enInput.dataset.lang = 'en';
    if(elType === 'textarea') (enInput as HTMLTextAreaElement).rows = 10;
    enGroup.append(enLabel, enInput);

    group.append(koGroup, enGroup);
    container.appendChild(group);
}

function createSingleFormGroup(container: HTMLElement, baseName: string, label: string, item: any, elType = 'input', inputType = 'text') {
    const group = document.createElement('div');
    group.className = 'form-group';
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    const input = document.createElement(elType) as HTMLInputElement | HTMLTextAreaElement;
    
    // textarea에는 type 속성이 없으므로 input일 때만 설정
    if (elType === 'input' && input instanceof HTMLInputElement) {
        input.type = inputType;
    }
    
    input.value = item[baseName] || '';
    input.className = `item-input ${baseName}`;
    group.append(labelEl, input);
    container.appendChild(group);
}


function renderList(containerId: string, dataList: any[], listName: string, fields: any[]) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const fragment = document.createDocumentFragment();

    dataList.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.index = index.toString();
        card.dataset.listName = listName;
        card.dataset.itemId = item.id?.toString() || '';

        fields.forEach(field => {
            if (field.bilingual) {
                createBilingualFormGroup(card, field.name, field.labels, {
                    [field.name]: { ko: item[`${field.name}_ko`], en: item[`${field.name}_en`] }
                }, field.elType);
            } else {
                createSingleFormGroup(card, field.name, field.labels.ko, item, field.elType, field.inputType);
            }
        });

        const controls = document.createElement('div');
        controls.className = 'item-controls';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-item-button';
        saveBtn.textContent = '항목 저장';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button';
        deleteBtn.textContent = '삭제';

        controls.append(saveBtn, deleteBtn);
        card.appendChild(controls);

        fragment.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

function renderHero() {
    (document.getElementById('hero-title-ko-input') as HTMLTextAreaElement).value = siteData.hero.title || '';
    (document.getElementById('hero-subtitle-ko-input') as HTMLTextAreaElement).value = siteData.hero.subtitle || '';
}

function renderAboutUs() {
    (document.getElementById('about-us-title-ko-input') as HTMLInputElement).value = siteData.aboutUs.title || '';
    (document.getElementById('about-us-content-ko-input') as HTMLTextAreaElement).value = siteData.aboutUs.content || '';
}

function renderPopup() {
    // Exchange 팝업 렌더링
    const popup = siteData.popup;
    if (popup) {
        (document.getElementById('exchange-popup-enabled-input') as HTMLInputElement).checked = popup.enabled;
        document.querySelectorAll<HTMLInputElement>('input[name="exchange-popup-type"]').forEach(radio => {
            radio.checked = radio.value === popup.type;
        });
        (document.getElementById('exchange-popup-content-ko-input') as HTMLTextAreaElement).value = popup.content || '';
        (document.getElementById('exchange-popup-image-url-input') as HTMLInputElement).value = popup.imageUrl;
        (document.getElementById('exchange-popup-start-date-input') as HTMLInputElement).value = popup.startDate;
        (document.getElementById('exchange-popup-end-date-input') as HTMLInputElement).value = popup.endDate;
    }
    
    // Index 팝업 렌더링
    const indexPopup = siteData.indexPopup;
    if (indexPopup) {
        (document.getElementById('index-popup-enabled-input') as HTMLInputElement).checked = indexPopup.enabled;
        document.querySelectorAll<HTMLInputElement>('input[name="index-popup-type"]').forEach(radio => {
            radio.checked = radio.value === indexPopup.type;
        });
        (document.getElementById('index-popup-content-ko-input') as HTMLTextAreaElement).value = indexPopup.content || '';
        (document.getElementById('index-popup-image-url-input') as HTMLInputElement).value = indexPopup.imageUrl;
        (document.getElementById('index-popup-start-date-input') as HTMLInputElement).value = indexPopup.startDate;
        (document.getElementById('index-popup-end-date-input') as HTMLInputElement).value = indexPopup.endDate;
    }
}

function renderSupport() {
    const input = document.getElementById('support-telegram-url-input') as HTMLInputElement;
    if (input && siteData.support) {
        input.value = siteData.support.telegramUrl;
    }
}

function renderExchanges() {
    const container = document.getElementById('exchanges-list');
    if (!container) return;
    
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    siteData.exchanges.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.index = index.toString();
        card.dataset.listName = 'exchange_exchanges';
        card.dataset.itemId = item.id?.toString() || '';

        // 거래소 이름과 로고 URL
        createSingleFormGroup(card, 'name_ko', '거래소 이름', item, 'input');
        createSingleFormGroup(card, 'logoimageurl', '로고 이미지 URL', item, 'input', 'url');
        
        // 혜택 필드들을 그룹으로 묶기
        const benefitsTitle = document.createElement('h4');
        benefitsTitle.textContent = '거래소 혜택';
        benefitsTitle.style.marginTop = '16px';
        benefitsTitle.style.marginBottom = '12px';
        benefitsTitle.style.color = 'var(--text-color)';
        card.appendChild(benefitsTitle);
        
        const benefitsGroup = document.createElement('div');
        benefitsGroup.className = 'exchange-benefits-group';
        
        // 혜택 1-4 그룹화
        for (let i = 1; i <= 4; i++) {
            const benefitContainer = document.createElement('div');
            benefitContainer.style.display = 'grid';
            benefitContainer.style.gap = '8px';
            benefitContainer.style.padding = '12px';
            benefitContainer.style.background = 'var(--input-bg)';
            benefitContainer.style.borderRadius = '8px';
            benefitContainer.style.border = '1px solid var(--border-color)';
            
            const benefitLabel = document.createElement('label');
            benefitLabel.textContent = `혜택 ${i}`;
            benefitLabel.style.fontWeight = '600';
            benefitLabel.style.marginBottom = '4px';
            benefitContainer.appendChild(benefitLabel);
            
            // 태그 입력
            const tagInput = document.createElement('input');
            tagInput.placeholder = '태그 (예: 수수료 할인)';
            tagInput.value = (item as any)[`benefit${i}_tag_ko`] || '';
            tagInput.className = `item-input benefit${i}_tag_ko`;
            tagInput.style.marginBottom = '4px';
            
            // 값 입력
            const valueInput = document.createElement('input');
            valueInput.placeholder = '값 (예: 20%)';
            valueInput.value = (item as any)[`benefit${i}_value_ko`] || '';
            valueInput.className = `item-input benefit${i}_value_ko`;
            
            benefitContainer.appendChild(tagInput);
            benefitContainer.appendChild(valueInput);
            benefitsGroup.appendChild(benefitContainer);
        }
        
        card.appendChild(benefitsGroup);
        
        // 가입 링크
        createSingleFormGroup(card, 'link', '가입 링크', item, 'input', 'url');

        // 컨트롤 버튼
        const controls = document.createElement('div');
        controls.className = 'item-controls';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-item-button';
        saveBtn.textContent = '항목 저장';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button';
        deleteBtn.textContent = '삭제';

        controls.append(saveBtn, deleteBtn);
        card.appendChild(controls);

        fragment.appendChild(card);
    });

    container.appendChild(fragment);
}


function renderFaqs() {
    renderList('faq-list', siteData.faqs, 'exchange_faqs', [
        { name: 'question_ko', labels: { ko: '질문' }, bilingual: false, elType: 'input' },
        { name: 'answer_ko', labels: { ko: '답변' }, bilingual: false, elType: 'textarea' },
    ]);
}

function renderPinnedArticles() {
    // Load pinned articles data into the form
    for (let position = 1; position <= 6; position++) {
        const article = siteData.pinnedArticles.find(a => a.position === position);
        const card = document.querySelector(`.pinned-article-card[data-position="${position}"]`);
        
        if (card && article) {
            (card.querySelector('.pinned-active') as HTMLInputElement).checked = article.is_active;
            (card.querySelector('.pinned-badge-text') as HTMLInputElement).value = article.badge_text;
            (card.querySelector('.pinned-badge-type') as HTMLSelectElement).value = article.badge_type;
            (card.querySelector('.pinned-image') as HTMLInputElement).value = article.image_url;
            (card.querySelector('.pinned-category') as HTMLSelectElement).value = article.category;
            (card.querySelector('.pinned-category-icon') as HTMLInputElement).value = article.category_icon;
            (card.querySelector('.pinned-title') as HTMLInputElement).value = article.title;
            (card.querySelector('.pinned-description') as HTMLTextAreaElement).value = article.description;
            (card.querySelector('.pinned-footer-type') as HTMLSelectElement).value = article.footer_type;
            (card.querySelector('.pinned-footer-text') as HTMLInputElement).value = article.footer_text;
            (card.querySelector('.pinned-cta') as HTMLInputElement).value = article.cta_text;
            (card.querySelector('.pinned-link') as HTMLInputElement).value = article.link_url;
        }
    }
}

async function savePinnedArticle(position: number) {
    const card = document.querySelector(`.pinned-article-card[data-position="${position}"]`);
    if (!card) return;
    
    const articleData: PinnedArticle = {
        position: position,
        is_active: (card.querySelector('.pinned-active') as HTMLInputElement).checked,
        badge_text: (card.querySelector('.pinned-badge-text') as HTMLInputElement).value,
        badge_type: (card.querySelector('.pinned-badge-type') as HTMLSelectElement).value,
        image_url: (card.querySelector('.pinned-image') as HTMLInputElement).value,
        category: (card.querySelector('.pinned-category') as HTMLSelectElement).value,
        category_icon: (card.querySelector('.pinned-category-icon') as HTMLInputElement).value,
        title: (card.querySelector('.pinned-title') as HTMLInputElement).value,
        description: (card.querySelector('.pinned-description') as HTMLTextAreaElement).value,
        footer_type: (card.querySelector('.pinned-footer-type') as HTMLSelectElement).value,
        footer_text: (card.querySelector('.pinned-footer-text') as HTMLInputElement).value,
        cta_text: (card.querySelector('.pinned-cta') as HTMLInputElement).value,
        link_url: (card.querySelector('.pinned-link') as HTMLInputElement).value
    };
    
    try {
        // Check if article exists for this position
        const { data: existing } = await supabase
            .from('pinned_articles')
            .select('id')
            .eq('position', position)
            .single();
        
        let result;
        if (existing) {
            // Update existing article
            result = await supabase
                .from('pinned_articles')
                .update(articleData)
                .eq('position', position);
        } else {
            // Insert new article
            result = await supabase
                .from('pinned_articles')
                .insert(articleData);
        }
        
        if (result.error) {
            console.error('Error saving pinned article:', result.error);
            showToast(`오류: 고정 게시물 저장 실패 - ${result.error.message}`, 'error');
        } else {
            showToast(`위치 ${position} 고정 게시물이 저장되었습니다.`);
        }
    } catch (error) {
        console.error('Save pinned article error:', error);
        showToast('고정 게시물 저장 중 오류가 발생했습니다.', 'error');
    }
}

async function saveAllPinnedArticles() {
    for (let position = 1; position <= 6; position++) {
        await savePinnedArticle(position);
    }
    await fetchDataFromSupabase();
    renderPinnedArticles();
}

// Articles 관리 함수들
let currentEditingArticle: Article | null = null;
let quillEditor: any = null;

function renderArticles() {
    const container = document.getElementById('articles-list');
    if (!container) return;
    
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    siteData.articles.forEach((article) => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.dataset.articleId = article.id || '';
        
        const categoryColors: Record<string, string> = {
            notice: '#FF6B6B',
            guide: '#4ECDC4',
            event: '#FFD93D',
            airdrop: '#95E1D3'
        };
        
        const categoryLabels: Record<string, string> = {
            notice: '공지사항',
            guide: '가이드',
            event: '이벤트',
            airdrop: '에어드랍'
        };
        
        card.innerHTML = `
            <div class="article-card-header">
                <span class="article-category" style="background: ${categoryColors[article.category]}">
                    ${categoryLabels[article.category]}
                </span>
                <span class="article-type ${article.content_type}">
                    ${article.content_type === 'external' ? '🔗 외부링크' : '📝 자체작성'}
                </span>
                ${article.is_pinned ? '<span class="article-pinned">📌 고정</span>' : ''}
                ${article.is_published ? '' : '<span class="article-unpublished">미발행</span>'}
            </div>
            <div class="article-card-body">
                <h3>${article.title || '제목 없음'}</h3>
                ${article.image_url ? `<img src="${article.image_url}" alt="${article.title}" class="article-thumbnail">` : ''}
                <p class="article-excerpt">${article.excerpt || ''}</p>
                <div class="article-meta">
                    <span>작성자: ${article.author}</span>
                    <span>조회수: ${article.view_count || 0}</span>
                    <span>${article.created_at ? new Date(article.created_at).toLocaleDateString('ko-KR') : ''}</span>
                </div>
            </div>
            <div class="article-controls">
                <button class="edit-article-btn" data-id="${article.id}">편집</button>
                <button class="delete-article-btn" data-id="${article.id}">삭제</button>
            </div>
        `;
        
        fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
    
    // 이벤트 리스너 설정
    setupArticleEventListeners();
}

// 이벤트 위임을 사용하여 메모리 누수 방지
function setupArticleEventListeners() {
    const articlesList = document.getElementById('articles-list');
    if (!articlesList) return;
    
    // 기존 이벤트 리스너 제거 (이벤트 위임 사용)
    const newArticlesList = articlesList.cloneNode(false) as HTMLElement;
    newArticlesList.innerHTML = articlesList.innerHTML;
    newArticlesList.id = articlesList.id;
    articlesList.parentNode?.replaceChild(newArticlesList, articlesList);
    
    // 이벤트 위임 사용
    newArticlesList.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        
        // 편집 버튼 클릭
        const editBtn = target.closest('.edit-article-btn') as HTMLElement;
        if (editBtn) {
            const id = editBtn.dataset.id;
            const article = siteData.articles.find(a => a.id === id);
            if (article) {
                openArticleEditor(article);
            }
            return;
        }
        
        // 삭제 버튼 클릭
        const deleteBtn = target.closest('.delete-article-btn') as HTMLElement;
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            if (id && confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
                deleteArticle(id);
            }
        }
    });
}

function openArticleEditor(article?: Article) {
    currentEditingArticle = article || null;
    const modal = document.getElementById('article-editor-modal');
    if (!modal) return;
    
    // 폼 필드 채우기
    (document.getElementById('article-title') as HTMLInputElement).value = article?.title || '';
    (document.getElementById('article-category') as HTMLSelectElement).value = article?.category || 'notice';
    (document.getElementById('article-content-type') as HTMLSelectElement).value = article?.content_type || 'internal';
    (document.getElementById('article-excerpt') as HTMLTextAreaElement).value = article?.excerpt || '';
    (document.getElementById('article-external-url') as HTMLInputElement).value = article?.external_url || '';
    (document.getElementById('article-image-url') as HTMLInputElement).value = article?.image_url || '';
    (document.getElementById('article-author') as HTMLInputElement).value = article?.author || 'CoinPass';
    (document.getElementById('article-is-pinned') as HTMLInputElement).checked = article?.is_pinned || false;
    (document.getElementById('article-is-published') as HTMLInputElement).checked = article?.is_published !== false;
    
    // content type에 따라 필드 표시/숨김
    const contentType = article?.content_type || 'internal';
    const editorContainer = document.getElementById('article-editor-container');
    const externalUrlGroup = document.getElementById('external-url-group');
    
    if (editorContainer && externalUrlGroup) {
        if (contentType === 'internal') {
            editorContainer.style.display = 'block';
            externalUrlGroup.style.display = 'none';
        
        // Quill 에디터 초기화
        if (!quillEditor && (window as any).Quill) {
            try {
                quillEditor = new (window as any).Quill('#article-content-editor', {
                    theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote', 'code-block'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['link', 'image', 'video'],
                        ['clean']
                    ]
                }
            });
            } catch (error) {
                console.error('Failed to initialize Quill editor:', error);
                showToast('에디터 초기화 실패', 'error');
            }
        }
        
        // 콘텐츠 설정
        if (article?.content) {
            quillEditor.root.innerHTML = article.content;
        } else {
            quillEditor.setText('');
        }
    } else {
        if (editorContainer) editorContainer.style.display = 'none';
        if (externalUrlGroup) externalUrlGroup.style.display = 'block';
    }
    
    modal.style.display = 'flex';
}

function closeArticleEditor() {
    const modal = document.getElementById('article-editor-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentEditingArticle = null;
}

async function saveArticle() {
    const title = (document.getElementById('article-title') as HTMLInputElement)?.value || '';
    const category = (document.getElementById('article-category') as HTMLSelectElement)?.value as Article['category'];
    const contentType = (document.getElementById('article-content-type') as HTMLSelectElement)?.value as Article['content_type'];
    const excerpt = (document.getElementById('article-excerpt') as HTMLTextAreaElement)?.value || '';
    const externalUrl = (document.getElementById('article-external-url') as HTMLInputElement)?.value || null;
    const imageUrl = (document.getElementById('article-image-url') as HTMLInputElement)?.value || null;
    const author = (document.getElementById('article-author') as HTMLInputElement)?.value || 'CoinPass';
    const isPinned = (document.getElementById('article-is-pinned') as HTMLInputElement)?.checked || false;
    const isPublished = (document.getElementById('article-is-published') as HTMLInputElement)?.checked || false;
    
    // 유효성 검사
    if (!title || title.trim().length === 0) {
        showToast('제목을 입력해주세요.', 'error');
        return;
    }
    
    if (title.length > 200) {
        showToast('제목은 200자 이내로 입력해주세요.', 'error');
        return;
    }
    
    if (!category) {
        showToast('카테고리를 선택해주세요.', 'error');
        return;
    }
    
    if (contentType === 'external' && (!externalUrl || !externalUrl.startsWith('http'))) {
        showToast('올바른 외부 링크 URL을 입력해주세요.', 'error');
        return;
    }
    
    if (imageUrl && !imageUrl.startsWith('http')) {
        showToast('올바른 이미지 URL을 입력해주세요.', 'error');
        return;
    }
    
    const articleData: Article = {
        title: title,
        category: category,
        content_type: contentType,
        excerpt: excerpt,
        external_url: externalUrl,
        image_url: imageUrl,
        author: author,
        is_pinned: isPinned,
        is_published: isPublished,
        view_count: currentEditingArticle?.view_count || 0,
        content: null
    };
    
    // 내부 콘텐츠인 경우 에디터 내용 저장
    if (articleData.content_type === 'internal' && quillEditor) {
        articleData.content = quillEditor.root.innerHTML;
    }
    
    try {
        let result;
        if (currentEditingArticle?.id) {
            // 업데이트
            result = await supabase
                .from('articles')
                .update(articleData)
                .eq('id', currentEditingArticle.id);
        } else {
            // 새로 추가
            result = await supabase
                .from('articles')
                .insert(articleData);
        }
        
        if (result.error) {
            throw result.error;
        }
        
        showToast('게시물이 저장되었습니다.');
        closeArticleEditor();
        await fetchDataFromSupabase();
        renderArticles();
    } catch (error) {
        console.error('Error saving article:', error);
        showToast('게시물 저장 중 오류가 발생했습니다.', 'error');
    }
}

async function deleteArticle(id: string) {
    try {
        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        showToast('게시물이 삭제되었습니다.');
        await fetchDataFromSupabase();
        renderArticles();
    } catch (error) {
        console.error('Error deleting article:', error);
        showToast('게시물 삭제 중 오류가 발생했습니다.', 'error');
    }
}



function setupEventListeners() {
    document.querySelectorAll('.save-section-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const section = (e.target as HTMLElement).dataset.section;
            if (section) {
                const content = readDataFromSection(section);
                if (section === 'popup' && content.pageName && content.data) {
                    saveSinglePage(content.pageName, content.data);
                } else {
                    saveSinglePage(section, content);
                }
            }
        });
    });
    
    // Articles 섹션 이벤트 리스너
    document.getElementById('add-article-button')?.addEventListener('click', () => {
        openArticleEditor();
    });
    
    document.getElementById('save-article-button')?.addEventListener('click', async () => {
        await saveArticle();
    });
    
    document.getElementById('cancel-article-button')?.addEventListener('click', () => {
        closeArticleEditor();
    });
    
    document.getElementById('article-content-type')?.addEventListener('change', (e) => {
        const contentType = (e.target as HTMLSelectElement).value;
        const editorContainer = document.getElementById('article-editor-container');
        const externalUrlGroup = document.getElementById('external-url-group');
        
        if (contentType === 'internal') {
            editorContainer!.style.display = 'block';
            externalUrlGroup!.style.display = 'none';
        } else {
            editorContainer!.style.display = 'none';
            externalUrlGroup!.style.display = 'block';
        }
    });
    
    // Pinned articles event listeners
    document.querySelectorAll('.save-pinned-article').forEach(button => {
        button.addEventListener('click', async (e) => {
            const position = parseInt((e.target as HTMLElement).dataset.position || '0');
            if (position > 0) {
                await savePinnedArticle(position);
            }
        });
    });
    
    document.getElementById('save-all-pinned')?.addEventListener('click', async () => {
        await saveAllPinnedArticles();
    });

    // 팝업 탭 전환 이벤트 리스너
    document.querySelectorAll('.popup-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const page = target.getAttribute('data-popup-page');
            if (page) {
                switchPopupTab(page);
            }
        });
    });


    document.getElementById('add-exchange-button')?.addEventListener('click', () => createNewItem('exchange_exchanges'));
    document.getElementById('add-faq-button')?.addEventListener('click', () => createNewItem('exchange_faqs'));

    document.getElementById('main-content')?.addEventListener('click', e => {
        const target = e.target as HTMLButtonElement;
        const card = target.closest('.item-card') as HTMLElement;
        if (!card) return;

        const tableName = card.dataset.listName;
        const itemId = parseInt(card.dataset.itemId || '0', 10);
        
        if (target.classList.contains('delete-button')) {
            if (tableName) deleteItem(tableName, itemId);
        } else if (target.classList.contains('save-item-button')) {
            const itemData = readDataFromCard(card);
            if (tableName) {
                // 임시 ID(음수)인 경우 ID를 제거하여 새 항목으로 저장
                const saveId = itemId < 0 ? undefined : itemId;
                saveItem(tableName, itemData, saveId);
            }
        }
    });
}

function readDataFromSection(section: string): any {
    if (section === 'popup') {
        // 현재 활성 탭에 따라 다른 팝업 데이터 반환
        const activeTab = document.querySelector('.popup-tab.active')?.getAttribute('data-popup-page') || 'exchange';
        
        if (activeTab === 'exchange') {
            return {
                pageName: 'popup',
                data: {
                    enabled: (document.getElementById('exchange-popup-enabled-input') as HTMLInputElement).checked,
                    type: (document.querySelector('input[name="exchange-popup-type"]:checked') as HTMLInputElement)?.value || 'text',
                    content: (document.getElementById('exchange-popup-content-ko-input') as HTMLTextAreaElement).value,
                    imageUrl: (document.getElementById('exchange-popup-image-url-input') as HTMLInputElement).value,
                    startDate: (document.getElementById('exchange-popup-start-date-input') as HTMLInputElement).value,
                    endDate: (document.getElementById('exchange-popup-end-date-input') as HTMLInputElement).value
                }
            };
        } else {
            return {
                pageName: 'indexPopup',
                data: {
                    enabled: (document.getElementById('index-popup-enabled-input') as HTMLInputElement).checked,
                    type: (document.querySelector('input[name="index-popup-type"]:checked') as HTMLInputElement)?.value || 'text',
                    content: (document.getElementById('index-popup-content-ko-input') as HTMLTextAreaElement).value,
                    imageUrl: (document.getElementById('index-popup-image-url-input') as HTMLInputElement).value,
                    startDate: (document.getElementById('index-popup-start-date-input') as HTMLInputElement).value,
                    endDate: (document.getElementById('index-popup-end-date-input') as HTMLInputElement).value
                }
            };
        }
    } else if (section === 'hero') {
        return {
            title: (document.getElementById('hero-title-ko-input') as HTMLTextAreaElement).value,
            subtitle: (document.getElementById('hero-subtitle-ko-input') as HTMLTextAreaElement).value
        };
    } else if (section === 'aboutUs') {
        return {
            title: (document.getElementById('about-us-title-ko-input') as HTMLInputElement).value,
            content: (document.getElementById('about-us-content-ko-input') as HTMLTextAreaElement).value
        };
    } else if (section === 'support') {
         return {
             telegramUrl: (document.getElementById('support-telegram-url-input') as HTMLInputElement).value
         };
    }
    return {};
}

function createNewItem(tableName: string) {
    // 새 항목을 화면에만 추가하고 저장하지 않습니다
    if (tableName === 'exchange_exchanges') {
        const newExchange = {
            id: -Date.now(), // 임시 ID (음수로 설정하여 실제 ID와 구분)
            name_ko: '',
            logoimageurl: '',
            benefit1_tag_ko: '',
            benefit1_value_ko: '',
            benefit2_tag_ko: '',
            benefit2_value_ko: '',
            benefit3_tag_ko: '',
            benefit3_value_ko: '',
            benefit4_tag_ko: '',
            benefit4_value_ko: '',
            link: ''
        };
        siteData.exchanges.push(newExchange);
        renderExchanges();
        // 새로 생성된 카드로 스크롤
        setTimeout(() => {
            const newCard = document.querySelector(`[data-item-id="${newExchange.id}"]`);
            if (newCard) {
                newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    } else if (tableName === 'exchange_faqs') {
        const newFaq = {
            id: -Date.now(), // 임시 ID
            question_ko: '',
            answer_ko: ''
        };
        siteData.faqs.push(newFaq);
        renderFaqs();
        // 새로 생성된 카드로 스크롤
        setTimeout(() => {
            const newCard = document.querySelector(`[data-item-id="${newFaq.id}"]`);
            if (newCard) {
                newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
}

function readDataFromCard(cardElement: HTMLElement): DatabaseRecord {
    const data: DatabaseRecord = {};
    cardElement.querySelectorAll('.item-input').forEach(input => {
        // classList에서 필드 이름 추출 (두 번째 클래스가 필드 이름)
        const classList = Array.from((input as HTMLElement).classList);
        const key = classList.find(cls => cls !== 'item-input') || '';
        const lang = (input as HTMLElement).dataset.lang;
        const dbKey = lang ? `${key}_${lang}` : key;
        data[dbKey] = (input as HTMLInputElement | HTMLTextAreaElement).value;
    });
    return data;
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const editorSections = document.querySelectorAll('.editor-section');
    const mainContentTitle = document.getElementById('main-content-title');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function switchTab(targetId: string) {
        const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
        if (activeLink && mainContentTitle) {
            const titleSpan = activeLink.querySelector('span');
            if (titleSpan) mainContentTitle.textContent = titleSpan.textContent;
        }
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('data-target') === targetId));
        editorSections.forEach(section => section.classList.toggle('active', section.id === targetId));
        
        // Close mobile menu when switching tabs
        closeMobileMenu();
    }

    function closeMobileMenu() {
        sidebar?.classList.remove('mobile-open');
        sidebarOverlay?.classList.remove('active');
    }

    function toggleMobileMenu() {
        sidebar?.classList.toggle('mobile-open');
        sidebarOverlay?.classList.toggle('active');
    }

    // Mobile menu toggle
    mobileMenuToggle?.addEventListener('click', toggleMobileMenu);
    sidebarOverlay?.addEventListener('click', closeMobileMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = (e.currentTarget as HTMLElement).getAttribute('data-target');
            if (targetId) switchTab(targetId);
        });
    });

    const initialTarget = (navLinks[0] as HTMLElement)?.getAttribute('data-target');
    if (initialTarget) switchTab(initialTarget);
    
    // Setup banner management
    setupBannerManagement();
}

function setupBannerManagement() {
    // Setup banner tabs
    const bannerTabs = document.querySelectorAll('.banner-tabs .tab-btn');
    const bannerPanels = document.querySelectorAll('.banner-content .tab-panel');
    
    bannerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const page = tab.getAttribute('data-page');
            if (!page) return;
            
            // Update active tab
            bannerTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active panel
            bannerPanels.forEach(panel => {
                panel.classList.toggle('active', panel.getAttribute('data-page') === page);
            });
        });
    });
    
    // Setup banner save buttons
    const saveBannerButtons = document.querySelectorAll('[data-section$="-banner"]');
    saveBannerButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const section = button.getAttribute('data-section');
            if (section) {
                await saveBannerSection(section);
            }
        });
    });
    
    // Load existing banner data
    loadBannerData();
}

async function saveBannerSection(section: string) {
    try {
        const page = section.replace('-banner', '');
        const enabled = (document.getElementById(`${page}-banner-enabled`) as HTMLInputElement)?.checked || false;
        const imageUrl = (document.getElementById(`${page}-banner-image`) as HTMLInputElement)?.value || '';
        const content = (document.getElementById(`${page}-banner-content`) as HTMLTextAreaElement)?.value || '';
        
        const bannerData = {
            page: page,
            enabled: enabled,
            image_url: imageUrl,
            content: content,
            updated_at: new Date().toISOString()
        };
        
        // Check if banner exists
        const { data: existingBanner } = await supabase
            .from('banners')
            .select('id')
            .eq('page', page)
            .single();
            
        if (existingBanner) {
            // Update existing banner
            const { error } = await supabase
                .from('banners')
                .update(bannerData)
                .eq('page', page);
                
            if (error) throw error;
        } else {
            // Insert new banner
            const { error } = await supabase
                .from('banners')
                .insert(bannerData);
                
            if (error) throw error;
        }
        
        showToast(`${page} 배너가 저장되었습니다.`);
        
    } catch (error) {
        console.error('Banner save error:', error);
        showToast('배너 저장 중 오류가 발생했습니다.', 'error');
    }
}

async function loadBannerData() {
    try {
        const { data: banners, error } = await supabase
            .from('banners')
            .select('*');
            
        if (error) throw error;
        
        banners?.forEach((banner: any) => {
            const enabledCheckbox = document.getElementById(`${banner.page}-banner-enabled`) as HTMLInputElement;
            const imageInput = document.getElementById(`${banner.page}-banner-image`) as HTMLInputElement;
            const contentTextarea = document.getElementById(`${banner.page}-banner-content`) as HTMLTextAreaElement;
            
            if (enabledCheckbox) enabledCheckbox.checked = banner.enabled;
            if (imageInput) imageInput.value = banner.image_url || '';
            if (contentTextarea) contentTextarea.value = banner.content || '';
        });
        
    } catch (error) {
        console.error('Banner load error:', error);
    }
}

function switchPopupTab(page: string) {
    // 탭 활성화 상태 업데이트
    document.querySelectorAll('.popup-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-popup-page="${page}"]`)?.classList.add('active');
    
    // 팝업 콘텐츠 컨테이너 표시/숨김
    document.getElementById('exchange-popup-content')!.style.display = page === 'exchange' ? 'block' : 'none';
    document.getElementById('index-popup-content')!.style.display = page === 'index' ? 'block' : 'none';
}


export {};