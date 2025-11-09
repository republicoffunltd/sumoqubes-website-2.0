// Language Modal Functions
function openLanguageModal(event) {
  event.preventDefault();
  const modal = document.getElementById('languageModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

function closeLanguageModal() {
  const modal = document.getElementById('languageModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function changeLanguage(lang) {
  console.log('Language changed to:', lang);
  // Store language preference
  localStorage.setItem('selectedLanguage', lang);
  closeLanguageModal();
  // Here you would implement actual language switching
  alert(`Language changed to: ${lang.toUpperCase()}`);
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const hamburger = document.querySelector('.hamburger-menu');
  const mobileMenu = document.querySelector('.mobile-nav-menu');
  const overlay = document.querySelector('.mobile-nav-overlay');
  
  if (hamburger && mobileMenu && overlay) {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    overlay.classList.toggle('active');
  }
}

// Smooth Scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
  // Smooth scroll for navigation links
  const smoothScrollLinks = document.querySelectorAll('a.smooth-scroll, .mobile-nav-menu a[href^="#"]');
  
  smoothScrollLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Only process internal links
      if (href.startsWith('#')) {
        e.preventDefault();
        
        // Close mobile menu if open
        const mobileMenu = document.querySelector('.mobile-nav-menu');
        const overlay = document.querySelector('.mobile-nav-overlay');
        const hamburger = document.querySelector('.hamburger-menu');
        
        if (mobileMenu && mobileMenu.classList.contains('active')) {
          toggleMobileMenu();
        }
        
        // Get target element
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Calculate offset for fixed navbar
          const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 65;
          const targetPosition = targetElement.offsetTop - navbarHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // Close modal when clicking outside
  window.onclick = function(event) {
    const modal = document.getElementById('languageModal');
    if (event.target === modal) {
      closeLanguageModal();
    }
  };
  
  // Scroll to top button functionality
  const scrollToTopBtn = document.querySelector('.scroll-to-top');
  
  if (scrollToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    });
  }
  
  // FAQ Accordion functionality
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const faqItem = this.parentElement;
      const wasActive = faqItem.classList.contains('active');
      
      // Close all other FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        const answer = item.querySelector('.faq-answer');
        if (answer) {
          answer.style.maxHeight = null;
        }
      });
      
      // Toggle current item
      if (!wasActive) {
        faqItem.classList.add('active');
        const answer = this.nextElementSibling;
        if (answer) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      }
    });
  });
  
  // Load saved language preference
  const savedLanguage = localStorage.getItem('selectedLanguage');
  if (savedLanguage) {
    console.log('Saved language:', savedLanguage);
  }
});

// Back to top smooth scroll
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Export functions for use in HTML
window.openLanguageModal = openLanguageModal;
window.closeLanguageModal = closeLanguageModal;
window.changeLanguage = changeLanguage;
window.toggleMobileMenu = toggleMobileMenu;
window.scrollToTop = scrollToTop;