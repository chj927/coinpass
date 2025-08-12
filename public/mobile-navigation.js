/**
 * CoinPass Mobile Navigation System
 * Enhanced mobile navigation with touch optimization
 */

class MobileNavigation {
  constructor() {
    this.menuToggle = null;
    this.menuDrawer = null;
    this.menuOverlay = null;
    this.menuClose = null;
    this.isOpen = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupNavigation());
    } else {
      this.setupNavigation();
    }
  }
  
  setupNavigation() {
    // Get elements
    this.menuToggle = document.querySelector('.mobile-menu-toggle');
    this.menuDrawer = document.querySelector('.mobile-menu-drawer');
    this.menuOverlay = document.querySelector('.mobile-menu-overlay');
    this.menuClose = document.querySelector('.mobile-menu-close');
    
    if (!this.menuToggle || !this.menuDrawer || !this.menuOverlay) {
      console.warn('Mobile navigation elements not found');
      return;
    }
    
    // Add event listeners
    this.menuToggle.addEventListener('click', () => this.toggleMenu());
    this.menuOverlay.addEventListener('click', () => this.closeMenu());
    
    if (this.menuClose) {
      this.menuClose.addEventListener('click', () => this.closeMenu());
    }
    
    // Add keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });
    
    // Add swipe gestures
    this.initSwipeGestures();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isOpen) {
        this.closeMenu();
      }
    });
    
    // Set active page
    this.setActivePage();
    
    // Add scroll detection for header
    this.initScrollDetection();
  }
  
  toggleMenu() {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }
  
  openMenu() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.menuToggle.classList.add('active');
    this.menuToggle.setAttribute('aria-expanded', 'true');
    this.menuDrawer.classList.add('active');
    this.menuOverlay.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus management
    this.menuDrawer.focus();
    
    // Trap focus
    this.trapFocus();
    
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }
  
  closeMenu() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.menuToggle.classList.remove('active');
    this.menuToggle.setAttribute('aria-expanded', 'false');
    this.menuDrawer.classList.remove('active');
    this.menuOverlay.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to toggle button
    this.menuToggle.focus();
    
    // Release focus trap
    this.releaseFocus();
  }
  
  initSwipeGestures() {
    // Swipe on drawer
    this.menuDrawer.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    this.menuDrawer.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
    
    // Swipe to open from edge
    document.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      if (touch.screenX > window.innerWidth - 20 && !this.isOpen) {
        this.touchStartX = touch.screenX;
        this.edgeSwipe = true;
      }
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      if (this.edgeSwipe) {
        this.touchEndX = e.changedTouches[0].screenX;
        if (this.touchStartX - this.touchEndX > 50) {
          this.openMenu();
        }
        this.edgeSwipe = false;
      }
    }, { passive: true });
  }
  
  handleSwipe() {
    const swipeThreshold = 50;
    
    // Swipe right to close
    if (this.touchEndX - this.touchStartX > swipeThreshold && this.isOpen) {
      this.closeMenu();
    }
  }
  
  trapFocus() {
    const focusableElements = this.menuDrawer.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    this.focusTrapHandler = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    this.menuDrawer.addEventListener('keydown', this.focusTrapHandler);
  }
  
  releaseFocus() {
    if (this.focusTrapHandler) {
      this.menuDrawer.removeEventListener('keydown', this.focusTrapHandler);
      this.focusTrapHandler = null;
    }
  }
  
  setActivePage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (href === '/' && currentPath === '/index.html')) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }
  
  initScrollDetection() {
    const header = document.querySelector('.unified-header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      // Hide/show header on scroll
      if (currentScroll > lastScroll && currentScroll > 100) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }
      
      lastScroll = currentScroll;
    }, { passive: true });
  }
}

// Initialize mobile navigation
const mobileNav = new MobileNavigation();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileNavigation;
}