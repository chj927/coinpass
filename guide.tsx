const defaultSiteData = {
    guides: [
        { 
            title: '가이드 불러오는 중...', 
            content: '잠시만 기다려주세요. 콘텐츠를 불러오고 있습니다.'
        }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    loadGuides();
    setupScrollAnimations();
});

function loadGuides() {
    let guidesData = defaultSiteData.guides;
    const siteDataJSON = localStorage.getItem('coinpass-content');
    if (siteDataJSON) {
        try {
            const parsed = JSON.parse(siteDataJSON);
            if (parsed.guides && parsed.guides.length > 0) {
                guidesData = parsed.guides;
            }
        } catch (e) {
            console.error('Failed to parse site data from localStorage, using default.', e);
        }
    }
    renderGuides(guidesData);
}

function renderGuides(guidesData) {
    const container = document.getElementById('guides-container');
    if (!container) return;

    const fragment = document.createDocumentFragment();

    guidesData.forEach(guide => {
        const item = document.createElement('details');
        item.className = 'guide-item anim-fade-in';

        const title = document.createElement('summary');
        title.className = 'guide-title';
        title.textContent = guide.title;
        item.appendChild(title);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'guide-content';
        
        const paragraphs = guide.content.split(/\n\s*\n/).filter(p => p.trim() !== '');
        paragraphs.forEach(pText => {
            const p = document.createElement('p');
            p.innerHTML = pText
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');
            contentDiv.appendChild(p);
        });

        item.appendChild(contentDiv);
        fragment.appendChild(item);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
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

    // We might need to wait a frame for elements to be in the DOM
    setTimeout(() => {
        const elementsToAnimate = document.querySelectorAll('.anim-fade-in');
        elementsToAnimate.forEach(el => {
            observer.observe(el);
        });
    }, 100);
}

export {};
