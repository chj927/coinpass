document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeOnchainData();
});

function setupEventListeners() {
    setupMobileMenu();
}

function initializeOnchainData() {
    // TODO: This will be implemented when blockchain data APIs are integrated
    console.log('Onchain data visualization initialized');
    
    // Placeholder for future implementation
    const mockData = {
        tvl: {
            ethereum: 50000000000,
            polygon: 8000000000,
            arbitrum: 12000000000,
            optimism: 5000000000
        },
        volume24h: {
            ethereum: 15000000000,
            polygon: 2000000000,
            arbitrum: 3000000000,
            optimism: 1000000000
        },
        transactions: {
            ethereum: 1200000,
            polygon: 2500000,
            arbitrum: 800000,
            optimism: 400000
        }
    };
    
    displayPlaceholderMessage();
    console.log('Mock onchain data:', mockData);
}

function displayPlaceholderMessage() {
    const container = document.querySelector('.onchain-data-container');
    if (container) {
        container.innerHTML = `
            <div class="coming-soon-message">
                <h3>🔄 온체인 데이터 준비중</h3>
                <p>블록체인 API 연동을 통한 실시간 온체인 데이터 서비스를 준비하고 있습니다.</p>
                <p>곧 다음 기능들을 제공할 예정입니다:</p>
                <ul>
                    <li>실시간 TVL (Total Value Locked) 데이터</li>
                    <li>블록체인별 거래량 비교</li>
                    <li>활성 주소 수 추적</li>
                    <li>가스비 현황</li>
                    <li>DeFi 프로토콜 순위</li>
                </ul>
            </div>
        `;
    }
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