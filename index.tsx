
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
    guides: []
};


document.addEventListener('DOMContentLoaded', () => {
    loadContent();
    setupScrollAnimations();
    setupNavigation();
});

class TypingAnimator {
    private el: HTMLElement;
    private phrases: string[];
    private loopNum: number = 0;
    private typingSpeed: number = 100;
    private erasingSpeed: number = 50;
    private delayBetweenPhrases: number = 2000;

    constructor(el: HTMLElement, phrases: string[]) {
        if (!el || !phrases || phrases.length === 0) {
            console.error("TypingAnimator: Invalid element or phrases.");
            return;
        }
        this.el = el;
        this.phrases = phrases;
        this.tick();
    }

    private async tick() {
        const i = this.loopNum % this.phrases.length;
        const fullTxt = this.phrases[i];

        // Typing
        for (let j = 0; j < fullTxt.length; j++) {
            this.el.textContent = fullTxt.substring(0, j + 1);
            await this.sleep(this.typingSpeed);
        }

        // Pause
        await this.sleep(this.delayBetweenPhrases);

        // Erasing
        for (let j = fullTxt.length; j > 0; j--) {
            this.el.textContent = fullTxt.substring(0, j - 1);
            await this.sleep(this.erasingSpeed);
        }

        // Pause before next
        await this.sleep(500);

        this.loopNum++;
        this.tick();
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}


function loadContent() {
    let siteData = { ...defaultSiteData };
    const siteDataJSON = localStorage.getItem('coinpass-content');
    if (siteDataJSON) {
        try {
            const parsed = JSON.parse(siteDataJSON);
            siteData = {
                hero: { ...defaultSiteData.hero, ...(parsed.hero || {}) },
                aboutUs: { ...defaultSiteData.aboutUs, ...(parsed.aboutUs || {}) },
                exchanges: parsed.exchanges || defaultSiteData.exchanges,
                dexExchanges: parsed.dexExchanges || defaultSiteData.dexExchanges,
                faqs: parsed.faqs || defaultSiteData.faqs,
                guides: parsed.guides || defaultSiteData.guides
            };
        } catch (e) {
            console.error('Failed to parse site data from localStorage, using default.', e);
        }
    }
    
    setupHero(siteData.hero);
    if (siteData.aboutUs) {
        updateAboutUs(siteData.aboutUs);
    }
    populateExchangeGrid('exchange-grid', siteData.exchanges);
    if(siteData.dexExchanges) {
        populateExchangeGrid('dex-grid', siteData.dexExchanges);
    }
    updateFaqs(siteData.faqs);
}

function setupHero(heroData) {
    const titleEl = document.getElementById('hero-title');
    const subtitleEl = document.getElementById('hero-subtitle');

    if (titleEl && heroData.title) {
        const phrases = heroData.title.split('\n').filter(p => p.trim() !== '');
        new TypingAnimator(titleEl, phrases);
    }
    
    if (subtitleEl) subtitleEl.textContent = heroData.subtitle;
}

function updateAboutUs(aboutUsData) {
    const titleEl = document.getElementById('about-us-title');
    const contentEl = document.getElementById('about-us-content');

    if (titleEl) {
        titleEl.textContent = aboutUsData.title;
    }
    if (contentEl) {
        contentEl.innerHTML = ''; // Clear existing
        const fragment = document.createDocumentFragment();
        const paragraphs = aboutUsData.content.split(/\n\s*\n/).filter(p => p.trim() !== '');
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
    if (!gridEl) return;
    
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
        h4.textContent = exchange.name;

        header.appendChild(logoTextDiv);
        header.appendChild(h4);

        const benefitsList = document.createElement('ul');
        benefitsList.className = 'benefits-list';

        const benefit1 = document.createElement('li');
        const benefit1Tag = document.createElement('span');
        benefit1Tag.className = 'tag';
        benefit1Tag.textContent = exchange.benefit1_tag;
        const benefit1Value = document.createElement('strong');
        benefit1Value.textContent = exchange.benefit1_value;
        benefit1.appendChild(benefit1Tag);
        benefit1.appendChild(document.createTextNode(' '));
        benefit1.appendChild(benefit1Value);
        
        const benefit2 = document.createElement('li');
        const benefit2Tag = document.createElement('span');
        benefit2Tag.className = 'tag';
        benefit2Tag.textContent = exchange.benefit2_tag;
        const benefit2Value = document.createElement('strong');
        benefit2Value.textContent = exchange.benefit2_value;
        benefit2.appendChild(benefit2Tag);
        benefit2.appendChild(document.createTextNode(' '));
        benefit2.appendChild(benefit2Value);

        benefitsList.appendChild(benefit1);
        benefitsList.appendChild(benefit2);

        const ctaLink = document.createElement('a');
        ctaLink.href = exchange.link;
        ctaLink.className = 'card-cta';
        ctaLink.target = '_blank';
        ctaLink.rel = 'noopener noreferrer';
        ctaLink.textContent = '가입하고 혜택받기';

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
    if (!faqContainerEl) return;
    
    const fragment = document.createDocumentFragment();
    faqsData.forEach(faq => {
        const details = document.createElement('details');
        details.className = 'anim-fade-in';

        const summary = document.createElement('summary');
        summary.textContent = faq.question;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'faq-content';
        
        const p = document.createElement('p');
        p.textContent = faq.answer;

        contentDiv.appendChild(p);
        details.appendChild(summary);
        details.appendChild(contentDiv);
        
        fragment.appendChild(details);
    });
    faqContainerEl.innerHTML = ''; // Clear existing faqs
    faqContainerEl.appendChild(fragment);
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

    const elementsToAnimate = document.querySelectorAll('.anim-fade-in');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

function setupNavigation() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const href = this.getAttribute('href');
            if(href) {
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

export {};