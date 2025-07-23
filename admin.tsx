import { supabase } from './supabaseClient';

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
    await fetchDataFromSupabase();
    renderAll();
    setupEventListeners();
    setupNavigation();
}

// --- Supabase 데이터 통신 함수들 ---

async function fetchDataFromSupabase() {
    showToast('데이터를 불러오는 중...');
    const { data: cex, error: cexError } = await supabase.from('cex_exchanges').select('*').order('id');
    const { data: dex, error: dexError } = await supabase.from('dex_exchanges').select('*').order('id');
    const { data: faqsData, error: faqsError } = await supabase.from('faqs').select('*').order('id');
    const { data: guidesData, error: guidesError } = await supabase.from('guides').select('*').order('id');
    const { data: singlePages, error: singlePagesError } = await supabase.from('single_pages').select('*');

    if (cexError || dexError || faqsError || guidesError || singlePagesError) {
        console.error({ cexError, dexError, faqsError, guidesError, singlePagesError });
        showToast('데이터 로딩 중 오류 발생', 'error');
        return;
    }
    
    siteData.exchanges = cex || [];
    siteData.dexExchanges = dex || [];
    siteData.faqs = faqsData || [];
    siteData.guides = guidesData || [];

    singlePages?.forEach(page => {
        if (siteData[page.page_name]) {
            // content가 null이 아닐 경우에만 병합
            if (page.content && typeof page.content === 'object') {
                 siteData[page.page_name] = { ...siteData[page.page_name], ...page.content };
            }
        }
    });
    
    showToast('데이터 로딩 완료!');
}

async function saveItem(tableName: string, itemData: any, id?: number) {
    let response;
    // id 필드는 자동 생성되므로 insert/update 데이터에서 제외
    const dataToSave = { ...itemData };
    delete dataToSave.id;
    delete dataToSave.created_at;

    if (id) {
        response = await supabase.from(tableName).update(dataToSave).eq('id', id);
    } else {
        response = await supabase.from(tableName).insert(dataToSave).select();
    }

    if (response.error) {
        console.error(`Error saving to ${tableName}:`, response.error);
        showToast(`오류: ${tableName} 저장 실패`, 'error');
    } else {
        showToast(`${tableName} 항목이 저장되었습니다.`);
    }
    await fetchDataFromSupabase();
    renderAll();
}

async function saveSinglePage(pageName: string, content: any) {
    const { error } = await supabase.from('single_pages').update({ content }).eq('page_name', pageName);
    if (error) {
        console.error(`Error saving ${pageName}:`, error);
        showToast(`오류: ${pageName} 저장 실패`, 'error');
    } else {
        showToast(`${pageName} 섹션이 저장되었습니다.`);
    }
    await fetchDataFromSupabase();
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
    renderDexExchanges();
    renderFaqs();
    renderGuides();
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


function renderList(containerId: string, dataList: any[], listName: string, fields: any[]) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const fragment = document.createDocumentFragment();

    dataList.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.index = index.toString();
        card.dataset.listName = listName;
        card.dataset.itemId = item.id;

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
    (document.getElementById('hero-title-ko-input') as HTMLTextAreaElement).value = siteData.hero.title.ko;
    (document.getElementById('hero-title-en-input') as HTMLTextAreaElement).value = siteData.hero.title.en;
    (document.getElementById('hero-subtitle-ko-input') as HTMLTextAreaElement).value = siteData.hero.subtitle.ko;
    (document.getElementById('hero-subtitle-en-input') as HTMLTextAreaElement).value = siteData.hero.subtitle.en;
}

function renderAboutUs() {
    (document.getElementById('about-us-title-ko-input') as HTMLInputElement).value = siteData.aboutUs.title.ko;
    (document.getElementById('about-us-title-en-input') as HTMLInputElement).value = siteData.aboutUs.title.en;
    (document.getElementById('about-us-content-ko-input') as HTMLTextAreaElement).value = siteData.aboutUs.content.ko;
    (document.getElementById('about-us-content-en-input') as HTMLTextAreaElement).value = siteData.aboutUs.content.en;
}

function renderPopup() {
    const popup = siteData.popup;
    if (!popup) return;
    (document.getElementById('popup-enabled-input') as HTMLInputElement).checked = popup.enabled;
    document.querySelectorAll<HTMLInputElement>('input[name="popup-type"]').forEach(radio => {
        radio.checked = radio.value === popup.type;
    });
    (document.getElementById('popup-content-ko-input') as HTMLTextAreaElement).value = popup.content.ko;
    (document.getElementById('popup-content-en-input') as HTMLTextAreaElement).value = popup.content.en;
    (document.getElementById('popup-image-url-input') as HTMLInputElement).value = popup.imageUrl;
    (document.getElementById('popup-start-date-input') as HTMLInputElement).value = popup.startDate;
    (document.getElementById('popup-end-date-input') as HTMLInputElement).value = popup.endDate;
}

function renderSupport() {
    const input = document.getElementById('support-telegram-url-input') as HTMLInputElement;
    if (input && siteData.support) {
        input.value = siteData.support.telegramUrl;
    }
}

function renderExchanges() {
    renderList('exchanges-list', siteData.exchanges, 'cex_exchanges', [
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


function setupEventListeners() {
    document.querySelectorAll('.save-section-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const section = (e.target as HTMLElement).dataset.section;
            if (section) {
                const content = readDataFromSection(section);
                saveSinglePage(section, content);
            }
        });
    });

    document.getElementById('add-exchange-button').addEventListener('click', () => createNewItem('cex_exchanges'));
    document.getElementById('add-dex-exchange-button').addEventListener('click', () => createNewItem('dex_exchanges'));
    document.getElementById('add-faq-button').addEventListener('click', () => createNewItem('faqs'));
    document.getElementById('add-guide-button').addEventListener('click', () => createNewItem('guides'));

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

function readDataFromSection(section: string): any {
    if (section === 'popup') {
        return {
            enabled: (document.getElementById('popup-enabled-input') as HTMLInputElement).checked,
            type: (document.querySelector('input[name="popup-type"]:checked') as HTMLInputElement).value,
            content: {
                ko: (document.getElementById('popup-content-ko-input') as HTMLTextAreaElement).value,
                en: (document.getElementById('popup-content-en-input') as HTMLTextAreaElement).value
            },
            imageUrl: (document.getElementById('popup-image-url-input') as HTMLInputElement).value,
            startDate: (document.getElementById('popup-start-date-input') as HTMLInputElement).value,
            endDate: (document.getElementById('popup-end-date-input') as HTMLInputElement).value
        };
    } else if (section === 'hero') {
        return {
            title: {
                ko: (document.getElementById('hero-title-ko-input') as HTMLTextAreaElement).value,
                en: (document.getElementById('hero-title-en-input') as HTMLTextAreaElement).value
            },
            subtitle: {
                ko: (document.getElementById('hero-subtitle-ko-input') as HTMLTextAreaElement).value,
                en: (document.getElementById('hero-subtitle-en-input') as HTMLTextAreaElement).value
            }
        };
    } else if (section === 'aboutUs') {
        return {
            title: {
                ko: (document.getElementById('about-us-title-ko-input') as HTMLInputElement).value,
                en: (document.getElementById('about-us-title-en-input') as HTMLInputElement).value
            },
            content: {
                ko: (document.getElementById('about-us-content-ko-input') as HTMLTextAreaElement).value,
                en: (document.getElementById('about-us-content-en-input') as HTMLTextAreaElement).value
            }
        };
    } else if (section === 'support') {
         return {
             telegramUrl: (document.getElementById('support-telegram-url-input') as HTMLInputElement).value
         };
    }
    return {};
}

async function createNewItem(tableName: string) {
    let newItemData = {};
    if (tableName === 'cex_exchanges' || tableName === 'dex_exchanges') {
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

export {};