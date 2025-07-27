document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupScrollAnimations();
    setupLanguage();
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
    
    // Update content based on language
    if (lang === 'en') {
        updateContentToEnglish();
    } else {
        updateContentToKorean();
    }
}

function updateContentToEnglish() {
    // Update hero section
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    
    if (heroTitle) heroTitle.textContent = 'Smart Cryptocurrency Investment with CoinPass';
    if (heroSubtitle) heroSubtitle.textContent = 'From exchange fee discounts to real-time price analysis, all investment information in one place';
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-title');
    const navTexts = ['Price Comparison', 'On-chain Data', 'Exchange Benefits', 'Research'];
    navItems.forEach((item, index) => {
        if (navTexts[index]) item.textContent = navTexts[index];
    });
    
    // Update main CTA buttons
    const mainCtaButtons = document.querySelectorAll('.main-cta-buttons .cta-button');
    if (mainCtaButtons[0]) mainCtaButtons[0].textContent = 'Get Fee Benefits';
    if (mainCtaButtons[1]) mainCtaButtons[1].textContent = 'Compare Prices';
    
    // Update service introduction
    const introTitle = document.querySelector('.intro-content h2');
    const introDesc = document.querySelector('.intro-desc');
    if (introTitle) introTitle.textContent = 'What is CoinPass?';
    if (introDesc) introDesc.textContent = 'CoinPass is a comprehensive information platform for cryptocurrency investors. We provide everything needed for investment, from exchange fee discounts to real-time price comparison, on-chain data analysis, and expert research.';
    
    // Update features section
    const featuresTitle = document.querySelector('.features-section .section-title');
    if (featuresTitle) featuresTitle.textContent = 'Services Provided by CoinPass';
    
    const featureCards = document.querySelectorAll('.features-section .feature-card');
    const features = [
        {
            title: 'Exchange Fee Discounts',
            desc: 'Get up to 60% fee discounts through partnerships with major exchanges like Binance, Bybit, and OKX. Enjoy lifetime benefits with a single signup.',
            link: 'View Benefits →'
        },
        {
            title: 'Real-time Price Comparison',
            desc: 'Check real-time price differences and kimchi premium across exchanges to find optimal trading opportunities. Don\'t miss arbitrage chances.',
            link: 'Check Prices →'
        },
        {
            title: 'On-chain Data Analysis',
            desc: 'Gain investment insights by tracking on-chain metrics like TVL, trading volume, and active addresses across different blockchains.',
            link: 'View Data →'
        },
        {
            title: 'Expert Research',
            desc: 'Access professional research materials including in-depth crypto project analysis, airdrop information, and market trends to help your investment decisions.',
            link: 'View Research →'
        }
    ];
    
    featureCards.forEach((card, index) => {
        if (features[index]) {
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            const link = card.querySelector('.feature-link');
            
            if (h3) h3.textContent = features[index].title;
            if (p) p.textContent = features[index].desc;
            if (link) link.textContent = features[index].link;
        }
    });
    
    // Update why coinpass section
    const whyTitle = document.querySelector('.why-coinpass .section-title');
    if (whyTitle) whyTitle.textContent = 'Why Choose CoinPass?';
    
    const benefitItems = document.querySelectorAll('.benefit-item');
    const benefits = [
        {
            title: 'One-Stop Service',
            desc: 'No need to visit multiple sites - get all investment information from CoinPass alone.'
        },
        {
            title: 'Verified Partnerships',
            desc: 'Guaranteed safe and reliable benefits through official partnerships with top global exchanges.'
        },
        {
            title: 'Real-time Updates',
            desc: 'Always stay informed with real-time updates of prices, news, and on-chain data.'
        },
        {
            title: 'Secure Service',
            desc: 'Providing a safe investment environment with privacy protection and security as top priorities.'
        }
    ];
    
    benefitItems.forEach((item, index) => {
        if (benefits[index]) {
            const h3 = item.querySelector('h3');
            const p = item.querySelector('p');
            
            if (h3) h3.textContent = benefits[index].title;
            if (p) p.textContent = benefits[index].desc;
        }
    });
    
    // Update how it works section
    const howTitle = document.querySelector('.how-it-works .section-title');
    if (howTitle) howTitle.textContent = 'How to Use CoinPass';
    
    const steps = document.querySelectorAll('.step');
    const stepData = [
        {
            title: 'Sign Up via Affiliate Link',
            desc: 'Register with your desired exchange through CoinPass affiliate links. Fee discounts are automatically applied.'
        },
        {
            title: 'Check Market Information',
            desc: 'Identify market conditions and find optimal investment timing through real-time price comparison and on-chain data.'
        },
        {
            title: 'Utilize Research',
            desc: 'Make better investment decisions by referring to expert project analysis and market research.'
        }
    ];
    
    steps.forEach((step, index) => {
        if (stepData[index]) {
            const h3 = step.querySelector('h3');
            const p = step.querySelector('p');
            
            if (h3) h3.textContent = stepData[index].title;
            if (p) p.textContent = stepData[index].desc;
        }
    });
    
    // Update CTA section
    const ctaTitle = document.querySelector('.cta-content h2');
    const ctaDesc = document.querySelector('.cta-content p');
    if (ctaTitle) ctaTitle.textContent = 'Start Now!';
    if (ctaDesc) ctaDesc.textContent = 'Experience smarter cryptocurrency investment with CoinPass.';
    
    const ctaButtons = document.querySelectorAll('.cta-buttons .cta-button');
    if (ctaButtons[0]) ctaButtons[0].textContent = 'Get Exchange Benefits';
    if (ctaButtons[1]) ctaButtons[1].textContent = 'Compare Prices';
}

function updateContentToKorean() {
    // Update hero section
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    
    if (heroTitle) heroTitle.textContent = '코인패스와 함께하는 스마트한 암호화폐 투자';
    if (heroSubtitle) heroSubtitle.textContent = '거래소 수수료 할인부터 실시간 시세분석까지, 모든 투자 정보를 한 곳에서';
    
    // Update navigation
    const navItems = document.querySelectorAll('.nav-title');
    const navTexts = ['시세비교', '온체인 데이터', '거래소 혜택', '리서치'];
    navItems.forEach((item, index) => {
        if (navTexts[index]) item.textContent = navTexts[index];
    });
    
    // Update main CTA buttons
    const mainCtaButtons = document.querySelectorAll('.main-cta-buttons .cta-button');
    if (mainCtaButtons[0]) mainCtaButtons[0].textContent = '수수료 혜택 받기';
    if (mainCtaButtons[1]) mainCtaButtons[1].textContent = '시세 비교하기';
    
    // Update service introduction
    const introTitle = document.querySelector('.intro-content h2');
    const introDesc = document.querySelector('.intro-desc');
    if (introTitle) introTitle.textContent = '코인패스는 무엇인가요?';
    if (introDesc) introDesc.textContent = '코인패스는 암호화폐 투자자들을 위한 종합 정보 플랫폼입니다. 거래소 수수료 할인 혜택부터 실시간 시세 비교, 온체인 데이터 분석, 전문가 리서치까지 투자에 필요한 모든 정보를 제공합니다.';
    
    // Update features section
    const featuresTitle = document.querySelector('.features-section .section-title');
    if (featuresTitle) featuresTitle.textContent = '코인패스가 제공하는 서비스';
    
    const featureCards = document.querySelectorAll('.features-section .feature-card');
    const features = [
        {
            title: '거래소 수수료 할인',
            desc: '바이낸스, 바이비트, OKX 등 주요 거래소와의 제휴를 통해 최대 60%까지 수수료 할인 혜택을 제공합니다. 한 번의 가입으로 평생 혜택을 누리세요.',
            link: '혜택 보기 →'
        },
        {
            title: '실시간 시세 비교',
            desc: '거래소별 가격 차이와 김치 프리미엄을 실시간으로 확인하여 최적의 매매 타이밍을 찾아보세요. 아비트라지 기회를 놓치지 마세요.',
            link: '시세 확인 →'
        },
        {
            title: '온체인 데이터 분석',
            desc: '블록체인별 TVL, 거래량, 활성 주소 수 등 온체인 지표를 통해 시장 트렌드를 파악하고 투자 인사이트를 얻으세요.',
            link: '데이터 보기 →'
        },
        {
            title: '전문가 리서치',
            desc: '암호화폐 프로젝트 심층 분석, 에어드랍 정보, 시장 동향 등 투자 결정에 도움이 되는 전문 리서치 자료를 제공합니다.',
            link: '리서치 보기 →'
        }
    ];
    
    featureCards.forEach((card, index) => {
        if (features[index]) {
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            const link = card.querySelector('.feature-link');
            
            if (h3) h3.textContent = features[index].title;
            if (p) p.textContent = features[index].desc;
            if (link) link.textContent = features[index].link;
        }
    });
    
    // Update why coinpass section
    const whyTitle = document.querySelector('.why-coinpass .section-title');
    if (whyTitle) whyTitle.textContent = '왜 코인패스를 선택해야 할까요?';
    
    const benefitItems = document.querySelectorAll('.benefit-item');
    const benefits = [
        {
            title: '원스톱 서비스',
            desc: '여러 사이트를 돌아다닐 필요 없이 코인패스 하나로 모든 투자 정보를 확인할 수 있습니다.'
        },
        {
            title: '검증된 파트너십',
            desc: '글로벌 1위 거래소들과의 공식 제휴를 통해 안전하고 확실한 혜택을 보장합니다.'
        },
        {
            title: '실시간 업데이트',
            desc: '시세, 뉴스, 온체인 데이터가 실시간으로 업데이트되어 항상 최신 정보를 제공합니다.'
        },
        {
            title: '안전한 서비스',
            desc: '개인정보 보호와 보안을 최우선으로 하여 안전한 투자 환경을 제공합니다.'
        }
    ];
    
    benefitItems.forEach((item, index) => {
        if (benefits[index]) {
            const h3 = item.querySelector('h3');
            const p = item.querySelector('p');
            
            if (h3) h3.textContent = benefits[index].title;
            if (p) p.textContent = benefits[index].desc;
        }
    });
    
    // Update how it works section
    const howTitle = document.querySelector('.how-it-works .section-title');
    if (howTitle) howTitle.textContent = '코인패스 이용 방법';
    
    const steps = document.querySelectorAll('.step');
    const stepData = [
        {
            title: '제휴 링크로 가입',
            desc: '코인패스에서 제공하는 제휴 링크를 통해 원하는 거래소에 가입하세요. 자동으로 수수료 할인이 적용됩니다.'
        },
        {
            title: '시세 정보 확인',
            desc: '실시간 시세 비교와 온체인 데이터를 통해 시장 상황을 파악하고 최적의 투자 타이밍을 찾으세요.'
        },
        {
            title: '리서치 활용',
            desc: '전문가가 제공하는 프로젝트 분석과 시장 리서치를 참고하여 더 나은 투자 결정을 내리세요.'
        }
    ];
    
    steps.forEach((step, index) => {
        if (stepData[index]) {
            const h3 = step.querySelector('h3');
            const p = step.querySelector('p');
            
            if (h3) h3.textContent = stepData[index].title;
            if (p) p.textContent = stepData[index].desc;
        }
    });
    
    // Update CTA section
    const ctaTitle = document.querySelector('.cta-content h2');
    const ctaDesc = document.querySelector('.cta-content p');
    if (ctaTitle) ctaTitle.textContent = '지금 시작하세요!';
    if (ctaDesc) ctaDesc.textContent = '코인패스와 함께 더 스마트한 암호화폐 투자를 경험해보세요.';
    
    const ctaButtons = document.querySelectorAll('.cta-buttons .cta-button');
    if (ctaButtons[0]) ctaButtons[0].textContent = '거래소 혜택 받기';
    if (ctaButtons[1]) ctaButtons[1].textContent = '시세 비교하기';
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.anim-fade-in').forEach(el => observer.observe(el));
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
    
    // Close menu when clicking nav links
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('is-active');
            nav.classList.remove('is-active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        });
    });
}