// Hero Title Typing Animation - Standalone Implementation
(function() {
    'use strict';
    
    const sentences = [
        '공식 제휴로 최대 수수료 혜택 제공!',
        '최고의 혜택을 누구나 무료로!',
        '한번 등록하고 평생 혜택받기!'
    ];
    
    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let charIndex = 0;
    
    function typeWriter() {
        const heroTitle = document.getElementById('hero-title');
        if (!heroTitle) return;
        
        const currentSentence = sentences[currentIndex];
        
        if (!isDeleting) {
            // Typing
            currentText = currentSentence.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === currentSentence.length) {
                // Finished typing, wait then start deleting
                isDeleting = true;
                setTimeout(typeWriter, 2000); // Wait 2 seconds before deleting
                return;
            }
        } else {
            // Deleting
            currentText = currentSentence.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 0) {
                // Finished deleting, move to next sentence
                isDeleting = false;
                currentIndex = (currentIndex + 1) % sentences.length;
                setTimeout(typeWriter, 500); // Small pause before typing next
                return;
            }
        }
        
        // Update the text
        heroTitle.textContent = currentText;
        
        // Calculate typing speed
        const typingSpeed = isDeleting ? 50 : 100;
        setTimeout(typeWriter, typingSpeed);
    }
    
    // Start animation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Small delay to ensure everything is loaded
            setTimeout(typeWriter, 500);
        });
    } else {
        // DOM is already loaded
        setTimeout(typeWriter, 500);
    }
})();