
// Default data structure
const defaultSiteData = {
    hero: {
        title: `최대 50%까지 거래수수료 할인!
최고의 혜택을 누구나 무료로!
한번 등록하고 평생 혜택받기!`,
        subtitle: '최고의 혜택을 제공하는 암호화폐 거래소를 한눈에 비교하고 가입하세요.'
    },
    aboutUs: {
        title: '코인패스 이야기: 투자의 지름길을 열다',
        content: `복잡하고 빠르게 변화하는 암호화폐 시장. 정보의 홍수 속에서 어떤 거래소를 선택해야 할지, 내가 받는 혜택이 정말 최선인지 확신하기 어려웠던 경험, 모두 있으실 겁니다. 코인패스는 바로 그 고민에서 시작되었습니다.

저희의 미션은 명확합니다. 모든 투자자가 투명하고 검증된 정보에 접근하여, 거래 수수료와 같은 부가 비용을 최소화하고 수익을 극대화할 수 있도록 돕는 것입니다. 코인패스는 공식 파트너십을 통해 최고의 수수료 혜택을 제공하고, 실시간 김치 프리미엄 정보를 통해 현명한 투자 결정을 지원하는 믿음직한 나침반이 되고자 합니다.

신뢰, 투명성, 사용자 중심. 코인패스가 가장 중요하게 생각하는 가치입니다. 저희는 단순한 정보 제공을 넘어, 여러분의 자산이 씨앗처럼 무럭무럭 성장할 수 있도록 돕는 든든한 파트너가 되겠습니다. 코인패스와 함께 건강한 투자의 첫걸음을 내딛어 보세요.`
    },
    exchanges: [
        { name: '바이낸스', logoText: 'Binance', benefit1_tag: '거래수수료', benefit1_value: '20%', benefit2_tag: '수수료 할인', benefit2_value: '최대 40%', link: '#' },
        { name: '바이비트', logoText: 'Bybit', benefit1_tag: '거래수수료', benefit1_value: '20%', benefit2_tag: '수수료 할인', benefit2_value: '최대 $30,000', link: '#' },
        { name: 'OKX', logoText: 'OKX', benefit1_tag: '거래수수료', benefit1_value: '20%', benefit2_tag: '수수료 할인', benefit2_value: '최대 $10,000', link: '#' },
        { name: '비트겟', logoText: 'Bitget', benefit1_tag: '거래수수료', benefit1_value: '50%', benefit2_tag: '수수료 할인', benefit2_value: '최대 $5,005', link: '#' },
        { name: 'MEXC', logoText: 'MEXC', benefit1_tag: '거래수수료', benefit1_value: '20%', benefit2_tag: '수수료 할인', benefit2_value: '$100 상당 리워드', link: '#' },
        { name: '플립스터', logoText: 'Flipster', benefit1_tag: '거래수수료', benefit1_value: '최대 $9,999', benefit2_tag: '수수료 할인', benefit2_value: '20%', link: '#' },
    ],
    dexExchanges: [
        { name: 'Avantis', logoText: 'AVA', benefit1_tag: '거래수수료', benefit1_value: '포인트 부스트', benefit2_tag: '수수료 할인', benefit2_value: '최대 20%', link: '#' },
        { name: 'GRVT', logoText: 'GRVT', benefit1_tag: '거래수수료', benefit1_value: '미스터리 박스', benefit2_tag: '수수료 할인', benefit2_value: '시즌별 혜택', link: '#' },
        { name: '하이퍼리퀴드', logoText: 'HYP', benefit1_tag: '거래수수료', benefit1_value: '포인트 적립', benefit2_tag: '수수료 할인', benefit2_value: '10% 리베이트', link: '#' },
    ],
    faqs: [
        { question: '기존에 계정이 있어도 혜택을 받을 수 있나요?', answer: '아니요, 대부분의 거래소는 신규 가입자에 한해 레퍼럴 혜택을 제공합니다. 최대 혜택을 받으시려면 기존에 해당 거래소를 이용한 적 없는 새로운 이메일과 신분증으로 가입하시는 것을 권장합니다.' },
        { question: '페이백은 어떻게 지급되나요?', answer: '페이백은 거래소마다 정책이 다릅니다. 보통 거래 발생 후 일정 시간이 지나면(실시간, 매일, 매주 등) 현물 지갑으로 자동 입금됩니다. 자세한 내용은 각 거래소의 이용 약관을 참고해주세요.' },
        { question: '이 사이트를 이용하는 것이 안전한가요?', answer: '네, 안전합니다. 저희는 거래소의 공식 파트너 프로그램에 참여하여 합법적인 레퍼럴 링크를 제공합니다. 회원가입 및 거래는 모두 해당 거래소의 공식 사이트에서 직접 이루어지므로 개인정보 유출이나 보안 위험이 없습니다.' }
    ],
    guides: [
        { 
            title: '바이낸스 가입 및 KYC 인증 완벽 가이드', 
            content: '안녕하세요! 코인패스입니다.\n\n이번 가이드에서는 세계 최대 암호화폐 거래소인 바이낸스(Binance)의 가입 방법부터 신원 인증(KYC), 그리고 보안 설정까지 모든 과정을 상세하게 알려드립니다. 코인패스 전용 링크를 통해 가입하시면 거래 수수료 최대 할인 혜택을 받으실 수 있으니 놓치지 마세요!\n\n**1단계: 바이낸스 계정 생성**\n\n코인패스의 바이낸스 제휴 링크를 클릭하여 가입 페이지로 이동합니다. 이메일 또는 휴대폰 번호로 가입을 진행할 수 있습니다. 비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함하여 안전하게 설정해주세요.'
        }
    ]
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
    const loginContainer = document.getElementById('login-container');
    const adminPanel = document.getElementById('admin-panel');
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('password-input') as HTMLInputElement;
    const loginError = document.getElementById('login-error');
    
    // Stored hash for "660607"
    const PWD_HASH = '1f32a048a86266597c453531b402830e20e835467385848137358200676451e9';

    loginButton.addEventListener('click', async () => {
        const enteredPassword = passwordInput.value;
        const enteredHash = await sha256(enteredPassword);

        if (enteredHash === PWD_HASH) {
            loginContainer.style.display = 'none';
            adminPanel.style.display = 'block';
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
}

function loadData() {
    const savedData = localStorage.getItem(DATA_KEY);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            // Deep merge to keep default structure for new sections
            siteData = {
                hero: { ...defaultSiteData.hero, ...(parsed.hero || {}) },
                aboutUs: { ...defaultSiteData.aboutUs, ...(parsed.aboutUs || {}) },
                exchanges: parsed.exchanges || defaultSiteData.exchanges,
                dexExchanges: parsed.dexExchanges || defaultSiteData.dexExchanges,
                faqs: parsed.faqs || defaultSiteData.faqs,
                guides: parsed.guides || defaultSiteData.guides
            };
        } catch (e) {
            console.error('Failed to parse data from localStorage, using default.', e);
            siteData = { ...defaultSiteData };
        }
    }
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
}

// Render functions
function renderHero() {
    (document.getElementById('hero-title-input') as HTMLTextAreaElement).value = siteData.hero.title;
    (document.getElementById('hero-subtitle-input') as HTMLTextAreaElement).value = siteData.hero.subtitle;
}

function renderAboutUs() {
    (document.getElementById('about-us-title-input') as HTMLInputElement).value = siteData.aboutUs.title;
    (document.getElementById('about-us-content-input') as HTMLTextAreaElement).value = siteData.aboutUs.content;
}

function createFormGroup(labelText, inputType, inputClass, value, index, elType = 'input') {
    const group = document.createElement('div');
    group.className = 'form-group';

    const label = document.createElement('label');
    label.textContent = labelText;
    group.appendChild(label);

    const input = document.createElement(elType);
    input.className = inputClass;
    if (elType === 'input') {
        (input as HTMLInputElement).type = inputType;
        (input as HTMLInputElement).value = value;
    } else {
        (input as HTMLTextAreaElement).value = value;
        if(inputType === 'textarea') (input as HTMLTextAreaElement).rows = 10;
    }
    input.dataset.index = index.toString();
    group.appendChild(input);

    return group;
}

function renderExchanges() {
    const container = document.getElementById('exchanges-list');
    const fragment = document.createDocumentFragment();

    siteData.exchanges.forEach((exchange, index) => {
        const item = document.createElement('div');
        item.className = 'item-card';

        const h4 = document.createElement('h4');
        h4.textContent = `CEX #${index + 1}`;
        item.appendChild(h4);

        const grid1 = document.createElement('div');
        grid1.className = 'grid-2';
        grid1.appendChild(createFormGroup('이름', 'text', 'exchange-name', exchange.name, index));
        grid1.appendChild(createFormGroup('로고 텍스트', 'text', 'exchange-logoText', exchange.logoText, index));
        item.appendChild(grid1);

        const grid2 = document.createElement('div');
        grid2.className = 'grid-2';
        grid2.appendChild(createFormGroup('혜택 1 태그', 'text', 'exchange-benefit1_tag', exchange.benefit1_tag, index));
        grid2.appendChild(createFormGroup('혜택 1 값', 'text', 'exchange-benefit1_value', exchange.benefit1_value, index));
        item.appendChild(grid2);
        
        const grid3 = document.createElement('div');
        grid3.className = 'grid-2';
        grid3.appendChild(createFormGroup('혜택 2 태그', 'text', 'exchange-benefit2_tag', exchange.benefit2_tag, index));
        grid3.appendChild(createFormGroup('혜택 2 값', 'text', 'exchange-benefit2_value', exchange.benefit2_value, index));
        item.appendChild(grid3);

        item.appendChild(createFormGroup('가입 링크', 'url', 'exchange-link', exchange.link, index));

        const controls = document.createElement('div');
        controls.className = 'item-controls';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button delete-exchange';
        deleteBtn.textContent = '삭제';
        deleteBtn.dataset.index = index.toString();
        controls.appendChild(deleteBtn);
        item.appendChild(controls);

        fragment.appendChild(item);
    });
    container.innerHTML = '';
    container.appendChild(fragment);
}

function renderDexExchanges() {
    const container = document.getElementById('dex-exchanges-list');
    const fragment = document.createDocumentFragment();

    siteData.dexExchanges.forEach((exchange, index) => {
        const item = document.createElement('div');
        item.className = 'item-card';

        const h4 = document.createElement('h4');
        h4.textContent = `DEX #${index + 1}`;
        item.appendChild(h4);

        const grid1 = document.createElement('div');
        grid1.className = 'grid-2';
        grid1.appendChild(createFormGroup('이름', 'text', 'dex-exchange-name', exchange.name, index));
        grid1.appendChild(createFormGroup('로고 텍스트', 'text', 'dex-exchange-logoText', exchange.logoText, index));
        item.appendChild(grid1);

        const grid2 = document.createElement('div');
        grid2.className = 'grid-2';
        grid2.appendChild(createFormGroup('혜택 1 태그', 'text', 'dex-exchange-benefit1_tag', exchange.benefit1_tag, index));
        grid2.appendChild(createFormGroup('혜택 1 값', 'text', 'dex-exchange-benefit1_value', exchange.benefit1_value, index));
        item.appendChild(grid2);
        
        const grid3 = document.createElement('div');
        grid3.className = 'grid-2';
        grid3.appendChild(createFormGroup('혜택 2 태그', 'text', 'dex-exchange-benefit2_tag', exchange.benefit2_tag, index));
        grid3.appendChild(createFormGroup('혜택 2 값', 'text', 'dex-exchange-benefit2_value', exchange.benefit2_value, index));
        item.appendChild(grid3);

        item.appendChild(createFormGroup('가입 링크', 'url', 'dex-exchange-link', exchange.link, index));

        const controls = document.createElement('div');
        controls.className = 'item-controls';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button delete-dex-exchange';
        deleteBtn.textContent = '삭제';
        deleteBtn.dataset.index = index.toString();
        controls.appendChild(deleteBtn);
        item.appendChild(controls);

        fragment.appendChild(item);
    });
    container.innerHTML = '';
    container.appendChild(fragment);
}

function renderFaqs() {
    const container = document.getElementById('faq-list');
    const fragment = document.createDocumentFragment();

    siteData.faqs.forEach((faq, index) => {
        const item = document.createElement('div');
        item.className = 'item-card';

        const h4 = document.createElement('h4');
        h4.textContent = `FAQ #${index + 1}`;
        item.appendChild(h4);

        item.appendChild(createFormGroup('질문', 'text', 'faq-question', faq.question, index));
        item.appendChild(createFormGroup('답변', 'textarea', 'faq-answer', faq.answer, index, 'textarea'));
        
        const controls = document.createElement('div');
        controls.className = 'item-controls';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button delete-faq';
        deleteBtn.textContent = '삭제';
        deleteBtn.dataset.index = index.toString();
        controls.appendChild(deleteBtn);
        item.appendChild(controls);

        fragment.appendChild(item);
    });
    container.innerHTML = '';
    container.appendChild(fragment);
}

function renderGuides() {
    const container = document.getElementById('guides-list');
    if (!container) return;
    const fragment = document.createDocumentFragment();

    siteData.guides.forEach((guide, index) => {
        const item = document.createElement('div');
        item.className = 'item-card';

        const h4 = document.createElement('h4');
        h4.textContent = `가이드 #${index + 1}`;
        item.appendChild(h4);

        item.appendChild(createFormGroup('제목', 'text', 'guide-title', guide.title, index));
        item.appendChild(createFormGroup('내용 (문단은 빈 줄로 구분)', 'textarea', 'guide-content', guide.content, index, 'textarea'));
        
        const controls = document.createElement('div');
        controls.className = 'item-controls';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button delete-guide';
        deleteBtn.textContent = '삭제';
        deleteBtn.dataset.index = index.toString();
        controls.appendChild(deleteBtn);
        item.appendChild(controls);

        fragment.appendChild(item);
    });
    container.innerHTML = '';
    container.appendChild(fragment);
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('save-all-button').addEventListener('click', saveData);

    // Data Management
    document.getElementById('export-button').addEventListener('click', exportData);
    document.getElementById('import-file').addEventListener('change', importData);

    // Hero
    document.getElementById('hero-title-input').addEventListener('input', e => siteData.hero.title = (e.target as HTMLTextAreaElement).value);
    document.getElementById('hero-subtitle-input').addEventListener('input', e => siteData.hero.subtitle = (e.target as HTMLTextAreaElement).value);

    // About Us
    document.getElementById('about-us-title-input').addEventListener('input', e => siteData.aboutUs.title = (e.target as HTMLInputElement).value);
    document.getElementById('about-us-content-input').addEventListener('input', e => {
        siteData.aboutUs.content = (e.target as HTMLTextAreaElement).value;
    });

    // Dynamic items
    setupItemListeners('exchanges-list', 'exchange', siteData.exchanges, renderExchanges);
    setupItemListeners('dex-exchanges-list', 'dex-exchange', siteData.dexExchanges, renderDexExchanges);
    setupItemListeners('faq-list', 'faq', siteData.faqs, renderFaqs);
    setupItemListeners('guides-list', 'guide', siteData.guides, renderGuides);

    // Add buttons
    document.getElementById('add-exchange-button').addEventListener('click', () => {
        siteData.exchanges.push({ name: '', logoText: '', benefit1_tag: '', benefit1_value: '', benefit2_tag: '', benefit2_value: '', link: '' });
        renderExchanges();
    });
    document.getElementById('add-dex-exchange-button').addEventListener('click', () => {
        siteData.dexExchanges.push({ name: '', logoText: '', benefit1_tag: '', benefit1_value: '', benefit2_tag: '', benefit2_value: '', link: '' });
        renderDexExchanges();
    });
    document.getElementById('add-faq-button').addEventListener('click', () => {
        siteData.faqs.push({ question: '', answer: '' });
        renderFaqs();
    });
    document.getElementById('add-guide-button').addEventListener('click', () => {
        siteData.guides.push({ title: '', content: '' });
        renderGuides();
    });
}

function setupItemListeners(containerId, itemClass, dataArray, renderFunc) {
    document.getElementById(containerId).addEventListener('input', e => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        const key = Array.from(target.classList).find(c => c.startsWith(`${itemClass}-`))?.replace(`${itemClass}-`, '');
        if (!key) return;

        const index = parseInt(target.dataset.index, 10);
        if (!isNaN(index) && dataArray[index] && key in dataArray[index]) {
            dataArray[index][key] = target.value;
        }
    });

    document.getElementById(containerId).addEventListener('click', e => {
        const target = e.target as HTMLButtonElement;
        if (target.classList.contains(`delete-${itemClass}`)) {
            if (confirm('정말로 삭제하시겠습니까?')) {
                const index = parseInt(target.dataset.index, 10);
                dataArray.splice(index, 1);
                renderFunc(); // Re-render the specific section
            }
        }
    });
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
    const file = (event.target as HTMLInputElement).files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result as string);
            // Basic validation
            if (importedData.hero && importedData.exchanges && importedData.faqs) {
                 siteData = {
                    ...defaultSiteData,
                    ...importedData
                 };
                 renderAll();
                 alert('데이터를 성공적으로 불러왔습니다! "전체 저장" 버튼을 눌러 적용해주세요.');
            } else {
                throw new Error('Invalid file structure');
            }
        } catch (error) {
            console.error('Error parsing JSON file:', error);
            alert('오류: 파일을 읽을 수 없거나 형식이 올바르지 않습니다.');
        } finally {
            // Reset file input
            (event.target as HTMLInputElement).value = '';
        }
    };
    reader.readAsText(file);
}
export {};