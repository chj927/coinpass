

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
    exchanges: [
        { name: { ko: '바이낸스', en: 'Binance' }, logoText: 'Binance', benefit1_tag: { ko: '거래수수료', en: 'Fee Payback' }, benefit1_value: { ko: '20%', en: '20%' }, benefit2_tag: { ko: '수수료 할인', en: 'Fee Discount' }, benefit2_value: { ko: '최대 40%', en: 'Up to 40%' }, link: '#' },
        { name: { ko: '바이비트', en: 'Bybit' }, logoText: 'Bybit', benefit1_tag: { ko: '거래수수료', en: 'Fee Payback' }, benefit1_value: { ko: '20%', en: '20%' }, benefit2_tag: { ko: '수수료 할인', en: 'Fee Discount' }, benefit2_value: { ko: '최대 $30,000', en: 'Up to $30,000' }, link: '#' },
        { name: { ko: 'OKX', en: 'OKX' }, logoText: 'OKX', benefit1_tag: { ko: '거래수수료', en: 'Fee Payback' }, benefit1_value: { ko: '20%', en: '20%' }, benefit2_tag: { ko: '수수료 할인', en: 'Fee Discount' }, benefit2_value: { ko: '최대 $10,000', en: 'Up to $10,000' }, link: '#' },
        { name: { ko: '비트겟', en: 'Bitget' }, logoText: 'Bitget', benefit1_tag: { ko: '거래수수료', en: 'Fee Payback' }, benefit1_value: { ko: '50%', en: '50%' }, benefit2_tag: { ko: '수수료 할인', en: 'Fee Discount' }, benefit2_value: { ko: '최대 $5,005', en: 'Up to $5,005' }, link: '#' },
        { name: { ko: 'MEXC', en: 'MEXC' }, logoText: 'MEXC', benefit1_tag: { ko: '거래수수료', en: 'Fee Payback' }, benefit1_value: { ko: '20%', en: '20%' }, benefit2_tag: { ko: '수수료 할인', en: 'Fee Discount' }, benefit2_value: { ko: '$100 상당 리워드', en: '$100 Reward' }, link: '#' },
        { name: { ko: '플립스터', en: 'Flipster' }, logoText: 'Flipster', benefit1_tag: { ko: '거래수수료', en: 'Fee Payback' }, benefit1_value: { ko: '최대 $9,999', en: 'Up to $9,999' }, benefit2_tag: { ko: '수수료 할인', en: 'Fee Discount' }, benefit2_value: { ko: '20%', en: '20%' }, link: '#' },
    ],
    dexExchanges: [
        { name: { ko: 'Avantis', en: 'Avantis' }, logoText: 'AVA', benefit1_tag: { ko: '거래수수료', en: 'Fee Payback' }, benefit1_value: { ko: '포인트 부스트', en: 'Points Boost' }, benefit2_tag: { ko: '수수료 할인', en: 'Fee Discount' }, benefit2_value: { ko: '최대 20%', en: 'Up to 20%' }, link: '#' },
        { name: { ko: 'GRVT', en: 'GRVT' }, logoText: 'GRVT', benefit1_tag: { ko: '거래수수료', en: 'Fee Payback' }, benefit1_value: { ko: '미스터리 박스', en: 'Mystery Box' }, benefit2_tag: { ko: '수수료 할인', en: 'Fee Discount' }, benefit2_value: { ko: '시즌별 혜택', en: 'Seasonal Benefits' }, link: '#' },
        { name: { ko: '하이퍼리퀴드', en: 'Hyperliquid' }, logoText: 'HYP', benefit1_tag: { ko: '거래수수료', en: 'Fee Payback' }, benefit1_value: { ko: '포인트 적립', en: 'Earn Points' }, benefit2_tag: { ko: '수수료 할인', en: 'Fee Discount' }, benefit2_value: { ko: '10% 리베이트', en: '10% Rebate' }, link: '#' },
    ],
    faqs: [
        { question: { ko: '기존에 계정이 있어도 혜택을 받을 수 있나요?', en: 'Can I receive benefits if I already have an account?' }, answer: { ko: '아니요, 대부분의 거래소는 신규 가입자에 한해 레퍼럴 혜택을 제공합니다. 최대 혜택을 받으시려면 기존에 해당 거래소를 이용한 적 없는 새로운 이메일과 신분증으로 가입하시는 것을 권장합니다.', en: 'No, most exchanges only offer referral benefits to new subscribers. To receive the maximum benefits, we recommend signing up with a new email and ID that have not been previously used on that exchange.' } },
        { question: { ko: '페이백은 어떻게 지급되나요?', en: 'How is the payback paid out?' }, answer: { ko: '페이백은 거래소마다 정책이 다릅니다. 보통 거래 발생 후 일정 시간이 지나면(실시간, 매일, 매주 등) 현물 지갑으로 자동 입금됩니다. 자세한 내용은 각 거래소의 이용 약관을 참고해주세요.', en: 'Payback policies vary by exchange. It is usually automatically deposited into your spot wallet after a certain period following a transaction (e.g., real-time, daily, weekly). Please refer to the terms and conditions of each exchange for details.' } },
        { question: { ko: '이 사이트를 이용하는 것이 안전한가요?', en: 'Is it safe to use this site?' }, answer: { ko: '네, 안전합니다. 저희는 거래소의 공식 파트너 프로그램에 참여하여 합법적인 레퍼럴 링크를 제공합니다. 회원가입 및 거래는 모두 해당 거래소의 공식 사이트에서 직접 이루어지므로 개인정보 유출이나 보안 위험이 없습니다.', en: 'Yes, it is safe. We participate in the official partner programs of the exchanges and provide legitimate referral links. Registration and trading are all done directly on the official exchange websites, so there is no risk of personal information leakage or security issues.' } }
    ],
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

const uiStrings = {
    ko: {
        skipLink: '메인 콘텐츠로 건너뛰기',
        'nav.partners': '파트너 혜택',
        'nav.about': '서비스 소개',
        'nav.aboutSubtitle': '코인패스 이야기',
        'nav.howTo': '사용방법',
        'nav.howToSubtitle': '3단계 가이드',
        'nav.guides': '가이드',
        'nav.guidesSubtitle': '사용안내 및 이벤트',
        'nav.faq': '자주 묻는 질문',
        'hero.cta': '파트너 혜택 보기',
        'cex.title': '파트너 거래소 (CEX)',
        'dex.title': '파트너 거래소 (DEX)',
        'howTo.title': '세 단계로 끝내는 수수료 혜택',
        'howTo.step1.title': '회원가입',
        'howTo.step1.desc': '본 사이트의 제휴 링크를 통해 원하는 거래소에 가입합니다.',
        'howTo.step2.title': '거래하기',
        'howTo.step2.desc': 'KYC 인증 후 자유롭게 거래를 합니다.',
        'howTo.step3.title': '혜택 적용',
        'howTo.step3.desc': '거래할 때마다 수수료 할인이 자동으로 적용됩니다.',
        'faq.title': '자주 묻는 질문 (FAQ)',
        'support.title': '고객센터',
        'support.desc': '서비스 이용 중 궁금한 점이나 불편한 점이 있으신가요?\n텔레그램으로 문의주시면 빠르게 답변해드리겠습니다.',
        'support.cta': '텔레그램 문의하기',
        'footer.disclaimer': '본 서비스는 정보 제공을 목적으로 하며, 투자를 권유하거나 보장하지 않습니다. 모든 투자의 최종 결정과 책임은 투자자 본인에게 있습니다.',
        'popup.close24h': '24시간 보지않기',
        'popup.close': '닫기',
        'card.cta': '가입하고 혜택받기',
    },
    en: {
        skipLink: 'Skip to main content',
        'nav.partners': 'Partner Benefits',
        'nav.about': 'About Us',
        'nav.aboutSubtitle': 'The Coinpass Story',
        'nav.howTo': 'How to Use',
        'nav.howToSubtitle': '3-Step Guide',
        'nav.guides': 'Guides',
        'nav.guidesSubtitle': 'Info & Events',
        'nav.faq': 'FAQ',
        'hero.cta': 'View Partner Benefits',
        'cex.title': 'Partner Exchanges (CEX)',
        'dex.title': 'Partner Exchanges (DEX)',
        'howTo.title': 'Fee Benefits in Three Steps',
        'howTo.step1.title': 'Sign Up',
        'howTo.step1.desc': 'Sign up for the desired exchange through the affiliate link on this site.',
        'howTo.step2.title': 'Trade',
        'howTo.step2.desc': 'Trade freely after completing KYC verification.',
        'howTo.step3.title': 'Benefit Applied',
        'howTo.step3.desc': 'Fee discounts are automatically applied with every trade.',
        'faq.title': 'Frequently Asked Questions (FAQ)',
        'support.title': 'Customer Support',
        'support.desc': 'Have questions or issues while using the service?\nContact us on Telegram for a quick response.',
        'support.cta': 'Contact on Telegram',
        'footer.disclaimer': 'This service is for informational purposes only and does not constitute an investment recommendation or guarantee. The final decision and responsibility for all investments lie with the investor.',
        'popup.close24h': 'Don\'t show for 24 hours',
        'popup.close': 'Close',
        'card.cta': 'Sign Up & Get Benefits',
    }
};

let siteData = { ...defaultSiteData };
let currentLang = 'ko';

document.addEventListener('DOMContentLoaded', () => {
    setupLanguage();
    loadContent();
    setupScrollAnimations();
    setupMobileMenu();
    setupNavigation();
    setupPopup();
});

class TypingAnimator {
    private el: HTMLElement;
    private phrases: string[];
    private loopNum: number = 0;
    private typingSpeed: number = 100;
    private erasingSpeed: number = 50;
    private delayBetweenPhrases: number = 2000;
    private isPaused: boolean = false;
    private timeoutId: number | null = null;

    constructor(el: HTMLElement, phrases: string[]) {
        if (!el || !phrases || phrases.length === 0) {
            console.error("TypingAnimator: Invalid element or phrases.");
            return;
        }
        this.el = el;
        this.phrases = phrases;
        this.tick();
    }

    public setPhrases(phrases: string[]) {
        this.phrases = phrases;
        this.loopNum = 0;
        if(this.timeoutId) clearTimeout(this.timeoutId);
        if(!this.isPaused) this.tick();
    }

    private tick = async () => {
        if (this.isPaused || !this.el.isConnected) return;

        const i = this.loopNum % this.phrases.length;
        const fullTxt = this.phrases[i];

        // Typing
        for (let j = 0; j < fullTxt.length; j++) {
            if (this.isPaused || !this.el.isConnected) return;
            this.el.textContent = fullTxt.substring(0, j + 1);
            await this.sleep(this.typingSpeed);
        }

        // Pause
        if (this.isPaused || !this.el.isConnected) return;
        await this.sleep(this.delayBetweenPhrases);

        // Erasing
        for (let j = fullTxt.length; j > 0; j--) {
            if (this.isPaused || !this.el.isConnected) return;
            this.el.textContent = fullTxt.substring(0, j - 1);
            await this.sleep(this.erasingSpeed);
        }

        // Pause before next
        if (this.isPaused || !this.el.isConnected) return;
        await this.sleep(500);

        this.loopNum++;
        this.timeoutId = window.setTimeout(this.tick, 0);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => {
            this.timeoutId = window.setTimeout(resolve, ms);
        });
    }

    public pause() {
        this.isPaused = true;
        if(this.timeoutId) clearTimeout(this.timeoutId);
    }

    public resume() {
        if(this.isPaused) {
            this.isPaused = false;
            this.tick();
        }
    }
}

function setupLanguage() {
    const savedLang = localStorage.getItem('coinpass-lang');
    const browserLang = navigator.language.startsWith('en') ? 'en' : 'ko';
    
    currentLang = savedLang || browserLang;

    const koBtn = document.getElementById('lang-ko');
    const enBtn = document.getElementById('lang-en');
    
    koBtn?.addEventListener('click', () => setLanguage('ko'));
    enBtn?.addEventListener('click', () => setLanguage('en'));

    setLanguage(currentLang);
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('coinpass-lang', lang);
    document.documentElement.lang = lang;

    document.getElementById('lang-ko')?.classList.toggle('active', lang === 'ko');
    document.getElementById('lang-en')?.classList.toggle('active', lang === 'en');
    
    translateUI();
    loadContent(); // Reload content with the new language
}

function translateUI() {
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (key && uiStrings[currentLang][key]) {
            el.textContent = uiStrings[currentLang][key];
        }
    });
}


function loadContent() {
    const siteDataJSON = localStorage.getItem('coinpass-content');
    if (siteDataJSON) {
        try {
            const parsed = JSON.parse(siteDataJSON);
            // This deep merge is complex with i18n, so we'll do a simpler merge
            siteData = { ...defaultSiteData, ...parsed };

        } catch (e) {
            console.error('Failed to parse site data from localStorage, using default.', e);
            siteData = { ...defaultSiteData };
        }
    }
    
    setupHero(siteData.hero);
    updateAboutUs(siteData.aboutUs);
    populateExchangeGrid('exchange-grid', siteData.exchanges);
    populateExchangeGrid('dex-grid', siteData.dexExchanges);
    updateFaqs(siteData.faqs);
    updateSupportSection(siteData.support);
    setupPopup(); // Re-setup popup to get correct language text
}

let heroAnimator;
function setupHero(heroData) {
    const titleEl = document.getElementById('hero-title');
    const subtitleEl = document.getElementById('hero-subtitle');
    const heroSection = document.querySelector('.hero');

    if (titleEl && heroData.title) {
        const phrases = heroData.title[currentLang].split('\n').filter(p => p.trim() !== '');
        if (!heroAnimator) {
             heroAnimator = new TypingAnimator(titleEl as HTMLElement, phrases);
             if(heroSection){
                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            heroAnimator.resume();
                        } else {
                            heroAnimator.pause();
                        }
                    });
                });
                observer.observe(heroSection);
            }
        } else {
            heroAnimator.setPhrases(phrases);
        }
    }
    
    if (subtitleEl) subtitleEl.textContent = heroData.subtitle[currentLang];
}

function updateAboutUs(aboutUsData) {
    const titleEl = document.getElementById('about-us-title');
    const contentEl = document.getElementById('about-us-content');

    if (titleEl && aboutUsData) {
        titleEl.textContent = aboutUsData.title[currentLang];
    }
    if (contentEl && aboutUsData) {
        contentEl.innerHTML = ''; // Clear existing
        const fragment = document.createDocumentFragment();
        const paragraphs = aboutUsData.content[currentLang].split(/\n\s*\n/).filter(p => p.trim() !== '');
        paragraphs.forEach(pText => {
            const p = document.createElement('p');
            p.textContent = pText;
            fragment.appendChild(p);
        });
        contentEl.appendChild(fragment);
    }
}

function populateExchangeGrid(gridId, exchangesData) {
    const gridEl = document.getElementById(gridId);
    if (!gridEl || !exchangesData) return;
    
    const fragment = document.createDocumentFragment();
    exchangesData.forEach(exchange => {
        const card = document.createElement('div');
        card.className = 'exchange-card anim-fade-in';

        const header = document.createElement('div');
        header.className = 'card-header';
        
        const logoTextDiv = document.createElement('div');
        logoTextDiv.className = 'exchange-logo-text';
        logoTextDiv.textContent = exchange.logoText;

        const h4 = document.createElement('h4');
        h4.textContent = exchange.name[currentLang];

        header.appendChild(logoTextDiv);
        header.appendChild(h4);

        const benefitsList = document.createElement('ul');
        benefitsList.className = 'benefits-list';

        const benefit1 = document.createElement('li');
        const benefit1Tag = document.createElement('span');
        benefit1Tag.className = 'tag';
        benefit1Tag.textContent = exchange.benefit1_tag[currentLang];
        const benefit1Value = document.createElement('strong');
        benefit1Value.textContent = exchange.benefit1_value[currentLang];
        benefit1.appendChild(benefit1Tag);
        benefit1.appendChild(document.createTextNode(' '));
        benefit1.appendChild(benefit1Value);
        
        const benefit2 = document.createElement('li');
        const benefit2Tag = document.createElement('span');
        benefit2Tag.className = 'tag';
        benefit2Tag.textContent = exchange.benefit2_tag[currentLang];
        const benefit2Value = document.createElement('strong');
        benefit2Value.textContent = exchange.benefit2_value[currentLang];
        benefit2.appendChild(benefit2Tag);
        benefit2.appendChild(document.createTextNode(' '));
        benefit2.appendChild(benefit2Value);

        benefitsList.appendChild(benefit1);
        benefitsList.appendChild(benefit2);

        const ctaLink = document.createElement('a');
        ctaLink.href = exchange.link;
        ctaLink.className = 'card-cta';
        ctaLink.target = '_blank';
        ctaLink.rel = 'noopener noreferrer nofollow';
        ctaLink.textContent = uiStrings[currentLang]['card.cta'];

        card.appendChild(header);
        card.appendChild(benefitsList);
        card.appendChild(ctaLink);
        
        fragment.appendChild(card);
    });
    gridEl.innerHTML = ''; // Clear existing cards
    gridEl.appendChild(fragment);
}


function updateFaqs(faqsData) {
    const faqContainerEl = document.getElementById('faq-container');
    if (!faqContainerEl || !faqsData) return;
    
    const fragment = document.createDocumentFragment();
    faqsData.forEach(faq => {
        const details = document.createElement('details');
        details.className = 'anim-fade-in';

        const summary = document.createElement('summary');
        summary.textContent = faq.question[currentLang];

        const contentDiv = document.createElement('div');
        contentDiv.className = 'faq-content';
        
        const p = document.createElement('p');
        p.textContent = faq.answer[currentLang];

        contentDiv.appendChild(p);
        details.appendChild(summary);
        details.appendChild(contentDiv);
        
        fragment.appendChild(details);
    });
    faqContainerEl.innerHTML = ''; // Clear existing faqs
    faqContainerEl.appendChild(fragment);
}

function updateSupportSection(supportData) {
    const linkEl = document.getElementById('telegram-support-link');
    if (linkEl && supportData?.telegramUrl) {
        linkEl.setAttribute('href', supportData.telegramUrl);
    }
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.anim-fade-in').forEach(el => {
        observer.observe(el);
    });
}

function setupMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-button');
    const nav = document.getElementById('main-nav');

    if (hamburgerBtn && nav) {
        hamburgerBtn.addEventListener('click', () => {
            const isActive = hamburgerBtn.classList.toggle('is-active');
            nav.classList.toggle('is-active', isActive);
            hamburgerBtn.setAttribute('aria-expanded', isActive.toString());
        });

        // Close menu when a link is clicked
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('is-active');
                nav.classList.remove('is-active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

function setupNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if(href && href !== '#') {
                 e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

function setupPopup() {
    if (!siteData.popup || !siteData.popup.enabled) return;

    const hideUntil = localStorage.getItem('coinpass-popup-hide-until');
    if (hideUntil && Date.now() < parseInt(hideUntil, 10)) {
        return;
    }

    const now = new Date();
    const startDate = siteData.popup.startDate ? new Date(siteData.popup.startDate) : null;
    const endDate = siteData.popup.endDate ? new Date(siteData.popup.endDate) : null;

    if (startDate && now < startDate) return;
    if (endDate && now > endDate) return;

    const container = document.getElementById('popup-container');
    const imageEl = document.getElementById('popup-image');
    const textEl = document.getElementById('popup-text');
    const closeBtn = document.getElementById('popup-close');
    const close24hBtn = document.getElementById('popup-close-24h');
    const overlay = container ? container.querySelector('.popup-overlay') : null;

    if (!container || !imageEl || !textEl || !closeBtn || !close24hBtn) return;
    
    if (siteData.popup.type === 'image' && siteData.popup.imageUrl) {
        (imageEl as HTMLImageElement).src = siteData.popup.imageUrl;
        (imageEl as HTMLElement).style.display = 'block';
        (textEl as HTMLElement).style.display = 'none';
    } else if (siteData.popup.type === 'text' && siteData.popup.content[currentLang]) {
        textEl.textContent = siteData.popup.content[currentLang];
        (textEl as HTMLElement).style.display = 'block';
        (imageEl as HTMLElement).style.display = 'none';
    } else {
        return;
    }

    container.style.display = 'flex';

    closeBtn.onclick = () => {
        container.style.display = 'none';
    };

    close24hBtn.onclick = () => {
        const expires = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('coinpass-popup-hide-until', expires.toString());
        container.style.display = 'none';
    };
    
    if(overlay) {
        overlay.addEventListener('click', () => {
            container.style.display = 'none';
        });
    }
}


export {};
