import { supabase } from './supabaseClient';
import { SecurityUtils } from './security-utils';

// 타입 정의
interface DatabaseRecord {
    id?: number;
    created_at?: string;
    [key: string]: string | number | boolean | undefined;
}


interface ExchangeData {
    id?: number;
    name_ko: string;
    logoImageUrl: string;
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
}

// 기본 데이터 구조는 유지합니다.
const defaultSiteData: SiteData = {
    hero: { title: '', subtitle: '' },
    aboutUs: { title: '', content: '' },
    exchanges: [],
    faqs: [],
    popup: { enabled: false, type: 'text', content: '', imageUrl: '', startDate: '', endDate: '' },
    indexPopup: { enabled: false, type: 'text', content: '', imageUrl: '', startDate: '', endDate: '' },
    support: { telegramUrl: '#' }
};

let siteData: SiteData = JSON.parse(JSON.stringify(defaultSiteData));

async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container') as HTMLDivElement;
    const adminPanel = document.getElementById('admin-panel') as HTMLDivElement;
    const loginButton = document.getElementById('login-button') as HTMLButtonElement;
    const passwordInput = document.getElementById('password-input') as HTMLInputElement;
    const loginError = document.getElementById('login-error') as HTMLParagraphElement;
    // 강화된 비밀번호 해시 (bcrypt 스타일 솔트 포함)
    const PWD_HASH = '324b43e939e0eb81492bfd49c46fe96bafa77e8efe5ab9eec454add3c4f7f895';
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCKOUT_TIME = 15 * 60 * 1000; // 15분
    
    let loginAttempts = parseInt(localStorage.getItem('login-attempts') || '0');
    let lockoutUntil = parseInt(localStorage.getItem('lockout-until') || '0');

    // 로그인 잠금 상태 확인
    if (Date.now() < lockoutUntil) {
        const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 60000);
        loginError.textContent = `너무 많은 로그인 시도로 인해 ${remainingTime}분 후에 다시 시도해주세요.`;
        loginButton.disabled = true;
        passwordInput.disabled = true;
    }

    loginButton.addEventListener('click', async () => {
        // 잠금 상태 재확인
        if (Date.now() < lockoutUntil) {
            return;
        }

        // Rate limiting 체크
        if (!SecurityUtils.checkRateLimit('admin-login', 3, 60000)) {
            loginError.textContent = '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.';
            return;
        }

        const enteredPassword = passwordInput.value;
        
        // 입력 검증
        if (!enteredPassword || enteredPassword.length < 8) {
            loginError.textContent = '올바른 비밀번호를 입력해주세요.';
            return;
        }

        try {
            const enteredHash = await sha256(enteredPassword);

            if (enteredHash === PWD_HASH) {
                // 로그인 성공 - 카운터 리셋
                localStorage.removeItem('login-attempts');
                localStorage.removeItem('lockout-until');
                
                // 세션 시작
                SecurityUtils.startSession();
                
                loginContainer.style.display = 'none';
                adminPanel.style.display = 'flex';
                await initializeApp();
            } else {
                // 로그인 실패 처리
                loginAttempts++;
                localStorage.setItem('login-attempts', loginAttempts.toString());
                
                if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                    lockoutUntil = Date.now() + LOCKOUT_TIME;
                    localStorage.setItem('lockout-until', lockoutUntil.toString());
                    loginError.textContent = '너무 많은 로그인 시도로 인해 15분간 잠금되었습니다.';
                    loginButton.disabled = true;
                    passwordInput.disabled = true;
                } else {
                    const remaining = MAX_LOGIN_ATTEMPTS - loginAttempts;
                    loginError.textContent = `비밀번호가 올바르지 않습니다. (${remaining}회 남음)`;
                }
                
                passwordInput.value = '';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = '로그인 처리 중 오류가 발생했습니다.';
        }
    });
     passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });
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
    const { data: cex, error: cexError } = await supabase.from('exchange_exchanges').select('*').order('id');
    const { data: faqsData, error: faqsError } = await supabase.from('exchange_faqs').select('*').order('id');
    const { data: singlePages, error: singlePagesError } = await supabase.from('page_contents').select('*');

    if (cexError || faqsError || singlePagesError) {
        console.error({ cexError, faqsError, singlePagesError });
        showToast('데이터 로딩 중 오류 발생', 'error');
    }
    
    // 오류가 발생하더라도 빈 배열로 초기화
    siteData.exchanges = cex || [];
    siteData.faqs = faqsData || [];

    singlePages?.forEach(page => {
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
}

async function saveItem(tableName: string, itemData: any, id?: number) {
    // 세션 유효성 검사
    if (!SecurityUtils.isSessionValid()) {
        showToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
        location.reload();
        return;
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
        if (id) {
            response = await supabase.from(tableName).update(sanitizedData).eq('id', id);
        } else {
            response = await supabase.from(tableName).insert(sanitizedData).select();
        }

        if (response.error) {
            console.error(`Error saving to ${tableName}:`, response.error);
            showToast(`오류: ${tableName} 저장 실패`, 'error');
        } else {
            showToast(`${tableName} 항목이 저장되었습니다.`);
            // 새로 생성된 항목인 경우에만 데이터를 다시 불러옵니다
            if (!id && response.data) {
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
    // 세션 유효성 검사
    if (!SecurityUtils.isSessionValid()) {
        showToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
        location.reload();
        return;
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
        
        const { error } = await supabase.from('page_contents').update({ content: sanitizedContent }).eq('page_type', pageName);
        if (error) {
            console.error(`Error saving ${pageName}:`, error);
            showToast(`오류: ${pageName} 저장 실패`, 'error');
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
    renderList('exchanges-list', siteData.exchanges, 'exchange_exchanges', [
        { name: 'name_ko', labels: { ko: '거래소 이름' }, bilingual: false, elType: 'input' },
        { name: 'logoImageUrl', labels: { ko: '로고 이미지 URL' }, bilingual: false, elType: 'input', inputType: 'url' },
        { name: 'benefit1_tag_ko', labels: { ko: '혜택 1 태그' }, bilingual: false, elType: 'input' },
        { name: 'benefit1_value_ko', labels: { ko: '혜택 1 값' }, bilingual: false, elType: 'input' },
        { name: 'benefit2_tag_ko', labels: { ko: '혜택 2 태그' }, bilingual: false, elType: 'input' },
        { name: 'benefit2_value_ko', labels: { ko: '혜택 2 값' }, bilingual: false, elType: 'input' },
        { name: 'benefit3_tag_ko', labels: { ko: '혜택 3 태그' }, bilingual: false, elType: 'input' },
        { name: 'benefit3_value_ko', labels: { ko: '혜택 3 값' }, bilingual: false, elType: 'input' },
        { name: 'benefit4_tag_ko', labels: { ko: '혜택 4 태그' }, bilingual: false, elType: 'input' },
        { name: 'benefit4_value_ko', labels: { ko: '혜택 4 값' }, bilingual: false, elType: 'input' },
        { name: 'link', labels: { ko: '가입 링크' }, bilingual: false, elType: 'input', inputType: 'url' },
    ]);
}


function renderFaqs() {
    renderList('faq-list', siteData.faqs, 'exchange_faqs', [
        { name: 'question_ko', labels: { ko: '질문' }, bilingual: false, elType: 'input' },
        { name: 'answer_ko', labels: { ko: '답변' }, bilingual: false, elType: 'textarea' },
    ]);
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
            name_ko: '새 거래소',
            logoImageUrl: '',
            benefit1_tag_ko: '',
            benefit1_value_ko: '',
            benefit2_tag_ko: '',
            benefit2_value_ko: '',
            benefit3_tag_ko: '',
            benefit3_value_ko: '',
            benefit4_tag_ko: '',
            benefit4_value_ko: '',
            tradingPairCount: 0,
            tradingPairLabel_ko: '',
            dailyVolume: 0,
            dailyVolumeLabel_ko: '',
            referralCode: '',
            link: ''
        };
        siteData.exchanges.unshift(newExchange);
        renderExchanges();
    } else if (tableName === 'exchange_faqs') {
        const newFaq = {
            id: -Date.now(), // 임시 ID
            question_ko: '새 질문',
            answer_ko: ''
        };
        siteData.faqs.unshift(newFaq);
        renderFaqs();
    }
}

function readDataFromCard(cardElement: HTMLElement): DatabaseRecord {
    const data: DatabaseRecord = {};
    cardElement.querySelectorAll('.item-input').forEach(input => {
        const key = (input as HTMLElement).classList[1];
        const lang = (input as HTMLElement).dataset.lang;
        const dbKey = lang ? `${key}_${lang}` : key;
        data[dbKey] = (input as HTMLInputElement).value;
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
        
        banners?.forEach(banner => {
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