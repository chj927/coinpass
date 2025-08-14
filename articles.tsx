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

class ArticlesManager {
  private articles: Article[] = [];
  private currentCategory: string = 'all';
  private searchQuery: string = '';

  constructor() {
    this.init();
  }

  private async init() {
    await this.loadArticles();
    this.setupEventListeners();
    this.setupSearch();
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
      this.renderArticles();
    } catch (error) {
      console.error('Error loading articles:', error);
      this.renderError();
    }
  }

  private setupEventListeners() {
    // 카테고리 필터 버튼들
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const category = target.dataset.category || 'all';
        
        // 활성 버튼 스타일 업데이트
        filterButtons.forEach(b => b.classList.remove('active'));
        target.classList.add('active');
        
        this.currentCategory = category;
        this.renderArticles();
      });
    });
  }

  private setupSearch() {
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
        this.renderArticles();
      });
    }
  }

  private filterArticles(): Article[] {
    return this.articles.filter(article => {
      // 카테고리 필터
      if (this.currentCategory !== 'all' && article.category !== this.currentCategory) {
        return false;
      }
      
      // 검색 필터
      if (this.searchQuery) {
        const searchableText = `${article.title} ${article.excerpt || ''}`.toLowerCase();
        if (!searchableText.includes(this.searchQuery)) {
          return false;
        }
      }
      
      return true;
    });
  }

  private renderArticles() {
    const container = document.querySelector('.articles-grid');
    if (!container) return;

    const filteredArticles = this.filterArticles();
    
    if (filteredArticles.length === 0) {
      container.innerHTML = `
        <div class="no-articles">
          <p>해당하는 콘텐츠가 없습니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredArticles.map(article => this.renderArticleCard(article)).join('');
    
    // 카드 클릭 이벤트 설정
    this.setupCardClickEvents();
  }

  private renderArticleCard(article: Article): string {
    const categoryLabels = {
      notice: '공지사항',
      guide: '가이드',
      event: '이벤트',
      airdrop: '에어드랍'
    };

    const categoryColors = {
      notice: '#FF6B6B',
      guide: '#4ECDC4',
      event: '#FFD93D',
      airdrop: '#95E1D3'
    };

    const formattedDate = new Date(article.created_at).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <article class="article-card" data-id="${article.id}" data-type="${article.content_type}" data-url="${article.external_url || ''}">
        ${article.is_pinned ? '<div class="pinned-badge">📌 고정</div>' : ''}
        <div class="article-image">
          <img src="${article.image_url || 'https://via.placeholder.com/400x250'}" alt="${article.title}" loading="lazy">
          <div class="category-badge" style="background: ${categoryColors[article.category]}">
            ${categoryLabels[article.category]}
          </div>
        </div>
        <div class="article-content">
          <h3 class="article-title">${article.title}</h3>
          <p class="article-excerpt">${article.excerpt || ''}</p>
          <div class="article-meta">
            <span class="article-author">${article.author}</span>
            <span class="article-date">${formattedDate}</span>
            <span class="article-views">👁 ${article.view_count}</span>
          </div>
          ${article.content_type === 'external' ? '<div class="external-link-indicator">🔗 외부 링크</div>' : ''}
        </div>
      </article>
    `;
  }

  private setupCardClickEvents() {
    const cards = document.querySelectorAll('.article-card');
    cards.forEach(card => {
      card.addEventListener('click', async (e) => {
        const target = e.currentTarget as HTMLElement;
        const articleId = target.dataset.id;
        const contentType = target.dataset.type;
        const externalUrl = target.dataset.url;

        if (!articleId) return;

        // 조회수 증가
        await this.incrementViewCount(articleId);

        if (contentType === 'external' && externalUrl) {
          // 외부 링크로 이동
          window.open(externalUrl, '_blank');
        } else {
          // 내부 콘텐츠 모달로 표시
          this.showArticleModal(articleId);
        }
      });
    });
  }

  private async incrementViewCount(articleId: string) {
    try {
      await supabase.rpc('increment_article_view', { article_id: articleId });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  private async showArticleModal(articleId: string) {
    const article = this.articles.find(a => a.id === articleId);
    if (!article || !article.content) return;

    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <div class="modal-header">
          <h2>${article.title}</h2>
          <div class="modal-meta">
            <span>${article.author}</span>
            <span>${new Date(article.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
        <div class="modal-body">
          ${article.content}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // 닫기 버튼 이벤트
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    const closeModal = () => {
      modal.remove();
      document.body.style.overflow = '';
    };

    closeBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);

    // ESC 키로 닫기
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  private renderError() {
    const container = document.querySelector('.articles-grid');
    if (!container) return;
    
    container.innerHTML = `
      <div class="error-message">
        <p>콘텐츠를 불러오는 중 오류가 발생했습니다.</p>
        <button onclick="location.reload()">다시 시도</button>
      </div>
    `;
  }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  new ArticlesManager();
});