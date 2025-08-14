import { supabase } from './supabaseClient';

interface Article {
    id: string;
    title: string;
    category: 'notice' | 'guide' | 'event' | 'airdrop';
    content_type: 'external' | 'internal';
    content: string | null;
    excerpt: string | null;
    external_url: string | null;
    image_url: string | null;
    author: string;
    is_pinned: boolean;
    is_published: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;
}

// 가상 데이터 (실제로는 Supabase에서 가져올 예정)
const mockArticles: Article[] = [
    {
        id: '1',
        title: '바이낸스 신규가입 100 USDT 즉시 지급 이벤트',
        category: 'event',
        content_type: 'external',
        content: null,
        excerpt: '바이낸스에서 역대급 신규가입 이벤트를 진행합니다. KYC 인증 완료 시 100 USDT를 즉시 지급하며, 첫 거래 시 추가 50 USDT 보너스까지!',
        external_url: 'https://blog.naver.com/coinpass/binance-event',
        image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop',
        author: '코인패스 에디터',
        is_pinned: true,
        is_published: true,
        view_count: 2341,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '2',
        title: 'LayerZero 에어드랍 확정, 스냅샷 임박',
        category: 'airdrop',
        content_type: 'external',
        content: null,
        excerpt: 'LayerZero 프로토콜의 공식 에어드랍이 확정되었습니다. 스냅샷 시점과 자격 조건을 확인하세요.',
        external_url: 'https://blog.naver.com/coinpass/layerzero-airdrop',
        image_url: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=400&h=250&fit=crop',
        author: '에어드랍 전문가',
        is_pinned: true,
        is_published: true,
        view_count: 1892,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '3',
        title: 'OKX 가입부터 인증까지 5분 완성 가이드',
        category: 'guide',
        content_type: 'external',
        content: null,
        excerpt: 'OKX 거래소 가입과 KYC 인증을 5분 만에 완료하는 방법을 단계별로 설명합니다.',
        external_url: 'https://blog.naver.com/coinpass/okx-guide',
        image_url: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=250&fit=crop',
        author: '가이드 마스터',
        is_pinned: true,
        is_published: true,
        view_count: 956,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    // 추가 콘텐츠
    {
        id: '4',
        title: '바이비트 춘절 이벤트 - 888 USDT 럭키드로우',
        category: 'event',
        content_type: 'external',
        content: null,
        excerpt: '바이비트에서 춘절을 맞아 대규모 이벤트를 진행합니다. 거래량 조건 충족 시 자동 참여!',
        external_url: 'https://blog.naver.com/coinpass/bybit-event',
        image_url: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&h=250&fit=crop',
        author: '이벤트 헌터',
        is_pinned: false,
        is_published: true,
        view_count: 523,
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '5',
        title: 'MEXC 거래소 가입 및 보안 설정 완벽 가이드',
        category: 'guide',
        content_type: 'external',
        content: null,
        excerpt: 'MEXC 거래소 가입부터 2FA 설정, 출금 주소 등록까지 한 번에 끝내는 가이드입니다.',
        external_url: 'https://blog.naver.com/coinpass/mexc-guide',
        image_url: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=400&h=250&fit=crop',
        author: '보안 전문가',
        is_pinned: false,
        is_published: true,
        view_count: 412,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '6',
        title: 'Scroll 메인넷 에어드랍 자격 조건 총정리',
        category: 'airdrop',
        content_type: 'external',
        content: null,
        excerpt: 'Scroll L2 에어드랍 예상 조건과 지금부터 준비해야 할 액션 플랜을 상세히 정리했습니다.',
        external_url: 'https://blog.naver.com/coinpass/scroll-airdrop',
        image_url: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=250&fit=crop',
        author: '크립토 리서처',
        is_pinned: false,
        is_published: true,
        view_count: 1234,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: '7',
        title: '코인패스 서비스 업데이트 및 신규 기능 안내',
        category: 'notice',
        content_type: 'external',
        content: null,
        excerpt: '더 나은 서비스를 위한 대규모 업데이트! 새로운 기능과 개선사항을 확인하세요.',
        external_url: 'https://blog.naver.com/coinpass/service-update',
        image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop',
        author: '코인패스 팀',
        is_pinned: false,
        is_published: true,
        view_count: 892,
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    }
];

class ModernArticlesManager {
    private articles: Article[] = [];
    private currentCategory: string = 'all';
    private currentPage: number = 1;
    private articlesPerPage: number = 8;
    private isLoading: boolean = false;
    private searchQuery: string = '';
    private selectedTags: Set<string> = new Set();
    private shareMenu: HTMLElement | null = null;

    constructor() {
        this.init();
    }

    private async init() {
        // 실제로는 Supabase에서 데이터를 가져옴
        // await this.loadArticles();
        
        // 현재는 목업 데이터 사용
        this.articles = mockArticles;
        
        this.setupEventListeners();
        this.renderFeaturedContent();
        this.renderContentGrid();
        this.updateCategoryCounts();
    }

    private async loadArticles() {
        try {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .eq('is_published', true)
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            this.articles = data || [];
        } catch (error) {
            console.error('Error loading articles:', error);
            // 에러 시 목업 데이터 사용
            this.articles = mockArticles;
        }
    }

    private setupEventListeners() {
        // 카테고리 필터
        const categoryPills = document.querySelectorAll('.category-pill');
        categoryPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const category = target.dataset.category || 'all';
                
                // 활성 상태 업데이트
                categoryPills.forEach(p => p.classList.remove('active'));
                target.classList.add('active');
                
                this.currentCategory = category;
                this.currentPage = 1;
                this.renderContentGrid();
            });
        });

        // 검색 기능
        const searchInput = document.getElementById('content-search') as HTMLInputElement;
        const searchClear = document.getElementById('search-clear') as HTMLButtonElement;
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                this.searchQuery = target.value.toLowerCase();
                
                // 검색어 지우기 버튼 표시
                if (searchClear) {
                    searchClear.style.display = this.searchQuery ? 'flex' : 'none';
                }
                
                this.currentPage = 1;
                this.renderContentGrid();
            });
        }

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    this.searchQuery = '';
                    searchClear.style.display = 'none';
                    this.currentPage = 1;
                    this.renderContentGrid();
                }
            });
        }

        // 태그 필터
        const tagChips = document.querySelectorAll('.tag-chip');
        tagChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const tag = target.dataset.tag || '';
                
                // 태그 토글
                if (this.selectedTags.has(tag)) {
                    this.selectedTags.delete(tag);
                    target.classList.remove('active');
                } else {
                    this.selectedTags.add(tag);
                    target.classList.add('active');
                }
                
                this.currentPage = 1;
                this.renderContentGrid();
            });
        });

        // 정렬 옵션
        const sortSelect = document.querySelector('.sort-select') as HTMLSelectElement;
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortArticles(sortSelect.value);
                this.renderContentGrid();
            });
        }

        // 더보기 버튼
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMore();
            });
        }

        // 공유 메뉴 설정
        this.setupShareMenu();

        // 뉴스레터 구독
        const newsletterForm = document.querySelector('.newsletter-form') as HTMLFormElement;
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmit(newsletterForm);
            });
        }
    }

    private updateCategoryCounts() {
        const categories = ['all', 'event', 'guide', 'airdrop', 'notice'];
        
        categories.forEach(category => {
            const pill = document.querySelector(`.category-pill[data-category="${category}"]`);
            if (pill) {
                const count = pill.querySelector('.pill-count');
                if (count) {
                    if (category === 'all') {
                        count.textContent = this.articles.length.toString();
                    } else {
                        const categoryCount = this.articles.filter(a => a.category === category).length;
                        count.textContent = categoryCount.toString();
                    }
                }
            }
        });
    }

    private renderFeaturedContent() {
        // 피처드 콘텐츠는 is_pinned가 true인 항목들
        const featuredArticles = this.articles.filter(a => a.is_pinned).slice(0, 3);
        
        if (featuredArticles.length === 0) return;

        // 메인 피처드 카드
        const mainArticle = featuredArticles[0];
        const mainCard = document.querySelector('.featured-main');
        if (mainCard && mainArticle) {
            this.updateFeaturedMainCard(mainCard, mainArticle);
        }

        // 사이드 피처드 카드들
        const sideArticles = featuredArticles.slice(1, 3);
        const sideCards = document.querySelectorAll('.featured-small');
        sideArticles.forEach((article, index) => {
            if (sideCards[index]) {
                this.updateFeaturedSideCard(sideCards[index], article);
            }
        });
    }

    private updateFeaturedMainCard(card: Element, article: Article) {
        const image = card.querySelector('.featured-image img') as HTMLImageElement;
        const category = card.querySelector('.featured-category');
        const author = card.querySelector('.meta-author');
        const date = card.querySelector('.meta-date');
        const title = card.querySelector('.featured-title');
        const excerpt = card.querySelector('.featured-excerpt');
        const viewCount = card.querySelector('.engagement span:first-child');
        const link = card.querySelector('.read-more') as HTMLAnchorElement;

        if (image) image.src = article.image_url || '';
        if (category) category.textContent = this.getCategoryLabel(article.category);
        if (date) date.textContent = this.getRelativeTime(article.created_at);
        if (title) title.textContent = article.title;
        if (excerpt) excerpt.textContent = article.excerpt || '';
        if (viewCount) viewCount.textContent = `👁 ${this.formatNumber(article.view_count)}`;
        if (link) link.href = article.external_url || '#';
    }

    private updateFeaturedSideCard(card: Element, article: Article) {
        const image = card.querySelector('.small-image img') as HTMLImageElement;
        const category = card.querySelector('.small-category');
        const title = card.querySelector('h4');
        const date = card.querySelector('.small-meta span:first-child');
        const viewCount = card.querySelector('.small-meta span:last-child');
        const link = card.querySelector('.small-link') as HTMLAnchorElement;

        if (image) image.src = article.image_url || '';
        if (category) category.textContent = this.getCategoryLabel(article.category);
        if (title) title.textContent = article.title;
        if (date) date.textContent = this.getRelativeTime(article.created_at);
        if (viewCount) viewCount.textContent = `👁 ${this.formatNumber(article.view_count)}`;
        if (link) link.href = article.external_url || '#';
    }

    private renderContentGrid() {
        const container = document.querySelector('.content-grid');
        if (!container) return;

        // 필터링
        let filteredArticles = this.articles;
        
        // 카테고리 필터
        if (this.currentCategory !== 'all') {
            filteredArticles = filteredArticles.filter(a => a.category === this.currentCategory);
        }
        
        // 검색어 필터
        if (this.searchQuery) {
            filteredArticles = filteredArticles.filter(article => {
                const searchableText = `${article.title} ${article.excerpt || ''}`.toLowerCase();
                return searchableText.includes(this.searchQuery);
            });
        }
        
        // 태그 필터
        if (this.selectedTags.size > 0) {
            filteredArticles = filteredArticles.filter(article => {
                const articleText = `${article.title} ${article.excerpt || ''}`.toLowerCase();
                return Array.from(this.selectedTags).some(tag => 
                    articleText.includes(tag.toLowerCase())
                );
            });
        }

        // 페이지네이션
        const startIndex = 0;
        const endIndex = this.currentPage * this.articlesPerPage;
        const visibleArticles = filteredArticles.slice(startIndex, endIndex);

        // 렌더링
        container.innerHTML = visibleArticles.map(article => this.renderContentCard(article)).join('');
        
        // 공유 버튼 이벤트 설정
        this.setupShareButtons();

        // 더보기 버튼 표시/숨김
        const loadMoreBtn = document.querySelector('.load-more-btn') as HTMLButtonElement;
        if (loadMoreBtn) {
            loadMoreBtn.style.display = endIndex >= filteredArticles.length ? 'none' : 'flex';
        }
    }

    private renderContentCard(article: Article): string {
        const categoryClass = article.category;
        const categoryLabel = this.getCategoryLabel(article.category);
        const relativeTime = this.getRelativeTime(article.created_at);
        const viewCount = this.formatNumber(article.view_count);

        return `
            <article class="content-card" data-category="${article.category}">
                <a href="${article.external_url || '#'}" target="_blank" class="card-link">
                    <div class="card-image">
                        <img src="${article.image_url || 'https://via.placeholder.com/400x250'}" alt="${article.title}">
                        <div class="card-overlay">
                            <span class="overlay-text">블로그에서 읽기</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="card-meta">
                            <span class="meta-category ${categoryClass}">${categoryLabel}</span>
                            <span class="meta-time">${relativeTime}</span>
                        </div>
                        <h3 class="card-title">${article.title}</h3>
                        <p class="card-excerpt">${article.excerpt || ''}</p>
                        <div class="card-footer">
                            <div class="card-stats">
                                <span>👁 ${viewCount}</span>
                                <span>💬 ${Math.floor(Math.random() * 50)}</span>
                            </div>
                            <div class="card-actions">
                                <button class="share-btn" data-title="${article.title}" data-url="${article.external_url || '#'}">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M8.59 13.51l6.83 3.98m-.01-10.98l-6.82 3.98M21 5a3 3 0 11-6 0 3 3 0 016 0zM9 12a3 3 0 11-6 0 3 3 0 016 0zm12 7a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                </button>
                                <span class="external-link">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </a>
            </article>
        `;
    }

    private sortArticles(sortBy: string) {
        switch (sortBy) {
            case 'popular':
                this.articles.sort((a, b) => b.view_count - a.view_count);
                break;
            case 'comments':
                // 실제로는 댓글 수로 정렬
                this.articles.sort(() => Math.random() - 0.5);
                break;
            case 'latest':
            default:
                this.articles.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
        }
    }

    private loadMore() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage++;
        
        // 로딩 애니메이션
        const btn = document.querySelector('.load-more-btn') as HTMLButtonElement;
        if (btn) {
            btn.textContent = '로딩 중...';
            btn.disabled = true;
        }

        // 실제로는 서버에서 추가 데이터를 가져옴
        setTimeout(() => {
            this.renderContentGrid();
            this.isLoading = false;
            
            if (btn) {
                btn.innerHTML = `
                    더 많은 콘텐츠 보기
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14m0 0l7-7m-7 7l-7-7" stroke="currentColor" stroke-width="2"/>
                    </svg>
                `;
                btn.disabled = false;
            }
        }, 500);
    }

    private handleNewsletterSubmit(form: HTMLFormElement) {
        const emailInput = form.querySelector('.email-input') as HTMLInputElement;
        const submitBtn = form.querySelector('.subscribe-btn') as HTMLButtonElement;
        
        if (!emailInput || !submitBtn) return;

        const email = emailInput.value.trim();
        if (!email || !this.validateEmail(email)) {
            this.showToast('올바른 이메일 주소를 입력해주세요', 'error');
            return;
        }

        // 버튼 상태 변경
        submitBtn.textContent = '구독 중...';
        submitBtn.disabled = true;

        // 실제로는 서버에 이메일 전송
        setTimeout(() => {
            this.showToast('구독이 완료되었습니다! 매주 화요일에 만나요 🎉', 'success');
            emailInput.value = '';
            submitBtn.textContent = '구독하기';
            submitBtn.disabled = false;
        }, 1000);
    }

    private validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    private showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 12px;
            font-weight: 600;
            z-index: 9999;
            animation: slideInUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    private getCategoryLabel(category: string): string {
        const labels: Record<string, string> = {
            'notice': '공지사항',
            'guide': '가이드',
            'event': '이벤트',
            'airdrop': '에어드랍'
        };
        return labels[category] || category;
    }

    private getRelativeTime(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;
        if (days < 30) return `${Math.floor(days / 7)}주 전`;
        if (days < 365) return `${Math.floor(days / 30)}개월 전`;
        return `${Math.floor(days / 365)}년 전`;
    }

    private formatNumber(num: number): string {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    private setupShareMenu() {
        // 공유 메뉴 생성
        if (!this.shareMenu) {
            this.shareMenu = document.createElement('div');
            this.shareMenu.className = 'share-menu';
            this.shareMenu.innerHTML = `
                <a href="#" class="share-option" data-platform="kakao">
                    <div class="share-icon">💬</div>
                    <span>카카오톡</span>
                </a>
                <a href="#" class="share-option" data-platform="facebook">
                    <div class="share-icon">📘</div>
                    <span>페이스북</span>
                </a>
                <a href="#" class="share-option" data-platform="twitter">
                    <div class="share-icon">🐦</div>
                    <span>트위터</span>
                </a>
                <a href="#" class="share-option" data-platform="link">
                    <div class="share-icon">🔗</div>
                    <span>링크복사</span>
                </a>
            `;
            document.body.appendChild(this.shareMenu);
            
            // 공유 옵션 클릭 이벤트
            this.shareMenu.querySelectorAll('.share-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    const platform = (e.currentTarget as HTMLElement).dataset.platform;
                    const title = this.shareMenu?.dataset.title || '';
                    const url = this.shareMenu?.dataset.url || '';
                    this.handleShare(platform || '', title, url);
                });
            });
            
            // 외부 클릭 시 메뉴 닫기
            document.addEventListener('click', (e) => {
                if (!this.shareMenu?.contains(e.target as Node) && 
                    !(e.target as HTMLElement).closest('.share-btn')) {
                    this.shareMenu?.classList.remove('active');
                }
            });
        }
    }

    private setupShareButtons() {
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const target = e.currentTarget as HTMLElement;
                const title = target.dataset.title || '';
                const url = target.dataset.url || '';
                
                if (this.shareMenu) {
                    this.shareMenu.dataset.title = title;
                    this.shareMenu.dataset.url = url;
                    this.shareMenu.classList.add('active');
                }
            });
        });
    }

    private handleShare(platform: string, title: string, url: string) {
        const encodedTitle = encodeURIComponent(title);
        const encodedUrl = encodeURIComponent(url);
        
        let shareUrl = '';
        
        switch (platform) {
            case 'kakao':
                // 카카오톡 공유 (실제 구현 시 Kakao SDK 필요)
                this.showToast('카카오톡 공유 기능은 준비 중입니다', 'info');
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
                window.open(shareUrl, '_blank', 'width=600,height=400');
                break;
            case 'link':
                navigator.clipboard.writeText(url).then(() => {
                    this.showToast('링크가 복사되었습니다', 'success');
                }).catch(() => {
                    this.showToast('링크 복사에 실패했습니다', 'error');
                });
                break;
        }
        
        // 메뉴 닫기
        this.shareMenu?.classList.remove('active');
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new ModernArticlesManager();

    // 스타일 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideOutDown {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(20px);
            }
        }
    `;
    document.head.appendChild(style);
});