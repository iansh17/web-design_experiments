// ────────────────────────────────────────────────────────────────
// Experiment 4: SEO & Accessibility Enhanced Script
// ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // ────────────────────────────────────────────
  // 1. Dark Mode Toggle with Accessibility
  // ────────────────────────────────────────────
  const themeToggle = document.querySelector('.theme-toggle');
  const html = document.documentElement;

  // Load saved theme or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  html.dataset.theme = savedTheme;
  
  // Set initial aria-pressed state
  themeToggle.setAttribute('aria-pressed', savedTheme === 'dark');
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  themeToggle.title = savedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  themeToggle.addEventListener('click', () => {
    const currentTheme = html.dataset.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    
    // Update button state for screen readers
    themeToggle.setAttribute('aria-pressed', newTheme === 'dark');
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    themeToggle.title = newTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    
    // Announce to screen readers
    announceToScreenReader(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`);
  });

  // ────────────────────────────────────────────
  // 2. Screen Reader Announcer (Live Region)
  // ────────────────────────────────────────────
  function announceToScreenReader(message) {
    // Create or get existing live region
    let liveRegion = document.getElementById('sr-live-region');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'sr-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.classList.add('visually-hidden');
      document.body.appendChild(liveRegion);
    }
    
    // Clear and set new message
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
  }

  // ────────────────────────────────────────────
  // 3. Typed Text Effect with Accessibility
  // ────────────────────────────────────────────
  const roles = [
    'Ansh Dwivedi', 
    'AI Engineer', 
    'Agentic Systems Developer', 
    'Full-Stack Developer',
    'GenAI Enthusiast',
    'Python Developer'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typedTextElement = document.querySelector('.typed-text');
  const typingSpeed = 110;
  const deletingSpeed = 60;
  const pauseTime = 1800;

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function typeText() {
    // If user prefers reduced motion, just show the name
    if (prefersReducedMotion) {
      typedTextElement.textContent = 'Ansh Dwivedi';
      return;
    }

    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      typedTextElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typedTextElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }
    
    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      setTimeout(typeText, pauseTime);
      return;
    }
    
    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
    
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    setTimeout(typeText, speed);
  }

  typeText();

  // ────────────────────────────────────────────
  // 4. Intersection Observer for Skill Bars
  // ────────────────────────────────────────────
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        
        // Announce skill reveal to screen readers
        const skillName = entry.target.querySelector('.skill-name').textContent;
        const percentage = entry.target.querySelector('[aria-valuenow]').getAttribute('aria-valuenow');
        announceToScreenReader(`${skillName}: ${percentage} percent proficiency`);
        
        skillObserver.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px'
  });

  document.querySelectorAll('.skill-card').forEach(card => {
    skillObserver.observe(card);
  });

  // ────────────────────────────────────────────
  // 5. Mobile Navigation Toggle (Accessible)
  // ────────────────────────────────────────────
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    
    // Trap focus in menu when open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus first link in menu
      const firstLink = navMenu.querySelector('a');
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 100);
      }
    } else {
      document.body.style.overflow = '';
    }
  });

  // Close mobile menu when clicking a nav link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu with Escape key (accessibility)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      navToggle.focus(); // Return focus to toggle button
    }
  });

  // ────────────────────────────────────────────
  // 6. Smooth Scroll with Focus Management
  // ────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        const navbarHeight = document.querySelector('.navbar').offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - navbarHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
        
        // Move focus to target for keyboard users (accessibility)
        // Make target focusable if it isn't already
        if (!targetElement.hasAttribute('tabindex')) {
          targetElement.setAttribute('tabindex', '-1');
        }
        targetElement.focus({ preventScroll: true });
      }
    });
  });

  // ────────────────────────────────────────────
  // 7. Accessible Form Validation
  // ────────────────────────────────────────────
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    const nameField = document.getElementById('userName');
    const emailField = document.getElementById('userEmail');
    const messageField = document.getElementById('userMessage');
    
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const msgError = document.getElementById('msgError');

    // Real-time validation on blur
    nameField.addEventListener('blur', () => validateField(nameField, nameError, 'Please enter your name'));
    emailField.addEventListener('blur', () => validateEmail(emailField, emailError));
    messageField.addEventListener('blur', () => validateField(messageField, msgError, 'Please enter a message'));

    // Form submission
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      
      // Validate all fields
      isValid = validateField(nameField, nameError, 'Please enter your name') && isValid;
      isValid = validateEmail(emailField, emailError) && isValid;
      isValid = validateField(messageField, msgError, 'Please enter a message') && isValid;
      
      if (isValid) {
        // Show success message
        announceToScreenReader('Form submitted successfully');
        
        // Simulate form submission
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
          submitBtn.textContent = 'Message Sent! ✓';
          submitBtn.classList.add('btn-success');
          contactForm.reset();
          
          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-success');
          }, 3000);
        }, 1500);
      } else {
        // Focus on first error
        const firstError = contactForm.querySelector('[aria-invalid="true"]');
        if (firstError) {
          firstError.focus();
        }
        announceToScreenReader('Form has errors. Please correct them and try again.');
      }
    });
  }

  // Validation helper functions
  function validateField(field, errorElement, errorMessage) {
    const value = field.value.trim();
    
    if (value === '') {
      showError(field, errorElement, errorMessage);
      return false;
    } else {
      clearError(field, errorElement);
      return true;
    }
  }

  function validateEmail(field, errorElement) {
    const value = field.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (value === '') {
      showError(field, errorElement, 'Please enter your email address');
      return false;
    } else if (!emailRegex.test(value)) {
      showError(field, errorElement, 'Please enter a valid email address');
      return false;
    } else {
      clearError(field, errorElement);
      return true;
    }
  }

  function showError(field, errorElement, message) {
    field.setAttribute('aria-invalid', 'true');
    errorElement.textContent = message;
    field.style.borderColor = '#d32f2f';
  }

  function clearError(field, errorElement) {
    field.setAttribute('aria-invalid', 'false');
    errorElement.textContent = '';
    field.style.borderColor = '';
  }

  // ────────────────────────────────────────────
  // 8. Project Card Keyboard Accessibility
  // ────────────────────────────────────────────
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const firstLink = card.querySelector('.card-links a');
        if (firstLink) {
          firstLink.click();
        }
      }
    });
  });

  // ────────────────────────────────────────────
  // 9. Navbar Background on Scroll
  // ────────────────────────────────────────────
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
      navbar.style.boxShadow = 'var(--shadow)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });

  // ────────────────────────────────────────────
  // 10. Lazy Loading Images (Performance)
  // ────────────────────────────────────────────
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });
    
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ────────────────────────────────────────────
  // 11. Console Easter Egg for Recruiters 😉
  // ────────────────────────────────────────────
  console.log('%c👋 Hey there, fellow developer!', 
    'font-size: 20px; font-weight: bold; color: #1a56a5;');
  console.log('%c🚀 Ansh Dwivedi | AI Engineer & Full-Stack Developer', 
    'font-size: 14px; color: #d97706;');
  console.log('%c💼 Open to internships and collaborations!', 
    'font-size: 12px; color: #64748b;');
  console.log('%c🔗 https://linkedin.com/in/iansh17', 
    'font-size: 12px; color: #1a56a5;');
  console.log('%c♿ This site follows WCAG 2.1 Level AA standards', 
    'font-size: 11px; color: #10b981;');

});