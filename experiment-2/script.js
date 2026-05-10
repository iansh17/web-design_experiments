// ────────────────────────────────────────────
// Dark Mode Toggle with localStorage
// ────────────────────────────────────────────
const themeToggle = document.querySelector('.theme-toggle');
const html = document.documentElement;

// Load saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
html.dataset.theme = savedTheme;
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const currentTheme = html.dataset.theme;
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.dataset.theme = newTheme;
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  
  // Announce to screen readers
  themeToggle.setAttribute('aria-label', 
    `Switch to ${newTheme === 'dark' ? 'light' : 'dark'} mode`
  );
});

// ────────────────────────────────────────────
// Typed Text Effect (Hero Section)
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

function typeText() {
  const currentRole = roles[roleIndex];
  
  if (isDeleting) {
    // Delete characters
    typedTextElement.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
  } else {
    // Type characters
    typedTextElement.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
  }
  
  // Determine next action
  if (!isDeleting && charIndex === currentRole.length) {
    // Finished typing, start deleting after pause
    isDeleting = true;
    setTimeout(typeText, pauseTime);
    return;
  }
  
  if (isDeleting && charIndex === 0) {
    // Finished deleting, move to next role
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
  }
  
  // Continue typing/deleting
  const speed = isDeleting ? deletingSpeed : typingSpeed;
  setTimeout(typeText, speed);
}

// Start the typing animation
typeText();

// ────────────────────────────────────────────
// Intersection Observer for Skill Bars
// ────────────────────────────────────────────
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      // Unobserve after animation triggers (performance)
      skillObserver.unobserve(entry.target);
    }
  });
}, { 
  threshold: 0.3,
  rootMargin: '0px 0px -100px 0px'
});

// Observe all skill cards
document.querySelectorAll('.skill-card').forEach(card => {
  skillObserver.observe(card);
});

// ────────────────────────────────────────────
// Mobile Navigation Toggle
// ────────────────────────────────────────────
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
  
  // Prevent body scroll when menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close mobile menu when clicking a nav link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

// ────────────────────────────────────────────
// Smooth Scroll with Offset for Fixed Navbar
// ────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    
    if (targetId === '#') return; // Skip if href is just "#"
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const navbarHeight = document.querySelector('.navbar').offsetHeight;
      const targetPosition = targetElement.offsetTop - navbarHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ────────────────────────────────────────────
// Navbar Background on Scroll
// ────────────────────────────────────────────
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  // Add shadow when scrolled down
  if (currentScroll > 100) {
    navbar.style.boxShadow = 'var(--shadow)';
  } else {
    navbar.style.boxShadow = 'none';
  }
  
  lastScroll = currentScroll;
});

// ────────────────────────────────────────────
// Project Cards Keyboard Accessibility
// ────────────────────────────────────────────
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Simulate click on first link in card
      const firstLink = card.querySelector('.card-links a');
      if (firstLink) {
        firstLink.click();
      }
    }
  });
});

// ────────────────────────────────────────────
// Lazy Loading Images (Performance)
// ────────────────────────────────────────────
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
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
// Console Easter Egg for Recruiters 😉
// ────────────────────────────────────────────
console.log('%c👋 Hey there, fellow developer!', 
  'font-size: 20px; font-weight: bold; color: #1a56a5;');
console.log('%c🚀 Ansh Dwivedi | AI Engineer & Full-Stack Developer', 
  'font-size: 14px; color: #d97706;');
console.log('%c💼 Open to internships and collaborations!', 
  'font-size: 12px; color: #64748b;');
console.log('%c🔗 https://linkedin.com/in/iansh17', 
  'font-size: 12px; color: #1a56a5;');