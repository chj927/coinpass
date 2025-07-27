document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupLanguage();
    initializeOnchainData();
});

function setupEventListeners() {
    setupMobileMenu();
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
            pageTitle: '온체인 데이터',
            pageDesc: '블록체인별 TVL, 거래량 등 온체인 데이터를 분석하여 투자 인사이트를 제공합니다',
            comingSoon: {
                title: '⛓️ 온체인 데이터 분석 서비스 준비중',
                desc1: '다양한 블록체인 네트워크의 온체인 데이터를 수집하고 분석하는 서비스를 준비하고 있습니다.',
                desc2: '곧 다음과 같은 데이터를 제공할 예정입니다:'
            },
            features: [
                {
                    title: 'TVL (Total Value Locked)',
                    content: '각 블록체인별 락업된 총 가치를 추적하여 네트워크의 성장성을 분석합니다.'
                },
                {
                    title: '거래량 분석',
                    content: '블록체인별 일일 거래량과 활성 주소 수를 모니터링합니다.'
                },
                {
                    title: '크로스체인 데이터',
                    content: '다양한 체인 간의 자금 이동과 브릿지 활동을 분석합니다.'
                },
                {
                    title: 'DeFi 지표',
                    content: '디파이 프로토콜별 수익률, 유동성, 사용자 수 등을 추적합니다.'
                },
                {
                    title: '스마트 머니 추적',
                    content: '대형 투자자들의 온체인 활동을 분석하여 시장 트렌드를 파악합니다.'
                },
                {
                    title: '네트워크 성능',
                    content: '각 블록체인의 TPS, 가스비, 네트워크 사용률 등을 모니터링합니다.'
                }
            ],
            supportedChains: '지원 예정 블록체인'
        },
        en: {
            pageTitle: 'On-chain Data',
            pageDesc: 'Analyze on-chain data such as TVL and trading volume across blockchains to provide investment insights',
            comingSoon: {
                title: '⛓️ On-chain Data Analysis Service Coming Soon',
                desc1: 'We are preparing a service to collect and analyze on-chain data from various blockchain networks.',
                desc2: 'We will soon provide the following data:'
            },
            features: [
                {
                    title: 'TVL (Total Value Locked)',
                    content: 'Track the total value locked in each blockchain to analyze network growth potential.'
                },
                {
                    title: 'Trading Volume Analysis',
                    content: 'Monitor daily trading volume and active addresses for each blockchain.'
                },
                {
                    title: 'Cross-chain Data',
                    content: 'Analyze fund movements and bridge activities between different chains.'
                },
                {
                    title: 'DeFi Metrics',
                    content: 'Track yields, liquidity, user count, and other metrics for DeFi protocols.'
                },
                {
                    title: 'Smart Money Tracking',
                    content: 'Analyze on-chain activities of large investors to identify market trends.'
                },
                {
                    title: 'Network Performance',
                    content: 'Monitor TPS, gas fees, network utilization, and other performance metrics for each blockchain.'
                }
            ],
            supportedChains: 'Supported Blockchains'
        }
    };

    const t = translations[lang] || translations.ko;
    
    // Update page title and description
    const pageTitle = document.querySelector('.page-header h1');
    const pageDesc = document.querySelector('.page-header p');
    if (pageTitle) pageTitle.textContent = t.pageTitle;
    if (pageDesc) pageDesc.textContent = t.pageDesc;
    
    // Update coming soon content
    const comingSoonTitle = document.querySelector('.coming-soon-content h2');
    const comingSoonDescs = document.querySelectorAll('.coming-soon-content > p');
    
    if (comingSoonTitle) comingSoonTitle.textContent = t.comingSoon.title;
    if (comingSoonDescs[0]) comingSoonDescs[0].textContent = t.comingSoon.desc1;
    if (comingSoonDescs[1]) comingSoonDescs[1].textContent = t.comingSoon.desc2;
    
    // Update feature items
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach((item, index) => {
        if (t.features[index]) {
            const title = item.querySelector('h3');
            const content = item.querySelector('p');
            if (title) title.textContent = t.features[index].title;
            if (content) content.textContent = t.features[index].content;
        }
    });
    
    // Update supported chains title
    const supportedChainsTitle = document.querySelector('.supported-chains h3');
    if (supportedChainsTitle) supportedChainsTitle.textContent = t.supportedChains;
}

function initializeOnchainData() {
    // TODO: This will be implemented when blockchain data APIs are integrated
    // For now, we show the coming soon message
    
    // Placeholder data structure for future implementation
    const mockChainData = [
        {
            name: 'Ethereum',
            symbol: 'ETH',
            tvl: 0,
            volume24h: 0,
            activeAddresses: 0,
            gasPrice: 0
        },
        {
            name: 'BNB Chain',
            symbol: 'BNB',
            tvl: 0,
            volume24h: 0,
            activeAddresses: 0,
            gasPrice: 0
        }
        // Add more chains as needed
    ];
    
    console.log('Onchain data initialized with placeholder data');
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