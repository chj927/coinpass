import { supabase } from '../src/supabaseClient';

// 기본 데이터 구조는 유지합니다.
const defaultSiteData = {
    hero: { title: { ko: '', en: '' }, subtitle: { ko: '', en: '' }},
    aboutUs: { title: { ko: '', en: '' }, content: { ko: '', en: '' }},
    exchanges: [],
    dexExchanges: [],
    faqs: [],
    guides: [],
    popup: { enabled: false, type: 'text', content: { ko: '', en: '' }, imageUrl: '', startDate: '', endDate: '' },
    support: { telegramUrl: '#' }
};

let siteData = JSON.parse(JSON.stringify(defaultSiteData));

async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    // 로그인 로직은 동일합니다.
    const loginContainer = document.getElementById('login-container') as HTMLDivElement;
    const adminPanel = document.getElementById('admin-panel') as HTMLDivElement;
    const loginButton = document.getElementById('login-button') as HTMLButtonElement;
    const passwordInput = document.getElementById('password-input') as HTMLInputElement;
    const loginError = document.getElementById('login-error') as HTMLParagraphElement;
    const PWD_HASH = '324b43e939e0eb81492bfd49c46fe96bafa77e8efe5ab9eec454add3c4f7f895';

    loginButton.addEventListener('click', async () => {
        const enteredPassword = passwordInput.value;
        const enteredHash = await sha256(enteredPassword);

        if (enteredHash === PWD_HASH) {
            loginContainer.style.display = 'none';
            adminPanel.style.display = 'flex';
            initializeApp();
        } else {
            loginError.textContent = '비밀번호가 올바르지 않습니다.';
            passwordInput.value = '';
        }
    });
     passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginButton.click();
        }
    });
});

async function initializeApp() {
    await fetchDataFromSupabase(); // 데이터를 Supabase에서 불러옵니다.
    renderAll();
    setupEventListeners();
    setupNavigation();
}

// --- Supabase 데이터 통신 함수들 ---

async function fetchDataFromSupabase() {
    showToast('데이터를 불러오는 중...');
    const { data: exchanges, error: exchangesError } = await supabase.from('exchanges').select('*').order('id');
    const { data: dexExchanges, error: dexError } = await supabase.from('dex_exchanges').select('*').order('id');
    const { data: faqs, error: faqsError } = await supabase.from('faqs').select('*').order('id');
    const { data: guides, error: guidesError } = await supabase.from('guides').select('*').order('id');
    
    // TODO: hero, aboutUs 등 단일 섹션 데이터 가져오는 로직 추가 필요 (별도 테이블 생성 후)
    // 지금은 목록형 데이터만 가져옵니다.

    if (exchangesError) console.error('Error fetching exchanges:', exchangesError);
    if (dexError) console.error('Error fetching dex_exchanges:', dexError);
    if (faqsError) console.error('Error fetching faqs:', faqsError);
    if (guidesError) console.error('Error fetching guides:', guidesError);

    siteData.exchanges = exchanges || [];
    siteData.dexExchanges = dexExchanges || [];
    siteData.faqs = faqs || [];
    siteData.guides = guides || [];
    
    showToast('데이터 로딩 완료!');
}

async function saveItem(tableName: string, itemData: any, id?: number) {
    let response;
    if (id) {
        // ID가 있으면 기존 데이터 업데이트
        response = await supabase.from(tableName).update(itemData).eq('id', id);
    } else {
        // ID가 없으면 새 데이터 추가
        response = await supabase.from(tableName).insert(itemData);
    }

    if (response.error) {
        console.error(`Error saving to ${tableName}:`, response.error);
        showToast(`오류: ${tableName} 저장 실패`, 'error');
    } else {
        showToast(`${tableName} 항목이 저장되었습니다.`);
    }
    await fetchDataFromSupabase(); // 데이터를 다시 불러와 화면 갱신
    renderAll();
}

async function deleteItem(tableName: string, id: number) {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    const { error } = await supabase.from(tableName).delete().eq('id', id);

    if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        showToast(`오류: ${tableName} 삭제 실패`, 'error');
    } else {
        showToast(`${tableName} 항목이 삭제되었습니다.`);
    }
    await fetchDataFromSupabase();
    renderAll();
}


// --- 기존 렌더링 함수들 (수정됨) ---

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
    // 단일 섹션 렌더링 (아직 DB 연동 안됨)
    renderHero();
    renderAboutUs();
    renderPopup();
    renderSupport();
    // 목록 렌더링 (DB 연동됨)
    renderExchanges();
    renderDexExchanges();
    renderFaqs();
    renderGuides();
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
        card.dataset.itemId = item.id; // Supabase의 id를 저장

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
    const input = document.createElement(elType) as HTMLInputElement;
    input.type = inputType;
    input.value = item[baseName] || '';
    input.className = `item-input ${baseName}`;
    group.append(labelEl, input);
    container.appendChild(group);
}


function renderExchanges() {
    renderList('exchanges-list', siteData.exchanges, 'exchanges', [
        { name: 'name', labels: { ko: '이름 (KO)', en: 'Name (EN)' }, bilingual: true, elType: 'input' },
        { name: 'logoImageUrl', labels: { ko: '로고 이미지 URL', en: 'Logo Image URL' }, bilingual: false, elType: 'input', inputType: 'url' },
        { name: 'benefit1_tag', labels: { ko: '혜택 1 태그 (KO)', en: 'Benefit 1 Tag (EN)' }, bilingual: true, elType: 'input' },
        { name: 'benefit1_value', labels: { ko: '혜택 1 값 (KO)', en: 'Benefit 1 Value (EN)' }, bilingual: true, elType: 'input' },
        { name: 'benefit2_tag', labels: { ko: '혜택 2 태그 (KO)', en: 'Benefit 2 Tag (EN)' }, bilingual: true, elType: 'input' },
        { name: 'benefit2_value', labels: { ko: '혜택 2 값 (KO)', en: 'Benefit 2 Value (EN)' }, bilingual: true, elType: 'input' },
        { name: 'link', labels: { ko: '가입 링크', en: 'Signup Link' }, bilingual: false, elType: 'input', inputType: 'url' },
    ]);
}

function renderDexExchanges() {
     renderList('dex-exchanges-list', siteData.dexExchanges, 'dex_exchanges', [
        { name: 'name', labels: { ko: '이름 (KO)', en: 'Name (EN)' }, bilingual: true, elType: 'input' },
        { name: 'logoImageUrl', labels: { ko: '로고 이미지 URL', en: 'Logo Image URL' }, bilingual: false, elType: 'input', inputType: 'url' },
        { name: 'benefit1_tag', labels: { ko: '혜택 1 태그 (KO)', en: 'Benefit 1 Tag (EN)' }, bilingual: true, elType: 'input' },
        { name: 'benefit1_value', labels: { ko: '혜택 1 값 (KO)', en: 'Benefit 1 Value (EN)' }, bilingual: true, elType: 'input' },
        { name: 'benefit2_tag', labels: { ko: '혜택 2 태그 (KO)', en: 'Benefit 2 Tag (EN)' }, bilingual: true, elType: 'input' },
        { name: 'benefit2_value', labels: { ko: '혜택 2 값 (KO)', en: 'Benefit 2 Value (EN)' }, bilingual: true, elType: 'input' },
        { name: 'link', labels: { ko: '가입 링크', en: 'Signup Link' }, bilingual: false, elType: 'input', inputType: 'url' },
    ]);
}

function renderFaqs() {
    renderList('faq-list', siteData.faqs, 'faqs', [
        { name: 'question', labels: { ko: '질문 (KO)', en: 'Question (EN)' }, bilingual: true, elType: 'input' },
        { name: 'answer', labels: { ko: '답변 (KO)', en: 'Answer (EN)' }, bilingual: true, elType: 'textarea' },
    ]);
}

function renderGuides() {
    renderList('guides-list', siteData.guides, 'guides', [
        { name: 'title', labels: { ko: '제목 (KO)', en: 'Title (EN)' }, bilingual: true, elType: 'input' },
        { name: 'content', labels: { ko: '내용 (KO)', en: 'Content (EN)' }, bilingual: true, elType: 'textarea' },
    ]);
}

function renderHero() { /* 단일 섹션은 추후 구현 */ }
function renderAboutUs() { /* 단일 섹션은 추후 구현 */ }
function renderPopup() { /* 단일 섹션은 추후 구현 */ }
function renderSupport() { /* 단일 섹션은 추후 구현 */ }


function setupEventListeners() {
    // 단일 섹션 저장 버튼 (현재는 비활성화)
    document.querySelectorAll('.save-section-button').forEach(button => {
        button.addEventListener('click', () => alert('이 기능은 추후 구현될 예정입니다.'));
    });

    // 목록형 데이터 추가 버튼
    document.getElementById('add-exchange-button').addEventListener('click', () => createNewItem('exchanges'));
    document.getElementById('add-dex-exchange-button').addEventListener('click', () => createNewItem('dex_exchanges'));
    document.getElementById('add-faq-button').addEventListener('click', () => createNewItem('faqs'));
    document.getElementById('add-guide-button').addEventListener('click', () => createNewItem('guides'));

    // 목록형 데이터 저장/삭제 이벤트 리스너 (이벤트 위임)
    document.getElementById('main-content').addEventListener('click', e => {
        const target = e.target as HTMLButtonElement;
        const card = target.closest('.item-card');
        if (!card) return;

        const tableName = card.dataset.listName;
        const itemId = parseInt(card.dataset.itemId, 10);
        
        if (target.classList.contains('delete-button')) {
            deleteItem(tableName, itemId);
        } else if (target.classList.contains('save-item-button')) {
            const itemData = readDataFromCard(card);
            saveItem(tableName, itemData, itemId);
        }
    });
}

async function createNewItem(tableName: string) {
    let newItemData = {};
    if (tableName === 'exchanges' || tableName === 'dex_exchanges') {
        newItemData = { name_ko: '새 항목', name_en: 'New Item' };
    } else if (tableName === 'faqs') {
        newItemData = { question_ko: '새 질문', question_en: 'New Question', answer_ko: '', answer_en: '' };
    } else if (tableName === 'guides') {
        newItemData = { title_ko: '새 제목', title_en: 'New Title', content_ko: '', content_en: '' };
    }
    await saveItem(tableName, newItemData);
}

function readDataFromCard(cardElement: HTMLElement): any {
    const data = {};
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

    function switchTab(targetId: string) {
        const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
        if (activeLink && mainContentTitle) {
            const titleSpan = activeLink.querySelector('span');
            if (titleSpan) mainContentTitle.textContent = titleSpan.textContent;
        }
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('data-target') === targetId));
        editorSections.forEach(section => section.classList.toggle('active', section.id === targetId));
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = (e.currentTarget as HTMLElement).getAttribute('data-target');
            if (targetId) switchTab(targetId);
        });
    });

    const initialTarget = (navLinks[0] as HTMLElement)?.getAttribute('data-target');
    if (initialTarget) switchTab(initialTarget);
}

function exportData() {}
function importData() {}

export {};