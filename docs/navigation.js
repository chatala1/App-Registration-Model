/**
 * Enhanced Navigation JavaScript
 * Handles mobile menu, smooth scrolling, and quick actions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const headerNav = document.querySelector('.header-nav');
    
    if (mobileMenuToggle && headerNav) {
        mobileMenuToggle.addEventListener('click', function() {
            headerNav.classList.toggle('mobile-open');
            
            // Update icon
            const icon = mobileMenuToggle.querySelector('i');
            if (headerNav.classList.contains('mobile-open')) {
                icon.className = 'bi bi-x';
                mobileMenuToggle.setAttribute('aria-label', 'Close navigation menu');
            } else {
                icon.className = 'bi bi-list';
                mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
            }
        });
        
        // Close mobile menu when clicking nav links
        const navLinks = headerNav.querySelectorAll('.nav-link:not(.mobile-menu-toggle)');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                headerNav.classList.remove('mobile-open');
                const icon = mobileMenuToggle.querySelector('i');
                icon.className = 'bi bi-list';
                mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!headerNav.contains(event.target) && headerNav.classList.contains('mobile-open')) {
                headerNav.classList.remove('mobile-open');
                const icon = mobileMenuToggle.querySelector('i');
                icon.className = 'bi bi-list';
                mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
            }
        });
    }
    
    // Quick upload button functionality
    const quickUpload = document.getElementById('quick-upload');
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    if (quickUpload && fileInput) {
        quickUpload.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    if (quickUpload && uploadArea) {
        quickUpload.addEventListener('click', function() {
            // Smooth scroll to upload section
            uploadArea.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Add a subtle highlight effect
            uploadArea.style.transform = 'scale(1.02)';
            uploadArea.style.transition = 'transform 0.3s ease';
            
            setTimeout(() => {
                uploadArea.style.transform = 'scale(1)';
            }, 300);
        });
    }
    
    // Smooth scrolling for anchor links
    const scrollLinks = document.querySelectorAll('a[href^="#"], .scroll-link');
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Secondary navigation smooth scrolling
    const secondaryNavLinks = document.querySelectorAll('.secondary-nav-link');
    secondaryNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    // Add active state to clicked link
                    secondaryNavLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Smooth scroll to target
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Add highlight effect to target
                    target.style.borderColor = '#58a6ff';
                    target.style.transform = 'scale(1.02)';
                    target.style.transition = 'all 0.3s ease';
                    
                    setTimeout(() => {
                        target.style.borderColor = '';
                        target.style.transform = '';
                    }, 1000);
                }
            }
        });
    });
    
    // Update active navigation based on current page
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        link.classList.remove('active');
        
        if (currentPath === linkPath || 
            (currentPath.endsWith('/') && linkPath.endsWith('index.html')) ||
            (currentPath.endsWith('index.html') && linkPath.endsWith('/'))) {
            link.classList.add('active');
        }
    });
    
    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Escape key closes mobile menu
        if (e.key === 'Escape' && headerNav && headerNav.classList.contains('mobile-open')) {
            headerNav.classList.remove('mobile-open');
            const icon = mobileMenuToggle.querySelector('i');
            icon.className = 'bi bi-list';
            mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
        }
    });
    
    // Intersection Observer for breadcrumb updates (if needed for future expansion)
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Could be used to update breadcrumbs or active states
                    // based on scroll position in the future
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-20% 0px -70% 0px'
        });
        
        // Observe main sections
        const sections = document.querySelectorAll('section[id], .card[id]');
        sections.forEach(section => observer.observe(section));
    }
});