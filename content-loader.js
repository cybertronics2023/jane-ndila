// content-loader.js
// Handles fetching content from Supabase and updating the DOM

// Configuration
const SUPABASE_URL = 'https://avezwecbtvtkbtctsbzh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZXp3ZWNidHZ0a2J0Y3RzYnpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTk1MDEsImV4cCI6MjA4NDM5NTUwMX0.qa-Tnzl37ts25QAtQ_ek6BljCo-ndZjS-2rD0T03bhM';

// Supabase client will be initialized when ready
let supabaseClient = null;

// Initialize Supabase client - called when DOM is ready
function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase client initialized successfully');
        return true;
    } else {
        console.error('Supabase SDK not loaded! Check if the CDN script is included before content-loader.js');
        return false;
    }
}

// Main function to load content
async function loadSiteContent() {
    if (!supabaseClient) return;

    try {
        // Fetch specific fields or the whole JSON
        const { data, error } = await supabaseClient
            .from('site_content')
            .select('content')
            .order('updated_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0 && data[0].content) {
            const content = data[0].content;
            console.log('Content fetched from Supabase:', content);
            updateDOM(content);
        }
    } catch (err) {
        console.error('Error fetching site content:', err);
    }
}

// Function to update DOM elements
function updateDOM(content) {
    // Helper function to safely update text (ID or data-dynamic)
    const setText = (key, value) => {
        // Try ID first
        const elId = document.getElementById(key);
        if (elId && value) elId.textContent = value;

        // Try data-dynamic attributes
        const dynamicEls = document.querySelectorAll(`[data-dynamic="${key}"]`);
        dynamicEls.forEach(el => {
            if (value) el.textContent = value;
        });
    };

    // Helper function to safely update images
    const setImage = (key, value) => {
        const elId = document.getElementById(key);
        if (elId && value) {
            elId.src = value.startsWith('data:') || value.startsWith('http') ? value : value;
        }

        // Data dynamic for images
        const dynamicEls = document.querySelectorAll(`[data-dynamic="${key}"]`);
        dynamicEls.forEach(el => {
            if (value) el.src = value.startsWith('data:') || value.startsWith('http') ? value : value;
        });
    };

    // --- Homepage ---
    if (content.homepage) {
        // Hero
        if (content.homepage.hero) {
            setText('home-hero-title', content.homepage.hero.title);
            setText('home-hero-subtitle', content.homepage.hero.subtitle);
            setText('home-hero-description', content.homepage.hero.description);
            setImage('home-hero-image', content.homepage.hero.image);
        }

        // Approach
        if (content.homepage.approach) {
            setText('home-approach-title', content.homepage.approach.title);
            setText('home-approach-description', content.homepage.approach.description);
            setImage('home-approach-image', content.homepage.approach.image);
        }
    }

    // --- About Page ---
    if (content.about) {
        if (content.about.hero) {
            setText('about-hero-title', content.about.hero.title);
            setText('about-hero-subtitle', content.about.hero.subtitle);
            setText('about-hero-quote', content.about.hero.quote);
            setImage('about-hero-image', content.about.hero.image);
        }
        if (content.about.journey) {
            setText('about-journey-text', content.about.journey.text);
            // Stats...
            if (content.about.journey.stats) {
                content.about.journey.stats.forEach((stat, i) => {
                    setText(`about-stat-val-${i}`, stat.value);
                    setText(`about-stat-label-${i}`, stat.label);
                });
            }
        }
        if (content.about.philosophy) {
            setText('about-philosophy-quote', content.about.philosophy.quote);
        }
    }

    // --- Settings (Contact) ---
    console.log('Checking settings:', content.settings);
    if (content.settings) {
        console.log('Settings found:', content.settings);
        setText('footer-brand-tagline', content.settings.tagline);

        // Get contact info - prefer top-level settings (always updated by Admin)
        // Fall back to nested contact object for backwards compatibility
        const contact = content.settings.contact || {};
        const email = content.settings.email || contact.email;
        const phone = content.settings.phone || contact.phone;
        const address = content.settings.address || contact.address;
        const building = content.settings.building || (content.settings.contact ? content.settings.contact.building : null);

        console.log('Contact data resolved:', { email, phone, address, building });

        if (email) setText('contact-email', `Email: ${email}`);
        if (phone) setText('contact-phone', `Phone: ${phone}`);
        if (address) setText('contact-address', address);
        if (building) setText('contact-building', building);

        // Business Hours
        if (content.settings.hours) {
            if (content.settings.hours.weekday) setText('hours-weekday', content.settings.hours.weekday);
            if (content.settings.hours.saturday) setText('hours-saturday', content.settings.hours.saturday);
            if (content.settings.hours.sunday) setText('hours-sunday', content.settings.hours.sunday);
        }

        console.log('Contact info updated on page');
    } else {
        console.warn('No settings object in content');
    }

    // --- Services Page ---
    if (content.services) {
        // Hero image
        if (content.services.heroImage) {
            setImage('services-hero-image', content.services.heroImage);
        }
        // Grid content
        if (content.services.items && document.getElementById('detailed-services-grid')) {
            renderDetailedServices(content.services.items);
        }
    }

    // --- Contact Page ---
    if (content.contact && content.contact.heroImage) {
        setImage('contact-hero-image', content.contact.heroImage);
    }

    // --- Book Page ---
    if (content.book && content.book.heroImage) {
        setImage('book-hero-image', content.book.heroImage);
    }

    // --- Videos Page ---
    if (content.videos && content.videos.heroImage) {
        setImage('videos-hero-image', content.videos.heroImage);
    }

    // --- Projects Page ---
    if (content.projectsPage && content.projectsPage.heroImage) {
        setImage('projects-hero-image', content.projectsPage.heroImage);
    }

    // --- Portfolio Page ---
    if (content.portfolioPage && content.portfolioPage.heroImage) {
        setImage('portfolio-hero-image', content.portfolioPage.heroImage);
    }

    // --- Gallery Page ---
    if (content.galleryPage && content.galleryPage.heroImage) {
        setImage('gallery-hero-image', content.galleryPage.heroImage);
    }

    // --- Privacy Page ---
    if (content.privacyPage && content.privacyPage.heroImage) {
        setImage('privacy-hero-image', content.privacyPage.heroImage);
    }

    // --- Projects Page ---
    if (content.projects && document.getElementById('projects-grid')) {
        renderProjects(content.projects);
    }

    // --- Portfolio Page ---
    if (content.portfolio) {
        if (content.portfolio.achievements && document.getElementById('achievements-grid')) {
            renderAchievements(content.portfolio.achievements);
        }
        if (content.portfolio.certifications && document.getElementById('certifications-grid')) {
            renderCertifications(content.portfolio.certifications);
        }
    }

    // --- Videos Page ---
    if (content.videos) {
        if (content.videos.featured) {
            const featuredSection = document.querySelector('.featured-video')?.closest('.section');
            if (content.videos.featured.url) {
                if (featuredSection) featuredSection.style.display = 'block';
                setText('featured-video-title', content.videos.featured.title);
                setText('featured-video-desc', content.videos.featured.description);
                // Handle featured video playback
                const featuredTag = document.querySelector('.featured-video-player');
                if (featuredTag) {
                    const isDirectFile = content.videos.featured.url.endsWith('.mp4') || content.videos.featured.url.startsWith('data:video');
                    featuredTag.onclick = () => {
                        if (isDirectFile) {
                            openVideoModal(content.videos.featured.url);
                        } else {
                            window.open(content.videos.featured.url, '_blank');
                        }
                    };
                    // Set thumbnail if available
                    if (content.videos.featured.thumbnail) {
                        featuredTag.style.backgroundImage = `url(${content.videos.featured.thumbnail})`;
                        featuredTag.style.backgroundSize = 'cover';
                    } else {
                        featuredTag.style.backgroundImage = 'none';
                    }
                }
            } else {
                // Hide the whole featured section if no URL
                if (featuredSection) featuredSection.style.display = 'none';
            }
        }
        if (content.videos.items && document.getElementById('videos-grid')) {
            renderVideos(content.videos.items);
        }
    }

    // --- Gallery Page ---
    if (content.gallery && document.getElementById('gallery-grid')) {
        renderGallery(content.gallery);
    }

    // --- FAQ Page ---
    if (content.faq && document.getElementById('faq-grid')) {
        renderFAQ(content.faq);
    }
}

function renderDetailedServices(services) {
    const container = document.getElementById('detailed-services-grid');
    if (!container || !services) return;

    container.innerHTML = services.map(service => `
        <div class="detailed-service-card">
            <div class="service-header">
                <div class="service-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                </div>
                <h3>${service.title}</h3>
            </div>
            <div class="service-content">
                <p class="service-description">${service.description}</p>
                <div class="service-details">
                    <h4>What to Expect:</h4>
                    <ul>
                        ${(service.expectations || []).map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="service-meta">
                    <div class="meta-item">
                        <span class="meta-label">Duration:</span>
                        <span class="meta-value">${service.duration}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Format:</span>
                        <span class="meta-value">${service.format}</span>
                    </div>
                </div>
            </div>
            <div class="service-footer">
                <a href="book.html?service=${encodeURIComponent(service.title)}" class="btn btn-primary">Book Session</a>
            </div>
        </div>
    `).join('');
}

function renderProjects(projects) {
    const container = document.getElementById('projects-grid');
    if (!container) return;
    container.innerHTML = projects.map(p => `
        <div class="project-card">
            <h3>${p.title}</h3>
            <p>${p.description}</p>
        </div>
    `).join('');
}

function renderAchievements(achievements) {
    const container = document.getElementById('achievements-grid');
    if (!container) return;
    container.innerHTML = achievements.map(a => `
        <div class="achievement-card">
            <h3>${a.title}</h3>
            <p>${a.description}</p>
        </div>
    `).join('');
}

function renderCertifications(certifications) {
    const container = document.getElementById('certifications-grid');
    if (!container) return;
    container.innerHTML = certifications.map(c => `
        <div class="certification-category">
            <h3>${c.category}</h3>
            <ul>
                ${c.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

function renderVideos(videos) {
    const container = document.getElementById('videos-grid');
    if (!container) return;

    container.innerHTML = videos.map(v => {
        const isDirectFile = v.url && (v.url.endsWith('.mp4') || v.url.startsWith('data:video'));
        const thumb = v.thumbnail || 'images/video-placeholder.jpg'; // Fallback

        return `
        <div class="video-card">
            <div class="video-thumbnail" style="background-image: url('${thumb}'); background-size: cover; background-position: center; cursor: pointer;" onclick="playVideo('${v.url}')">
                <div class="play-button">
                    <svg viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${v.title}</h3>
                <p class="video-description">${v.description || ''}</p>
                <div class="video-meta">
                    <span><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg> ${v.duration || 'N/A'}</span>
                    <span><svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" /></svg> ${v.date || ''}</span>
                </div>
            </div>
        </div>
    `}).join('');
}

// Global video playing functions
window.playVideo = (url) => {
    if (!url) return;
    const isDirectFile = url.endsWith('.mp4') || url.startsWith('data:video');
    if (isDirectFile) {
        openVideoModal(url);
    } else {
        window.open(url, '_blank');
    }
};

function openVideoModal(url) {
    let modal = document.getElementById('video-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'video-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content video-modal-content">
                <span class="close-modal" onclick="closeVideoModal()">&times;</span>
                <video id="modal-video-player" width="100%" controls autoplay>
                    <source src="" type="video/mp4">
                </video>
            </div>
        `;
        document.body.appendChild(modal);

        // Add basic styles if not present
        if (!document.getElementById('video-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'video-modal-styles';
            style.textContent = `
                .modal-overlay { position: fixed; top: 0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.9); display: none; alignt-items:center; justify-content:center; z-index: 9999; }
                .modal-overlay.active { display: flex; }
                .video-modal-content { position: relative; width: 90%; max-width: 1000px; }
                .close-modal { position: absolute; top: -40px; right: 0; color: white; font-size: 30px; cursor: pointer; }
            `;
            document.head.appendChild(style);
        }
    }

    const video = modal.querySelector('video');
    video.src = url;
    modal.classList.add('active');

    // Close on click outside
    modal.onclick = (e) => {
        if (e.target === modal) closeVideoModal();
    };
}

window.closeVideoModal = () => {
    const modal = document.getElementById('video-modal');
    if (modal) {
        const video = modal.querySelector('video');
        video.pause();
        video.src = "";
        modal.classList.remove('active');
    }
};

function renderGallery(items) {
    const container = document.getElementById('gallery-grid');
    if (!container) return;
    container.innerHTML = items.map(item => {
        const imgSrc = item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : item.image;
        return `
        <div class="gallery-item">
            <img src="${imgSrc}" alt="${item.title}">
            <div class="gallery-overlay">
                <h4>${item.title}</h4>
                <p>${item.category}</p>
            </div>
        </div>
    `}).join('');
}

function renderFAQ(faqs) {
    const container = document.getElementById('faq-grid');
    if (!container) return;
    container.innerHTML = faqs.map(f => `
        <div class="faq-item">
            <div class="faq-question">
                <h4>${f.question}</h4>
                <span class="faq-toggle">+</span>
            </div>
            <div class="faq-answer">
                <p>${f.answer}</p>
            </div>
        </div>
    `).join('');
}

// Run on load
// Update copyright year
function updateCopyrightYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// Main initialization function
function init() {
    console.log('Content loader initializing...');

    // Initialize Supabase client
    if (initSupabase()) {
        // Load content from Supabase
        loadSiteContent();
    }

    // Update copyright year
    updateCopyrightYear();
}

// Run on DOM ready or immediately if already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}
