// ===== JANE NDILA PSYCHOLOGY WEBSITE - MAIN JAVASCRIPT =====

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        if (navMenu) {
            navMenu.classList.toggle('active');
        }
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (hamburger) {
            hamburger.classList.remove('active');
        }
        if (navMenu) {
            navMenu.classList.remove('active');
        }
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            // Calculate offset for fixed header
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});

// Update active navigation link based on current page
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // Handle index.html and empty paths
        if (currentPage === 'index.html' || currentPage === '') {
            if (link.getAttribute('href') === 'index.html' || link.getAttribute('href') === './' || link.getAttribute('href') === '/') {
                link.classList.add('active');
            }
        } 
        // Handle other pages
        else if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Testimonials slider functionality
function initTestimonialsSlider() {
    const testimonials = document.querySelectorAll('.testimonial-item');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    const dotsContainer = document.querySelector('.testimonial-dots');
    
    if (testimonials.length === 0) return;
    
    let currentTestimonial = 0;
    
    // Create dots if container exists
    if (dotsContainer) {
        testimonials.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('testimonial-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => showTestimonial(index));
            dotsContainer.appendChild(dot);
        });
    }
    
    function showTestimonial(index) {
        // Hide all testimonials
        testimonials.forEach(testimonial => {
            testimonial.style.display = 'none';
            testimonial.classList.remove('active');
        });
        
        // Remove active class from all dots
        if (dotsContainer) {
            document.querySelectorAll('.testimonial-dot').forEach(dot => {
                dot.classList.remove('active');
            });
        }
        
        // Show current testimonial
        testimonials[index].style.display = 'block';
        testimonials[index].classList.add('active');
        
        // Activate current dot
        if (dotsContainer && dotsContainer.children[index]) {
            dotsContainer.children[index].classList.add('active');
        }
        
        currentTestimonial = index;
    }
    
    // Navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
            showTestimonial(currentTestimonial);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(currentTestimonial);
        });
    }
    
    // Auto-rotate testimonials every 7 seconds
    let testimonialInterval = setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 7000);
    
    // Pause auto-rotation on hover
    const testimonialContainer = document.querySelector('.testimonials-container');
    if (testimonialContainer) {
        testimonialContainer.addEventListener('mouseenter', () => {
            clearInterval(testimonialInterval);
        });
        
        testimonialContainer.addEventListener('mouseleave', () => {
            testimonialInterval = setInterval(() => {
                currentTestimonial = (currentTestimonial + 1) % testimonials.length;
                showTestimonial(currentTestimonial);
            }, 7000);
        });
    }
    
    // Initialize first testimonial
    showTestimonial(0);
}

// Contact Form Specific Functions
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (!validateContactForm(data)) {
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                showNotification('Thank you for your message! I will get back to you within 24 hours.', 'success');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Track form submission (optional)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'contact_form_submit', {
                        'event_category': 'Contact',
                        'event_label': 'Contact Form Submission'
                    });
                }
            }, 2000);
        });
    }
}

function validateContactForm(data) {
    // Basic validation
    if (!data.name || !data.name.trim()) {
        showNotification('Please enter your full name.', 'error');
        return false;
    }
    
    if (!data.email || !data.email.trim()) {
        showNotification('Please enter your email address.', 'error');
        return false;
    }
    
    if (!isValidEmail(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }
    
    if (!data.subject) {
        showNotification('Please select a subject for your message.', 'error');
        return false;
    }
    
    if (!data.message || !data.message.trim()) {
        showNotification('Please enter your message.', 'error');
        return false;
    }
    
    if (!data.consent) {
        showNotification('Please acknowledge the consent statement.', 'error');
        return false;
    }
    
    return true;
}

// Booking Form Specific Functions
function initBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        // Set minimum date to today
        const dateInput = document.getElementById('preferredDate');
        if (dateInput) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            dateInput.min = `${yyyy}-${mm}-${dd}`;
        }

        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (!validateBookingForm(data)) {
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<svg viewBox="0 0 24 24" class="btn-icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg> Processing...';
            submitBtn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                showNotification('Booking request submitted successfully! You will receive a confirmation email within 2 hours.', 'success');
                bookingForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Track booking submission
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'booking_form_submit', {
                        'event_category': 'Booking',
                        'event_label': 'Booking Form Submission'
                    });
                }
            }, 2000);
        });

        // Service type change handler
        const serviceTypeSelect = document.getElementById('serviceType');
        if (serviceTypeSelect) {
            serviceTypeSelect.addEventListener('change', function() {
                updateSessionInfo(this.value);
            });
        }
    }
}

function validateBookingForm(data) {
    // Basic validation
    const requiredFields = ['fullName', 'email', 'phone', 'serviceType', 'sessionType', 'preferredDate', 'preferredTime', 'concerns'];
    
    for (const field of requiredFields) {
        if (!data[field] || !data[field].toString().trim()) {
            showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error');
            return false;
        }
    }
    
    if (!isValidEmail(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }
    
    if (!data.privacyPolicy || !data.cancellationPolicy) {
        showNotification('Please agree to the privacy and cancellation policies.', 'error');
        return false;
    }
    
    // Date validation
    const selectedDate = new Date(data.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showNotification('Please select a future date for your session.', 'error');
        return false;
    }
    
    return true;
}

function updateSessionInfo(serviceType) {
    const sessionInfo = document.querySelector('.session-info');
    if (!sessionInfo) return;
    
    const durationSpan = sessionInfo.querySelector('.info-item:nth-child(1) span');
    const priceSpan = sessionInfo.querySelector('.info-item:nth-child(2) span');
    
    const sessionData = {
        'individual': { duration: '50-60 minutes', price: 'KSh 3,500' },
        'couples': { duration: '75-90 minutes', price: 'KSh 5,000' },
        'family': { duration: '60-90 minutes', price: 'KSh 4,500' },
        'child': { duration: '45-60 minutes', price: 'KSh 3,500' },
        'trauma': { duration: '60-75 minutes', price: 'KSh 4,000' },
        'consultation': { duration: '30 minutes', price: 'FREE' }
    };
    
    const data = sessionData[serviceType] || { duration: '50-90 minutes', price: 'KSh 3,500 - 5,000' };
    
    if (durationSpan) durationSpan.textContent = data.duration;
    if (priceSpan) priceSpan.textContent = data.price;
}

// FAQ Accordion Functionality
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', () => {
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });
}

// Email validation helper
function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 15px;
                max-width: 400px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                animation: slideIn 0.3s ease;
                font-family: var(--body-font);
            }
            .notification-success { background: var(--leafy-green); }
            .notification-error { background: #e74c3c; }
            .notification-info { background: #3498db; }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    const autoRemove = setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            if (notification.parentNode) {
                notification.remove();
            }
        });
    }
}

// Service card animations
function initServiceAnimations() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    if (serviceCards.length === 0) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    serviceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Back to top button
function initBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '↑';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.style.display = 'none';
    
    // Add styles if not already added
    if (!document.querySelector('#back-to-top-styles')) {
        const styles = document.createElement('style');
        styles.id = 'back-to-top-styles';
        styles.textContent = `
            .back-to-top {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: var(--gold);
                color: var(--dark);
                border: none;
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                font-family: inherit;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .back-to-top.visible {
                opacity: 1;
                visibility: visible;
            }
            .back-to-top:hover {
                background: var(--leafy-green);
                color: white;
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(backToTop);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.style.display = 'flex';
            backToTop.classList.add('visible');
        } else {
            backToTop.style.display = 'none';
            backToTop.classList.remove('visible');
        }
    });
    
    // Scroll to top functionality
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Image lazy loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Page load animations
function initPageAnimations() {
    const elementsToAnimate = document.querySelectorAll('.hero-text, .section-title, .service-card, .qualification-card');
    
    elementsToAnimate.forEach((element, index) => {
        if (element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}

// Phone number formatting (optional)
function formatPhoneNumber(phone) {
    if (!phone) return '';
    // Basic Kenyan phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 9 && cleaned.startsWith('7')) {
        return `+254 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }
    return phone;
}

// Privacy Page Specific Functions
function initPrivacyPage() {
    // Add back to top functionality for long privacy page
    const privacyContent = document.querySelector('.privacy-content');
    if (privacyContent && privacyContent.scrollHeight > window.innerHeight * 2) {
        const backToTop = document.createElement('button');
        backToTop.className = 'privacy-back-to-top';
        backToTop.innerHTML = `
            <svg viewBox="0 0 24 24">
                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
            </svg>
        `;
        backToTop.setAttribute('aria-label', 'Back to top');
        backToTop.style.display = 'none';
        
        document.body.appendChild(backToTop);
        
        // Show/hide back to top button
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.style.display = 'flex';
            } else {
                backToTop.style.display = 'none';
            }
        });
        
        // Scroll to top functionality
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Add smooth scrolling for anchor links within the page
    document.querySelectorAll('.privacy-content a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Print functionality
    const printButton = document.createElement('button');
    printButton.className = 'btn btn-secondary';
    printButton.innerHTML = `
        <svg viewBox="0 0 24 24" class="btn-icon">
            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
        </svg>
        Print Policy
    `;
    printButton.style.marginTop = '2rem';
    printButton.addEventListener('click', () => window.print());
    
    const privacyHero = document.querySelector('.privacy-hero-content');
    if (privacyHero) {
        privacyHero.appendChild(printButton);
    }
}

// Initialize contact page specific features
function initContactPage() {
    initContactForm();
    initFAQAccordion();
    
    // Format phone numbers on page
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        const phone = link.getAttribute('href').replace('tel:', '');
        if (phone) {
            link.textContent = formatPhoneNumber(phone);
        }
    });
}

// Initialize booking page specific features
function initBookingPage() {
    initBookingForm();
    
    // Pre-fill service type from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    if (serviceParam) {
        const serviceSelect = document.getElementById('serviceType');
        if (serviceSelect) {
            serviceSelect.value = serviceParam;
            updateSessionInfo(serviceParam);
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Jane Ndila Psychology Website initialized');
    
    // Set active navigation link
    setActiveNavLink();
    
    // Initialize all components
    initTestimonialsSlider();
    initServiceAnimations();
    initBackToTop();
    initLazyLoading();
    initPageAnimations();
    
    // Initialize specific page features
    if (window.location.pathname.includes('contact.html') || 
        document.querySelector('.contact-hero')) {
        initContactPage();
    }
    
    if (window.location.pathname.includes('book.html') || 
        document.querySelector('.booking-hero')) {
        initBookingPage();
    }
    
    if (window.location.pathname.includes('privacy.html') || 
        document.querySelector('.privacy-hero')) {
        initPrivacyPage();
    }
    
    // Add loading class to body for initial animations
    document.body.classList.add('loaded');
});

// Error boundary for better debugging
window.addEventListener('error', (e) => {
    console.error('Website error:', e.error);
});

// Performance monitoring
window.addEventListener('load', () => {
    // Log page load time
    if (window.performance && performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
    }
});

// Handle page visibility changes (for tab switching)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page is now hidden');
    } else {
        console.log('Page is now visible');
    }
});

// Handle beforeunload for form protection
window.addEventListener('beforeunload', function (e) {
    // Check if any forms have been modified
    const forms = document.querySelectorAll('form');
    let hasUnsavedChanges = false;
    
    forms.forEach(form => {
        if (form.classList.contains('modified')) {
            hasUnsavedChanges = true;
        }
    });
    
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});

// Mark forms as modified when changed
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('change', function() {
        this.classList.add('modified');
    });
    
    form.addEventListener('submit', function() {
        this.classList.remove('modified');
    });
});

// Export functions for potential module use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setActiveNavLink,
        initTestimonialsSlider,
        initContactForm,
        initBookingForm,
        showNotification,
        initServiceAnimations,
        initPrivacyPage
    };
}

