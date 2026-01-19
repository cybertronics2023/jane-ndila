// content-loader.js
// Handles fetching content from Supabase and updating the DOM

// Configuration - REPLACE THESE WITH YOUR SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://avezwecbtvtkbtctsbzh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZXp3ZWNidHZ0a2J0Y3RzYnpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTk1MDEsImV4cCI6MjA4NDM5NTUwMX0.qa-Tnzl37ts25QAtQ_ek6BljCo-ndZjS-2rD0T03bhM';

// Initialize Supabase Client
let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase client initialized');
} else {
    console.warn('Supabase not configured. Content will not be loaded from cloud.');
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
        console.log('Settings found, contact:', content.settings.contact);
        setText('footer-brand-tagline', content.settings.tagline);
        if (content.settings.contact) {
            const email = content.settings.contact.email;
            const phone = content.settings.contact.phone;
            const address = content.settings.contact.address;
            console.log('Contact data:', { email, phone, address });

            setText('contact-email', `Email: ${email}`);
            setText('contact-phone', `Phone: ${phone}`);
            setText('contact-address', address);

            console.log('Contact info updated on page');
        } else {
            console.warn('No contact data in settings');
        }
    } else {
        console.warn('No settings object in content');
    }

    // --- Services Page ---
    if (content.services && document.getElementById('detailed-services-grid')) {
        renderDetailedServices(content.services.items);
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
            setText('featured-video-title', content.videos.featured.title);
            setText('featured-video-desc', content.videos.featured.description);
            // Handle video URL if needed (iframe src)
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
    container.innerHTML = videos.map(v => `
        <div class="video-card">
            <h4>${v.title}</h4>
            <p>${v.duration} • ${v.date || ''}</p>
        </div>
    `).join('');
}

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

// Run on load
document.addEventListener('DOMContentLoaded', () => {
    loadSiteContent();
    updateCopyrightYear();
});
