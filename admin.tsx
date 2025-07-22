
// Default data structure with internationalization (i18n) support
const defaultSiteData = {
    hero: {
        title: {
            ko: `최대 50%까지 거래수수료 할인!
최고의 혜택을 누구나 무료로!
한번 등록하고 평생 혜택받기!`,
            en: `Up to 50% discount on transaction fees!
Enjoy the best benefits for free!
Register once and get lifetime benefits!`
        },
        subtitle: {
            ko: '최고의 혜택을 제공하는 암호화폐 거래소를 한눈에 비교하고 가입하세요.',
            en: 'Compare and sign up for cryptocurrency exchanges that offer the best benefits at a glance.'
        }
    },
    aboutUs: {
        title: {
            ko: '코인패스 : 소수만 독점하던 혜택을 모두에게',
            en: 'Coinpass: Bringing Exclusive Benefits to Everyone'
        },
        content: {
            ko: `소수에게만 허락됐던 거래 수수료 혜택, 코인패스가 모두에게 돌려드립니다.

빠르게 변화하는 암호화폐 시장에서는 정보의 비대칭성이 만연합니다. 부정확한 정보와 무분별한 마케팅 속에서, 내가 받는 혜택이 최선인지 확신하기란 어려운 일입니다. 코인패스는 바로 이 문제의식에서 출발했습니다.

많은 투자자들이 무심코 사용한 추천인 코드로 인해 정당한 혜택을 놓치거나, 페이백을 약속했던 서비스로부터 제대로 된 보상을 받지 못하는 일을 겪습니다. 미미해 보이던 거래 수수료는 어느새 투자 수익을 잠식하는 무시할 수 없는 비용이 됩니다.

코인패스의 미션은 명확합니다. 모든 투자자가 투명한 정보에 기반하여 거래 비용을 최소화하고, 투자의 본질에만 집중할 수 있는 환경을 만드는 것. 저희는 신뢰할 수 있는 파트너십을 통해 업계 최고 수준의 수수료 혜택을 확보하고, 이를 모든 사용자에게 공정하게 제공합니다.

코인패스는 수익 극대화가 아닌 '혜택의 공유'를 최우선 가치로 삼습니다. 최소한의 운영비를 제외한 수익은 사용자에게 돌아가는 선순환 구조를 지향합니다.

이제 코인패스와 함께 당신의 Web3 여정을 시작하세요. 거래소를 넘어 다양한 프로젝트와의 연계를 통해, 가장 든든한 파트너가 되어 드리겠습니다.`,
            en: `The trading fee benefits that were once exclusive to a select few are now being returned to everyone by Coinpass.

In the fast-paced cryptocurrency market, information asymmetry is rampant. Amid inaccurate information and indiscriminate marketing, it's difficult to be sure if the benefits you're receiving are the best possible. Coinpass was born from this very concern.

Many investors miss out on rightful benefits due to casually used referral codes or fail to receive proper compensation from services that promised payback. What seemed like a negligible transaction fee gradually becomes a significant cost that erodes investment returns.

Coinpass's mission is clear: to create an environment where all investors can minimize trading costs based on transparent information and focus solely on the essence of investing. We secure the industry's highest level of fee benefits through trusted partnerships and provide them fairly to all users.

Coinpass prioritizes 'sharing benefits' over profit maximization. We aim for a virtuous cycle where profits, excluding minimal operating costs, are returned to the users.

Start your Web3 journey with Coinpass now. Beyond exchanges, we will become your most reliable partner through connections with various projects.`
        }
    },
    exchanges: [],
    dexExchanges: [],
    faqs: [],
    guides: [],
    popup: {
        enabled: false,
        type: 'text', // 'text' or 'image'
        content: { ko: '', en: '' },
        imageUrl: '',
        startDate: '', // ISO string
        endDate: '',   // ISO string
    },
    support: {
        telegramUrl: '#'
    }
};


let siteData = { ...defaultSiteData };
const DATA_KEY = 'coinpass-content';

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
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

function initializeApp() {
    loadData();
    renderAll();
    setupEventListeners();
    setupNavigation();
}

function loadData() {
    const savedData = localStorage.getItem(DATA_KEY);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            // Deep merge to keep default structure for new sections
            siteData = deepMerge(defaultSiteData, parsed);
        } catch (e) {
            console.error('Failed to parse data from localStorage, using default.', e);
            siteData = { ...defaultSiteData };
        }
    }
}

function deepMerge(target, source) {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else if (Array.isArray(source[key])) {
                 output[key] = source[key]; // Overwrite arrays
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}


function saveData() {
    localStorage.setItem(DATA_KEY, JSON.stringify(siteData));
    alert('저장되었습니다!');
}

function renderAll() {
    renderHero();
    renderAboutUs();
    renderExchanges();
    renderDexExchanges();
    renderFaqs();
    renderGuides();
    renderPopup();
    renderSupport();
}

// Render functions
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


function createBilingualFormGroup(container, baseName, labels, item, index, elType = 'input') {
    const group = document.createElement('div');
    group.className = 'bilingual-group';

    const koGroup = document.createElement('div');
    koGroup.className = 'form-group';
    const koLabel = document.createElement('label');
    koLabel.textContent = labels.ko;
    const koInput = document.createElement(elType);
    (koInput as any).value = item[baseName].ko;
    koInput.className = `item-input ${baseName}`;
    koInput.dataset.lang = 'ko';
    koInput.dataset.index = index.toString();
    if(elType === 'textarea') (koInput as HTMLTextAreaElement).rows = 10;
    koGroup.append(koLabel, koInput);

    const enGroup = document.createElement('div');
    enGroup.className = 'form-group';
    const enLabel = document.createElement('label');
    enLabel.textContent = labels.en;
    const enInput = document.createElement(elType);
    (enInput as any).value = item[baseName].en;
    enInput.className = `item-input ${baseName}`;
    enInput.dataset.lang = 'en';
    enInput.dataset.index = index.toString();
    if(elType === 'textarea') (enInput as HTMLTextAreaElement).rows = 10;
    enGroup.append(enLabel, enInput);

    group.append(koGroup, enGroup);
    container.appendChild(group);
}

function createSingleFormGroup(container, baseName, label, item, index, elType = 'input', inputType = 'text') {
    const group = document.createElement('div');
    group.className = 'form-group';
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    const input = document.createElement(elType);
    (input as any).type = inputType;
    (input as any).value = item[baseName];
    input.className = `item-input ${baseName}`;
    input.dataset.index = index.toString();
    group.append(labelEl, input);
    container.appendChild(group);
}

function renderList(containerId, dataList, listName, fields) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const fragment = document.createDocumentFragment();

    dataList.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        
        const h4 = document.createElement('h4');
        h4.textContent = `${listName} #${index + 1}`;
        card.appendChild(h4);

        fields.forEach(field => {
            if (field.bilingual) {
                createBilingualFormGroup(card, field.name, field.labels, item, index, field.elType);
            } else {
                createSingleFormGroup(card, field.name, field.labels.ko, item, index, field.elType, field.inputType);
            }
        });

        const controls = document.createElement('div');
        controls.className = 'item-controls';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = `delete-button delete-${listName.toLowerCase()}`;
        deleteBtn.textContent = '삭제';
        deleteBtn.dataset.index = index.toString();
        controls.appendChild(deleteBtn);
        card.appendChild(controls);

        fragment.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}


function renderExchanges() {
    renderList('exchanges-list', siteData.exchanges, 'CEX', [
        { name: 'name', labels: { ko: '이름 (KO)', en: 'Name (EN)' }, bilingual: true, elType: 'input' },
        { name: 'logoText', labels: { ko: '로고 텍스트', en: 'Logo Text' }, bilingual: false, elType: 'input' },
        { name: 'benefit1_tag', labels: { ko: '혜택 1 태그 (KO)', en: 'Benefit 1 Tag (EN)' }, bilingual: true, elType: 'input' },
        { name: 'benefit1_value', labels: { ko: '혜택 1 값 (KO)', en: 'Benefit 1 Value (EN)' }, bilingual: true, elType: 'input' },
        { name: 'benefit2_tag', labels: { ko: '혜택 2 태그 (KO)', en: 'Benefit 2 Tag (EN)' }, bilingual: true, elType: 'input' },
        { name: 'benefit2_value', labels: { ko: '혜택 2 값 (KO)', en: 'Benefit 2 Value (EN)' }, bilingual: true, elType: 'input' },
        { name: 'link', labels: { ko: '가입 링크', en: 'Signup Link' }, bilingual: false, elType: 'input', inputType: 'url' },
    ]);
}

function renderDexExchanges() {
     renderList('dex-exchanges-list', siteData.dexExchanges, 'DEX', [
        { name: 'name', labels: { ko: '이름 (KO)', en: 'Name (EN)' }, bilingual: true, elType: 'input' },
        { name: 'logoText', labels: { ko: '로고 텍스트', en: 'Logo Text' }, bilingual: false, elType: 'input' },
        { name: 'benefit1_tag', labels: { ko: '혜택 1 태그 (KO)', en: 'Benefit 1 Tag (EN)' }, bilingual: true, elType: 'input' },
        { name: 'benefit1_value', labels: { ko: '혜택 1 값 (KO)', en: 'Benefit 1 Value (EN)' }, bilingual: true, elType: 'input' },
        { name: 'benefit2_tag', labels: { ko: '혜택 2 태그 (KO)', en: 'Benefit 2 Tag (EN)' }, bilingual: true, elType: 'input' },
        { name: 'benefit2_value', labels: { ko: '혜택 2 값 (KO)', en: 'Benefit 2 Value (EN)' }, bilingual: true, elType: 'input' },
        { name: 'link', labels: { ko: '가입 링크', en: 'Signup Link' }, bilingual: false, elType: 'input', inputType: 'url' },
    ]);
}

function renderFaqs() {
    renderList('faq-list', siteData.faqs, 'FAQ', [
        { name: 'question', labels: { ko: '질문 (KO)', en: 'Question (EN)' }, bilingual: true, elType: 'input' },
        { name: 'answer', labels: { ko: '답변 (KO)', en: 'Answer (EN)' }, bilingual: true, elType: 'textarea' },
    ]);
}

function renderGuides() {
    renderList('guides-list', siteData.guides, 'Guide', [
        { name: 'title', labels: { ko: '제목 (KO)', en: 'Title (EN)' }, bilingual: true, elType: 'input' },
        { name: 'content', labels: { ko: '내용 (KO)', en: 'Content (EN)' }, bilingual: true, elType: 'textarea' },
    ]);
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

    const textGroup = document.getElementById('popup-text-group');
    const imageGroup = document.getElementById('popup-image-group');
    if (!textGroup || !imageGroup) return;

    if (popup.type === 'text') {
        textGroup.style.display = 'block';
        imageGroup.style.display = 'none';
    } else {
        textGroup.style.display = 'none';
        imageGroup.style.display = 'block';
    }
}

function renderSupport() {
    const input = document.getElementById('support-telegram-url-input') as HTMLInputElement;
    if (input && siteData.support) {
        input.value = siteData.support.telegramUrl;
    }
}


// Event Listeners
function setupEventListeners() {
    document.getElementById('save-all-button').addEventListener('click', saveData);

    // Data Management
    document.getElementById('export-button').addEventListener('click', exportData);
    document.getElementById('import-file').addEventListener('change', importData);

    // Popup
    document.getElementById('popup-enabled-input').addEventListener('change', e => siteData.popup.enabled = (e.target as HTMLInputElement).checked);
    document.querySelectorAll('input[name="popup-type"]').forEach(radio => {
        radio.addEventListener('change', e => {
            siteData.popup.type = (e.target as HTMLInputElement).value;
            renderPopup();
        });
    });
    document.getElementById('popup-content-ko-input').addEventListener('input', e => siteData.popup.content.ko = (e.target as HTMLTextAreaElement).value);
    document.getElementById('popup-content-en-input').addEventListener('input', e => siteData.popup.content.en = (e.target as HTMLTextAreaElement).value);
    document.getElementById('popup-image-url-input').addEventListener('input', e => siteData.popup.imageUrl = (e.target as HTMLInputElement).value);
    document.getElementById('popup-start-date-input').addEventListener('input', e => siteData.popup.startDate = (e.target as HTMLInputElement).value);
    document.getElementById('popup-end-date-input').addEventListener('input', e => siteData.popup.endDate = (e.target as HTMLInputElement).value);

    // Hero
    document.getElementById('hero-title-ko-input').addEventListener('input', e => siteData.hero.title.ko = (e.target as HTMLTextAreaElement).value);
    document.getElementById('hero-title-en-input').addEventListener('input', e => siteData.hero.title.en = (e.target as HTMLTextAreaElement).value);
    document.getElementById('hero-subtitle-ko-input').addEventListener('input', e => siteData.hero.subtitle.ko = (e.target as HTMLTextAreaElement).value);
    document.getElementById('hero-subtitle-en-input').addEventListener('input', e => siteData.hero.subtitle.en = (e.target as HTMLTextAreaElement).value);

    // About Us
    document.getElementById('about-us-title-ko-input').addEventListener('input', e => siteData.aboutUs.title.ko = (e.target as HTMLInputElement).value);
    document.getElementById('about-us-title-en-input').addEventListener('input', e => siteData.aboutUs.title.en = (e.target as HTMLInputElement).value);
    document.getElementById('about-us-content-ko-input').addEventListener('input', e => siteData.aboutUs.content.ko = (e.target as HTMLTextAreaElement).value);
    document.getElementById('about-us-content-en-input').addEventListener('input', e => siteData.aboutUs.content.en = (e.target as HTMLTextAreaElement).value);

    // Support
    document.getElementById('support-telegram-url-input')?.addEventListener('input', e => {
        if (siteData.support) siteData.support.telegramUrl = (e.target as HTMLInputElement).value;
    });

    // Dynamic items
    setupListListeners('exchanges-list', 'cex', siteData.exchanges, renderExchanges);
    setupListListeners('dex-exchanges-list', 'dex', siteData.dexExchanges, renderDexExchanges);
    setupListListeners('faq-list', 'faq', siteData.faqs, renderFaqs);
    setupListListeners('guides-list', 'guide', siteData.guides, renderGuides);

    // Add buttons
    document.getElementById('add-exchange-button').addEventListener('click', () => {
        siteData.exchanges.push({ name: {ko:'', en:''}, logoText: '', benefit1_tag: {ko:'', en:''}, benefit1_value: {ko:'', en:''}, benefit2_tag: {ko:'', en:''}, benefit2_value: {ko:'', en:''}, link: '' });
        renderExchanges();
    });
    document.getElementById('add-dex-exchange-button').addEventListener('click', () => {
        siteData.dexExchanges.push({ name: {ko:'', en:''}, logoText: '', benefit1_tag: {ko:'', en:''}, benefit1_value: {ko:'', en:''}, benefit2_tag: {ko:'', en:''}, benefit2_value: {ko:'', en:''}, link: '' });
        renderDexExchanges();
    });
    document.getElementById('add-faq-button').addEventListener('click', () => {
        siteData.faqs.push({ question: {ko:'', en:''}, answer: {ko:'', en:''} });
        renderFaqs();
    });
    document.getElementById('add-guide-button').addEventListener('click', () => {
        siteData.guides.push({ title: {ko:'', en:''}, content: {ko:'', en:''} });
        renderGuides();
    });
}

function setupListListeners(containerId, listName, dataArray, renderFunc) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.addEventListener('input', e => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        const key = Array.from(target.classList).find(c => c.startsWith('item-input')) ? target.classList[1] : null;
        if (!key) return;
        
        const index = parseInt(target.dataset.index, 10);
        if (isNaN(index) || !dataArray[index]) return;
        
        const lang = target.dataset.lang;
        if (lang) { // Bilingual field
            if(dataArray[index][key]) dataArray[index][key][lang] = target.value;
        } else { // Single field
            if(key in dataArray[index]) dataArray[index][key] = target.value;
        }
    });

    container.addEventListener('click', e => {
        const target = e.target as HTMLButtonElement;
        if (target.classList.contains(`delete-${listName}`)) {
            if (confirm('정말로 삭제하시겠습니까?')) {
                const index = parseInt(target.dataset.index, 10);
                dataArray.splice(index, 1);
                renderFunc();
            }
        }
    });
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const editorSections = document.querySelectorAll('.editor-section');
    const mainContentTitle = document.getElementById('main-content-title');

    function switchTab(targetId) {
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


// Data export/import functions
function exportData() {
    const dataStr = JSON.stringify(siteData, null, 2);
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `coinpass-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result as string);
            // Basic validation
            if (importedData.hero && importedData.exchanges && importedData.faqs) {
                 siteData = deepMerge(defaultSiteData, importedData);
                 renderAll();
                 alert('데이터를 성공적으로 불러왔습니다! "변경사항 저장" 버튼을 눌러 적용해주세요.');
            } else {
                throw new Error('Invalid file structure');
            }
        } catch (error) {
            console.error('Error parsing JSON file:', error);
            alert('오류: 파일을 읽을 수 없거나 형식이 올바르지 않습니다.');
        } finally {
            (event.target as HTMLInputElement).value = '';
        }
    };
    reader.readAsText(file);
}
export {};