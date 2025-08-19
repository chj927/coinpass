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


class ModernArticlesManager {
    private articles: Article[] = [];
    private currentCategory: string = 'all';
    private currentPage: number = 1;
    private articlesPerPage: number = 8;
    private isLoading: boolean = false;
    private searchQuery: string = '';
    private selectedTags: Set<string> = new Set();
    private shareMenu: HTMLElement | null = null;
    private currentSlide: number = 0;

    constructor() {
        this.init();
    }

    private async init() {
        // 실제 Supabase 데이터 로드
        await this.loadArticles();
        
        console.log('Articles loaded, rendering UI...');
        
        this.setupEventListeners();
        this.renderFeaturedContent();
        this.renderContentGrid();
        this.updateCategoryCounts();
        
        // Make debug methods available globally
        (window as any).refreshArticles = () => {
            console.log('Manually refreshing articles...');
            this.loadArticles().then(() => {
                this.renderFeaturedContent();
                this.renderContentGrid();
                console.log('Articles refreshed');
            });
        };
        
        // Debug function to check pinned articles
        (window as any).debugPinnedArticles = async () => {
            console.log('=== DEBUGGING PINNED ARTICLES ===');
            
            // Check Supabase connection
            if (!supabase) {
                console.error('❌ Supabase client is NULL');
                return;
            }
            console.log('✅ Supabase client exists');
            
            // Fetch all articles
            const { data: allArticles, error: allError } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (allError) {
                console.error('❌ Error fetching articles:', allError);
                return;
            }
            
            console.log(`📊 Total articles in database: ${allArticles?.length || 0}`);
            
            // Check pinned articles
            const pinnedArticles = allArticles?.filter(a => 
                a.is_pinned === true || a.is_pinned === 'true' || a.is_pinned === 1
            ) || [];
            
            console.log(`📌 Pinned articles: ${pinnedArticles.length}`);
            
            if (pinnedArticles.length > 0) {
                console.log('Pinned articles details:');
                pinnedArticles.forEach(article => {
                    console.log(`  - "${article.title}" (is_pinned: ${article.is_pinned}, type: ${typeof article.is_pinned})`);
                });
            }
            
            // Check what's currently rendered
            const carouselTrack = document.getElementById('carouselTrack');
            const renderedSlides = carouselTrack?.querySelectorAll('.carousel-slide').length || 0;
            console.log(`🎠 Carousel slides rendered: ${renderedSlides}`);
            
            // Check current articles in memory
            console.log(`💾 Articles in memory: ${this.articles.length}`);
            const memoryPinned = this.articles.filter(a => 
                a.is_pinned === true || a.is_pinned === 'true' || a.is_pinned === 1
            );
            console.log(`📌 Pinned articles in memory: ${memoryPinned.length}`);
            
            return {
                database: allArticles?.length || 0,
                pinned: pinnedArticles.length,
                rendered: renderedSlides,
                inMemory: this.articles.length
            };
        };
    }

    private async loadArticles() {
        this.showLoadingState(true);
        
        console.log('=== LOADING ARTICLES ===');
        
        try {
            // Check if Supabase is initialized
            if (!supabase) {
                console.error('Supabase client is not initialized');
                throw new Error('Database connection not available');
            }
            
            // Fetch ALL articles without any WHERE clause to avoid RLS issues
            // We'll filter on the client side
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Database error:', error);
                throw error;
            }
            
            // Process the data
            const allArticles = data || [];
            console.log(`Fetched ${allArticles.length} total articles from database`);
            
            // Filter for published articles on client side
            // Use explicit comparison to avoid type coercion issues
            this.articles = allArticles.filter(article => {
                // Handle potential string 'true'/'false' values from database
                const isPublished = article.is_published === true || 
                                  article.is_published === 'true' || 
                                  article.is_published === 1;
                return isPublished;
            });
            
            console.log(`Filtered to ${this.articles.length} published articles`);
            
            // Sort articles: pinned first, then by date
            this.articles.sort((a, b) => {
                // Convert to boolean to handle any type issues
                const aPinned = a.is_pinned === true || a.is_pinned === 'true' || a.is_pinned === 1;
                const bPinned = b.is_pinned === true || b.is_pinned === 'true' || b.is_pinned === 1;
                
                if (aPinned && !bPinned) return -1;
                if (!aPinned && bPinned) return 1;
                
                // If both pinned or both not pinned, sort by date
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            
            // Log pinned articles for debugging
            const pinnedCount = this.articles.filter(a => 
                a.is_pinned === true || a.is_pinned === 'true' || a.is_pinned === 1
            ).length;
            console.log(`Found ${pinnedCount} pinned articles among published articles`);
            
            if (this.articles.length === 0) {
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Failed to load articles:', error);
            this.articles = [];
            this.showErrorState('아티클을 불러오는 중 오류가 발생했습니다.');
        } finally {
            this.showLoadingState(false);
        }
    }
    
    private showLoadingState(isLoading: boolean) {
        const gridContainer = document.getElementById('contentGrid');
        const featuredSection = document.querySelector('.featured-section');
        
        if (isLoading) {
            if (gridContainer) gridContainer.innerHTML = '<div class="loading-message">콘텐츠를 불러오는 중...</div>';
            if (featuredSection) featuredSection.classList.add('loading');
        } else {
            if (featuredSection) featuredSection.classList.remove('loading');
        }
    }
    
    private showEmptyState() {
        const gridContainer = document.getElementById('contentGrid');
        if (gridContainer) {
            gridContainer.innerHTML = `
                <div class="empty-state">
                    <p>아직 등록된 아티클이 없습니다.</p>
                    <p>곧 새로운 콘텐츠가 업데이트될 예정입니다.</p>
                </div>
            `;
        }
    }
    
    private showErrorState(message: string) {
        const gridContainer = document.getElementById('contentGrid');
        if (gridContainer) {
            gridContainer.innerHTML = `
                <div class="error-state">
                    <p>${message}</p>
                    <button onclick="location.reload()" class="retry-button">다시 시도</button>
                </div>
            `;
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

        // Minimal Search Setup
        const searchToggle = document.getElementById('searchToggle') as HTMLButtonElement;
        const searchBox = document.getElementById('searchBox') as HTMLDivElement;
        const searchInput = document.getElementById('articleSearch') as HTMLInputElement;
        const searchClear = document.getElementById('searchClear') as HTMLButtonElement;
        
        if (searchToggle && searchBox) {
            searchToggle.addEventListener('click', () => {
                searchBox.classList.add('expanded');
                searchInput?.focus();
            });
        }
        
        // Close search on click outside
        document.addEventListener('click', (e) => {
            if (searchBox && searchToggle && 
                !searchBox.contains(e.target as Node) && 
                !searchToggle.contains(e.target as Node)) {
                searchBox.classList.remove('expanded');
                if (searchInput) {
                    searchInput.value = '';
                    this.searchQuery = '';
                    this.currentPage = 1;
                    this.renderContentGrid();
                }
            }
        });
        
        // Close search on Escape key
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && searchBox) {
                    searchBox.classList.remove('expanded');
                    searchInput.value = '';
                    this.searchQuery = '';
                    this.currentPage = 1;
                    this.renderContentGrid();
                }
            });
            
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
                // 검색 박스 닫기
                if (searchBox) {
                    setTimeout(() => {
                        searchBox.classList.remove('expanded');
                    }, 300);
                }
            });
        }

        // NEW: Tags Panel Toggle
        const tagsFilterBtn = document.getElementById('tagsFilterBtn') as HTMLButtonElement;
        const tagsPanel = document.getElementById('tagsPanel') as HTMLDivElement;
        
        if (tagsFilterBtn && tagsPanel) {
            tagsFilterBtn.addEventListener('click', () => {
                tagsPanel.classList.toggle('expanded');
                tagsFilterBtn.classList.toggle('active');
            });
        }
        
        // NEW: Tag Selection with Active Filters
        const tagChips = document.querySelectorAll('.tag-chip');
        const activeFilters = document.getElementById('activeFilters') as HTMLDivElement;
        const filtersList = activeFilters?.querySelector('.filters-list');
        const clearFilters = document.getElementById('clearFilters') as HTMLButtonElement;
        const filterBadge = document.querySelector('.filter-badge');
        
        tagChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const tag = target.dataset.tag || '';
                
                // 태그 토글
                if (this.selectedTags.has(tag)) {
                    this.selectedTags.delete(tag);
                    target.classList.remove('selected');
                } else {
                    this.selectedTags.add(tag);
                    target.classList.add('selected');
                }
                
                this.updateActiveFilters();
                this.currentPage = 1;
                this.renderContentGrid();
            });
        });
        
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.selectedTags.clear();
                tagChips.forEach(chip => chip.classList.remove('selected'));
                this.updateActiveFilters();
                this.currentPage = 1;
                this.renderContentGrid();
            });
        }
        
        // NEW: Sticky Navigation Scroll Effect
        const categoryNav = document.getElementById('categoryNav');
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (categoryNav) {
                if (currentScroll > 100) {
                    categoryNav.classList.add('scrolled');
                } else {
                    categoryNav.classList.remove('scrolled');
                }
            }
            
            lastScroll = currentScroll;
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

    private updateActiveFilters() {
        const activeFilters = document.getElementById('activeFilters') as HTMLDivElement;
        const filtersList = activeFilters?.querySelector('.filters-list');
        const filterBadge = document.querySelector('.filter-badge');
        
        if (!activeFilters || !filtersList) return;
        
        if (this.selectedTags.size > 0) {
            activeFilters.classList.add('visible');
            
            // Update filter tags
            const filterTagsHTML = Array.from(this.selectedTags).map(tag => 
                `<span class="filter-tag">${tag} ×</span>`
            ).join('');
            
            filtersList.innerHTML = `
                <span style="color: var(--text-muted); font-size: 13px;">활성 필터:</span>
                ${filterTagsHTML}
            `;
            
            // Update badge count
            if (filterBadge) {
                filterBadge.textContent = this.selectedTags.size.toString();
            }
        } else {
            activeFilters.classList.remove('visible');
            if (filterBadge) {
                filterBadge.textContent = '8'; // Default count
            }
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
        console.log('=== RENDERING FEATURED CONTENT ===');
        
        if (!this.articles || this.articles.length === 0) {
            console.log('No articles available to render');
            this.updateCarouselSlides([]);
            return;
        }
        
        // Filter for pinned articles with flexible type checking
        // Handle potential database type inconsistencies
        const featuredArticles = this.articles.filter(article => {
            // Check is_pinned with multiple type possibilities
            const isPinned = article.is_pinned === true || 
                           article.is_pinned === 'true' || 
                           article.is_pinned === 1;
            
            // Check is_published (should already be filtered, but double-check)
            const isPublished = article.is_published === true || 
                              article.is_published === 'true' || 
                              article.is_published === 1;
            
            return isPinned && isPublished;
        }).slice(0, 3); // Take maximum 3 featured articles
        
        console.log(`Found ${featuredArticles.length} pinned articles for featured section`);
        
        // If we have pinned articles, use them
        if (featuredArticles.length > 0) {
            console.log('Displaying pinned articles:', featuredArticles.map(a => a.title));
            this.updateCarouselSlides(featuredArticles);
        } else {
            // Otherwise, use the latest 3 published articles
            console.log('No pinned articles found, using latest articles instead');
            const latestArticles = this.articles.slice(0, 3);
            
            if (latestArticles.length > 0) {
                console.log('Displaying latest articles:', latestArticles.map(a => a.title));
                this.updateCarouselSlides(latestArticles);
            } else {
                console.log('No articles available for featured section');
                this.updateCarouselSlides([]);
            }
        }
    }
    
    private updateCarouselSlides(articles: Article[]) {
        const carouselTrack = document.getElementById('carouselTrack');
        const carouselIndicators = document.getElementById('carouselIndicators');
        
        if (!carouselTrack || articles.length === 0) {
            // 데이터가 없을 때 처리
            if (carouselTrack) {
                carouselTrack.innerHTML = `
                    <div class="no-featured-content">
                        <p>현재 표시할 핫한 콘텐츠가 없습니다.</p>
                    </div>
                `;
            }
            if (carouselIndicators) {
                carouselIndicators.innerHTML = '';
            }
            return;
        }
        
        // 캐러셀 슬라이드 HTML 생성
        // 인라인 스타일 추가로 CSS 오버라이드 확실히 하기
        carouselTrack.style.position = 'relative';
        carouselTrack.style.minHeight = '450px';
        carouselTrack.style.display = 'block'; // flex 제거
        
        carouselTrack.innerHTML = articles.map((article, index) => `
            <article class="carousel-slide ${index === 0 ? 'active' : ''}" data-slide="${index}">
                <div class="slide-content">
                    <div class="slide-image">
                        <img src="${article.image_url || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=600&fit=crop'}" 
                             alt="${article.title}"
                             loading="lazy">
                        <div class="slide-overlay">
                            <div class="slide-badge">${this.getCategoryBadge(article.category)}</div>
                            <div class="slide-category">${this.getCategoryLabel(article.category)}</div>
                        </div>
                    </div>
                    <div class="slide-info">
                        <div class="slide-meta">
                            <span class="meta-author">${article.author}</span>
                            <span class="meta-divider">•</span>
                            <span class="meta-date">${this.formatDate(article.created_at)}</span>
                            <span class="meta-divider">•</span>
                            <span class="meta-views">👁 ${this.formatNumber(article.view_count)}</span>
                        </div>
                        <h3 class="slide-title">${article.title}</h3>
                        <p class="slide-excerpt">${article.excerpt || ''}</p>
                        <a href="${article.content_type === 'external' ? article.external_url : `/article/${article.id}`}" 
                           target="${article.content_type === 'external' ? '_blank' : '_self'}" 
                           class="slide-cta">
                            자세히 보기
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </article>
        `).join('');
        
        // 인디케이터 동적 생성
        if (carouselIndicators) {
            carouselIndicators.innerHTML = articles.map((_, index) => `
                <button class="indicator ${index === 0 ? 'active' : ''}" 
                        data-slide="${index}" 
                        aria-label="슬라이드 ${index + 1}"></button>
            `).join('');
            
            // 인디케이터 이벤트 리스너 재설정
            this.setupCarouselIndicators();
        }
        
        // 캐러셀 기능 재초기화 (이벤트 리스너 재설정)
        this.reinitializeCarousel();
    }
    
    private setupCarouselIndicators() {
        const indicators = document.querySelectorAll('.carousel-indicators .indicator');
        indicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const slideIndex = parseInt(target.dataset.slide || '0');
                this.goToSlide(slideIndex);
            });
        });
    }
    
    private goToSlide(index: number) {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.carousel-indicators .indicator');
        
        // 모든 슬라이드와 인디케이터 비활성화
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // 선택된 슬라이드와 인디케이터 활성화
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (indicators[index]) {
            indicators[index].classList.add('active');
        }
        
        this.currentSlide = index;
    }
    
    private reinitializeCarousel() {
        // 캐러셀 이벤트 리스너 재설정
        this.setupCarousel();
    }
    
    private setupCarousel() {
        // 캐러셀 버튼 이벤트 리스너
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');
        
        if (prevBtn) {
            prevBtn.onclick = () => this.previousSlide();
        }
        if (nextBtn) {
            nextBtn.onclick = () => this.nextSlide();
        }
        
        // 인디케이터 이벤트 리스너
        this.setupCarouselIndicators();
    }
    
    private previousSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        if (slides.length === 0) return;
        
        this.currentSlide = (this.currentSlide - 1 + slides.length) % slides.length;
        this.goToSlide(this.currentSlide);
    }
    
    private nextSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        if (slides.length === 0) return;
        
        this.currentSlide = (this.currentSlide + 1) % slides.length;
        this.goToSlide(this.currentSlide);
    }
    
    private getCategoryBadge(category: string): string {
        const badges: { [key: string]: string } = {
            'event': 'HOT 🔥',
            'airdrop': 'NEW 🪂',
            'guide': 'GUIDE 📖',
            'notice': 'NOTICE 📢'
        };
        return badges[category] || 'NEW ✨';
    }
    
    private getCategoryLabel(category: string): string {
        const labels: { [key: string]: string } = {
            'event': '이벤트',
            'airdrop': '에어드랍',
            'guide': '가이드',
            'notice': '공지사항'
        };
        return labels[category] || category;
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
    
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
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
                } else {
                    console.warn('Share menu element not found');
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

// Hamburger menu functionality
function setupHamburgerMenu() {
    const hamburgerButton = document.querySelector('.hamburger-button') as HTMLButtonElement;
    const mainNav = document.getElementById('main-nav');
    
    if (!hamburgerButton || !mainNav) {
        console.warn('Hamburger menu elements not found');
        return;
    }
    
    // Toggle menu on hamburger click
    hamburgerButton.addEventListener('click', function() {
        const isActive = hamburgerButton.classList.contains('is-active');
        
        if (isActive) {
            // Close menu
            hamburgerButton.classList.remove('is-active');
            hamburgerButton.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            // Open menu
            hamburgerButton.classList.add('is-active');
            hamburgerButton.setAttribute('aria-expanded', 'true');
            mainNav.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const target = event.target as HTMLElement;
        if (!hamburgerButton.contains(target) && !mainNav.contains(target)) {
            if (hamburgerButton.classList.contains('is-active')) {
                hamburgerButton.classList.remove('is-active');
                hamburgerButton.setAttribute('aria-expanded', 'false');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && hamburgerButton.classList.contains('is-active')) {
            hamburgerButton.classList.remove('is-active');
            hamburgerButton.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && hamburgerButton.classList.contains('is-active')) {
            hamburgerButton.classList.remove('is-active');
            hamburgerButton.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking nav links
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerButton.classList.remove('is-active');
            mainNav.classList.remove('active');
            hamburgerButton.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });
}

// 중복된 캐러셀 코드 제거 - ModernArticlesManager 클래스 내부의 캐러셀 기능 사용
// function setupCarousel() 코드는 클래스 내부에 이미 구현되어 있음

// Global debug function for console testing
(window as any).debugPinnedArticles = async () => {
    const { supabase } = await import('./supabaseClient');
    
    console.log('=== MANUAL DEBUG: PINNED ARTICLES ===');
    
    if (!supabase) {
        console.error('Supabase is not initialized');
        return;
    }
    
    try {
        // Query 1: Get all articles
        const { data: allArticles, error: allError } = await supabase
            .from('articles')
            .select('id, title, is_pinned, is_published, created_at')
            .order('created_at', { ascending: false });
        
        if (allError) {
            console.error('Error fetching all articles:', allError);
            return;
        }
        
        console.log('Total articles in database:', allArticles?.length || 0);
        
        // Query 2: Get pinned articles
        const { data: pinnedOnly, error: pinnedError } = await supabase
            .from('articles')
            .select('*')
            .eq('is_pinned', true);
        
        if (pinnedError) {
            console.error('Error fetching pinned articles:', pinnedError);
            return;
        }
        
        console.log('Pinned articles (is_pinned=true):', pinnedOnly?.length || 0);
        
        if (pinnedOnly && pinnedOnly.length > 0) {
            console.table(pinnedOnly.map(a => ({
                id: a.id,
                title: a.title,
                is_pinned: a.is_pinned,
                is_published: a.is_published,
                created_at: a.created_at
            })));
        }
        
        // Query 3: Get published and pinned
        const { data: pinnedPublished, error: bothError } = await supabase
            .from('articles')
            .select('*')
            .eq('is_pinned', true)
            .eq('is_published', true);
        
        console.log('Pinned AND Published articles:', pinnedPublished?.length || 0);
        
        if (pinnedPublished && pinnedPublished.length > 0) {
            console.table(pinnedPublished.map(a => ({
                id: a.id,
                title: a.title,
                is_pinned: a.is_pinned,
                is_published: a.is_published
            })));
        }
        
        // Check for any RLS issues
        const { data: userData, error: userError } = await supabase.auth.getUser();
        console.log('Current user:', userData?.user ? 'Authenticated' : 'Anonymous');
        
        return {
            total: allArticles?.length || 0,
            pinned: pinnedOnly?.length || 0,
            pinnedAndPublished: pinnedPublished?.length || 0,
            user: userData?.user ? 'authenticated' : 'anonymous'
        };
    } catch (error) {
        console.error('Debug error:', error);
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    const manager = new ModernArticlesManager();
    // Export manager instance for debugging
    (window as any).articlesManager = manager;
    
    setupHamburgerMenu();
    // setupCarousel() 제거 - 클래스 내부에서 처리됨
    
    // Log initialization
    console.log('Articles page initialized. Debug with: window.debugPinnedArticles()');

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