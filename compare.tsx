import { supabase } from './supabaseClient';

document.addEventListener('DOMContentLoaded', async () => {
    await loadBannerContent();
    setupEventListeners();
    setupLanguage();
    // Placeholder for future price comparison functionality
    initializePriceComparison();
});

async function loadBannerContent() {
    try {
        const { data: bannerData, error } = await supabase
            .from('banners')
            .select('*')
            .eq('page', 'compare')
            .eq('enabled', true)
            .single();

        const bannerContainer = document.getElementById('banner-content');
        if (!bannerContainer) return;

        if (error || !bannerData) {
            bannerContainer.style.display = 'none';
            return;
        }

        if (bannerData.image_url) {
            bannerContainer.innerHTML = `<img src="${bannerData.image_url}" alt="시세비교 배너" loading="lazy">`;
        } else if (bannerData.content) {
            bannerContainer.innerHTML = `<div class="banner-text">${bannerData.content}</div>`;
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

function setupEventListeners() {
    setupMobileMenu();
    setupSearchAndFilters();
}

function setupLanguage() {
    const savedLang = localStorage.getItem('coinpass-lang');
    const browserLang = navigator.language.startsWith('en') ? 'en' : 'ko';
    const currentLang = savedLang || browserLang;
    
    document.getElementById('lang-ko')?.addEventListener('click', () => setLanguage('ko'));
    document.getElementById('lang-en')?.addEventListener('click', () => setLanguage('en'));
    setLanguage(currentLang);
}

function setLanguage(lang: string) {
    localStorage.setItem('coinpass-lang', lang);
    document.documentElement.lang = lang;
    document.getElementById('lang-ko')?.classList.toggle('active', lang === 'ko');
    document.getElementById('lang-en')?.classList.toggle('active', lang === 'en');
    
    updateUILanguage(lang);
}

function updateUILanguage(lang: string) {
    const translations = {
        ko: {
            pageTitle: '시세비교',
            pageDesc: '주요 거래소별 암호화폐 시세차이와 김치 프리미엄을 실시간으로 확인하세요',
            searchPlaceholder: '코인 검색 (예: BTC, ETH)',
            sortOptions: {
                'premium-desc': '프리미엄 높은순',
                'premium-asc': '프리미엄 낮은순',
                'volume-desc': '거래량 높은순',
                'name-asc': '이름순'
            },
            tableHeaders: {
                coin: '코인',
                premium: '김치 프리미엄'
            },
            comingSoon: {
                title: '🔄 실시간 시세 데이터 준비중',
                desc1: '거래소 API 연동을 통한 실시간 시세비교 서비스를 준비하고 있습니다.',
                desc2: '곧 다음 기능들을 제공할 예정입니다:',
                features: [
                    '실시간 가격 업데이트',
                    '김치 프리미엄 계산',
                    '거래량 비교',
                    '가격 알림 설정',
                    '과거 데이터 차트'
                ]
            },
            infoCards: [
                {
                    title: '김치 프리미엄이란?',
                    content: '국내 거래소와 해외 거래소 간의 가격 차이를 의미합니다. 일반적으로 국내 거래소 가격이 높을 때 양의 프리미엄을 보입니다.'
                },
                {
                    title: '거래소별 특징',
                    content: '각 거래소마다 유동성, 거래량, 수수료 구조가 다르므로 투자 전략에 맞는 거래소 선택이 중요합니다.'
                },
                {
                    title: '주의사항',
                    content: '실시간 가격 정보는 참고용이며, 실제 거래 시 각 거래소의 호가창을 확인하시기 바랍니다.'
                }
            ]
        },
        en: {
            pageTitle: 'Price Comparison',
            pageDesc: 'Compare real-time cryptocurrency prices and kimchi premium across major exchanges',
            searchPlaceholder: 'Search coins (e.g., BTC, ETH)',
            sortOptions: {
                'premium-desc': 'Highest Premium',
                'premium-asc': 'Lowest Premium',
                'volume-desc': 'Highest Volume',
                'name-asc': 'Name'
            },
            tableHeaders: {
                coin: 'Coin',
                premium: 'Kimchi Premium'
            },
            comingSoon: {
                title: '🔄 Real-time Price Data Coming Soon',
                desc1: 'We are preparing a real-time price comparison service through exchange API integration.',
                desc2: 'Coming features:',
                features: [
                    'Real-time price updates',
                    'Kimchi premium calculation',
                    'Trading volume comparison',
                    'Price alert settings',
                    'Historical data charts'
                ]
            },
            infoCards: [
                {
                    title: 'What is Kimchi Premium?',
                    content: 'It refers to the price difference between domestic and overseas exchanges. Generally shows positive premium when domestic exchange prices are higher.'
                },
                {
                    title: 'Exchange Characteristics',
                    content: 'Each exchange has different liquidity, trading volume, and fee structures, so choosing the right exchange for your investment strategy is important.'
                },
                {
                    title: 'Notice',
                    content: 'Real-time price information is for reference only. Please check the order book of each exchange when trading.'
                }
            ]
        }
    };

    const t = translations[lang] || translations.ko;
    
    // Update page title and description
    const pageTitle = document.querySelector('.page-header h1');
    const pageDesc = document.querySelector('.page-header p');
    if (pageTitle) pageTitle.textContent = t.pageTitle;
    if (pageDesc) pageDesc.textContent = t.pageDesc;
    
    // Update search placeholder
    const searchInput = document.getElementById('coin-search') as HTMLInputElement;
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
    
    // Update sort options
    const sortSelect = document.getElementById('sort-by') as HTMLSelectElement;
    if (sortSelect) {
        Array.from(sortSelect.options).forEach(option => {
            const key = option.value as keyof typeof t.sortOptions;
            if (t.sortOptions[key]) {
                option.textContent = t.sortOptions[key];
            }
        });
    }
    
    // Update table headers
    const coinHeader = document.querySelector('.comparison-header .coin-info');
    const premiumHeader = document.querySelector('.comparison-header .premium');
    if (coinHeader) coinHeader.textContent = t.tableHeaders.coin;
    if (premiumHeader) premiumHeader.textContent = t.tableHeaders.premium;
    
    // Update coming soon content
    const comingSoonTitle = document.querySelector('.coming-soon-content h3');
    const comingSoonDescs = document.querySelectorAll('.coming-soon-content p');
    const comingSoonList = document.querySelector('.coming-soon-content ul');
    
    if (comingSoonTitle) comingSoonTitle.textContent = t.comingSoon.title;
    if (comingSoonDescs[0]) comingSoonDescs[0].textContent = t.comingSoon.desc1;
    if (comingSoonDescs[1]) comingSoonDescs[1].textContent = t.comingSoon.desc2;
    
    if (comingSoonList) {
        comingSoonList.innerHTML = t.comingSoon.features
            .map(feature => `<li>${feature}</li>`)
            .join('');
    }
    
    // Update info cards
    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach((card, index) => {
        if (t.infoCards[index]) {
            const title = card.querySelector('h3');
            const content = card.querySelector('p');
            if (title) title.textContent = t.infoCards[index].title;
            if (content) content.textContent = t.infoCards[index].content;
        }
    });
}

function setupSearchAndFilters() {
    const searchInput = document.getElementById('coin-search') as HTMLInputElement;
    const sortSelect = document.getElementById('sort-by') as HTMLSelectElement;
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
}

function handleSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    // TODO: Implement search functionality when real data is available
    console.log('Searching for:', searchTerm);
}

function handleSort(event: Event) {
    const sortBy = (event.target as HTMLSelectElement).value;
    // TODO: Implement sort functionality when real data is available
    console.log('Sorting by:', sortBy);
}

function initializePriceComparison() {
    // TODO: This will be implemented when exchange APIs are integrated
    // For now, we show the coming soon message
    
    // Placeholder data structure for future implementation
    const mockData = [
        {
            symbol: 'BTC',
            name: 'Bitcoin',
            prices: {
                binance: 0,
                bybit: 0,
                okx: 0,
                upbit: 0,
                bithumb: 0
            },
            premium: 0,
            volume: 0
        }
    ];
    
    console.log('Price comparison initialized with placeholder data');
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