document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupScrollAnimations();
    setupLanguage();
    startTypingAnimation();
});

function setupEventListeners() {
    setupMobileMenu();
}

class TypingAnimator {
    private element: HTMLElement;
    private texts: { ko: string; en: string };
    private currentLang: string = 'ko';
    private typingSpeed: number = 100;
    private erasingSpeed: number = 50;
    private delayBetweenCycles: number = 2000;
    private isTyping: boolean = false;

    constructor(element: HTMLElement, texts: { ko: string; en: string }) {
        this.element = element;
        this.texts = texts;
        this.currentLang = localStorage.getItem('coinpass-lang') || 'ko';
    }

    public updateLanguage(lang: string) {
        this.currentLang = lang;
        if (!this.isTyping) {
            this.startTyping();
        }
    }

    public startTyping() {
        this.isTyping = true;
        this.typeText(this.texts[this.currentLang as keyof typeof this.texts]);
    }

    private async typeText(text: string) {
        this.element.textContent = '';
        
        // Typing effect
        for (let i = 0; i <= text.length; i++) {
            this.element.textContent = text.substring(0, i);
            await this.sleep(this.typingSpeed);
        }
        
        await this.sleep(this.delayBetweenCycles);
        this.isTyping = false;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

let typingAnimator: TypingAnimator | null = null;

function startTypingAnimation() {
    const heroTitle = document.getElementById('hero-title');
    if (!heroTitle) return;

    const texts = {
        ko: '코인패스와 함께하는 스마트한 암호화폐 투자',
        en: 'Smart Cryptocurrency Investment with CoinPass'
    };

    typingAnimator = new TypingAnimator(heroTitle as HTMLElement, texts);
    typingAnimator.startTyping();
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
    
    // Update typing animation language
    if (typingAnimator) {
        typingAnimator.updateLanguage(lang);
    }
    
    // Update content based on language
    if (lang === 'en') {
        updateContentToEnglish();
    } else {
        updateContentToKorean();
    }
}

function updateContentToEnglish() {
    // Update hero section (title is handled by typing animation)
    const heroSubtitle = document.getElementById('hero-subtitle');
    
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
    
}

function updateContentToKorean() {
    // Update hero section (title is handled by typing animation)
    const heroSubtitle = document.getElementById('hero-subtitle');
    
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