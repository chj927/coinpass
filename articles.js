// Carousel functionality for pinned posts
document.addEventListener('DOMContentLoaded', function() {
    const carousel = window.carousel = {
        track: document.querySelector('.carousel-track'),
        items: document.querySelectorAll('.pinned-item'),
        prevBtn: document.querySelector('.carousel-btn.prev'),
        nextBtn: document.querySelector('.carousel-btn.next'),
        indicators: document.querySelectorAll('.indicator'),
        currentIndex: 0,
        itemsPerView: 3,
        totalItems: 6,
        autoSlideInterval: null,
        isPaused: false
    };

    // Calculate items per view based on screen size
    function updateItemsPerView() {
        if (window.innerWidth <= 768) {
            carousel.itemsPerView = 1;
        } else if (window.innerWidth <= 1024) {
            carousel.itemsPerView = 2;
        } else {
            carousel.itemsPerView = 3;
        }
        updateCarousel();
    }

    // Calculate max index
    function getMaxIndex() {
        return Math.max(0, Math.ceil(carousel.totalItems / carousel.itemsPerView) - 1);
    }

    // Update carousel position
    function updateCarousel() {
        if (!carousel.track) return;
        
        const itemWidth = 100 / carousel.itemsPerView;
        const gap = 20; // gap in pixels
        const translateX = -(carousel.currentIndex * 100);
        
        carousel.track.style.transform = `translateX(${translateX}%)`;
        
        // Update indicators
        const maxIndex = getMaxIndex();
        carousel.indicators.forEach((indicator, index) => {
            if (index <= maxIndex) {
                indicator.style.display = 'block';
                indicator.classList.toggle('active', index === carousel.currentIndex);
            } else {
                indicator.style.display = 'none';
            }
        });
        
        // Update button states
        if (carousel.prevBtn) {
            carousel.prevBtn.disabled = carousel.currentIndex === 0;
        }
        if (carousel.nextBtn) {
            carousel.nextBtn.disabled = carousel.currentIndex >= maxIndex;
        }
    }

    // Go to next slide
    function nextSlide() {
        const maxIndex = getMaxIndex();
        if (carousel.currentIndex < maxIndex) {
            carousel.currentIndex++;
        } else {
            carousel.currentIndex = 0; // Loop back to start
        }
        updateCarousel();
    }

    // Go to previous slide
    function prevSlide() {
        const maxIndex = getMaxIndex();
        if (carousel.currentIndex > 0) {
            carousel.currentIndex--;
        } else {
            carousel.currentIndex = maxIndex; // Loop to end
        }
        updateCarousel();
    }

    // Start auto slide
    function startAutoSlide() {
        if (carousel.autoSlideInterval) {
            clearInterval(carousel.autoSlideInterval);
        }
        carousel.autoSlideInterval = setInterval(() => {
            if (!carousel.isPaused) {
                nextSlide();
            }
        }, 3000); // 3 seconds
    }

    // Stop auto slide
    function stopAutoSlide() {
        if (carousel.autoSlideInterval) {
            clearInterval(carousel.autoSlideInterval);
            carousel.autoSlideInterval = null;
        }
    }

    // Event listeners
    if (carousel.prevBtn) {
        carousel.prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide(); // Restart timer
        });
    }

    if (carousel.nextBtn) {
        carousel.nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide(); // Restart timer
        });
    }

    // Indicator clicks
    carousel.indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            carousel.currentIndex = index;
            updateCarousel();
            stopAutoSlide();
            startAutoSlide(); // Restart timer
        });
    });

    // Pause on hover
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            carousel.isPaused = true;
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            carousel.isPaused = false;
        });
    }

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (carousel.track) {
        carousel.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        carousel.track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left
                nextSlide();
            } else {
                // Swiped right
                prevSlide();
            }
            stopAutoSlide();
            startAutoSlide(); // Restart timer
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        }
    });

    // Tab functionality (existing code)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tab = btn.dataset.tab;
            const cards = document.querySelectorAll('.content-card');
            
            cards.forEach(card => {
                if (tab === 'all') {
                    card.style.display = 'block';
                } else {
                    card.style.display = card.dataset.category === tab ? 'block' : 'none';
                }
            });
        });
    });

    // Pagination (existing code)
    document.querySelectorAll('.page-number').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.page-number').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Initialize
    window.addEventListener('resize', updateItemsPerView);
    updateItemsPerView();
    startAutoSlide();

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        stopAutoSlide();
    });
});