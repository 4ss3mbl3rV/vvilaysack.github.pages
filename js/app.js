/**
 * Personal Portfolio - Main Application
 * A single-page application with theme toggle and Medium blog integration
 * Compatible with regular browsers and in-app browsers (Telegram, Messenger, etc.)
 */

// ============================================
// Configuration
// ============================================

const CONFIG = {
    // Replace with your Medium username (without @)
    MEDIUM_USERNAME: 'vvilaysack',

    // Replace with your actual social links
    GITHUB_URL: 'https://github.com/4ss3mbl3rV',
    LINKEDIN_URL: 'https://linkedin.com/in/vilaysack-vorachack',
    MEDIUM_URL: 'https://medium.com/@vvilaysack',

    // User info
    USER_NAME: 'Your Name',
    USER_INITIALS: 'YN',

    // RSS2JSON API endpoint (free tier)
    RSS2JSON_API: 'https://api.rss2json.com/v1/api.json',

    // Fetch timeout in milliseconds
    FETCH_TIMEOUT: 10000,
};

// ============================================
// Storage Utility (handles in-app browser restrictions)
// ============================================

const StorageUtil = {
    _isAvailable: null,

    isAvailable() {
        if (this._isAvailable !== null) return this._isAvailable;

        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            this._isAvailable = true;
        } catch (e) {
            this._isAvailable = false;
        }
        return this._isAvailable;
    },

    get(key) {
        if (!this.isAvailable()) return null;
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    },

    set(key, value) {
        if (!this.isAvailable()) return false;
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            return false;
        }
    },

    remove(key) {
        if (!this.isAvailable()) return false;
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// ============================================
// Fetch with Timeout (for slow/unstable connections)
// ============================================

async function fetchWithTimeout(url, options = {}, timeout = CONFIG.FETCH_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// ============================================
// Theme Management
// ============================================

const ThemeManager = {
    STORAGE_KEY: 'portfolio-theme',
    _currentTheme: null, // In-memory fallback when storage unavailable

    init() {
        // Check if user has a saved preference
        const savedTheme = this.getSavedTheme();

        if (savedTheme) {
            // User has set a preference before, use it
            this.applyTheme(savedTheme);
        } else {
            // No preference set, detect from system theme
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.applyTheme(prefersDark ? 'dark' : 'light');
        }

        // Listen for system theme changes (only applies if user hasn't set a preference)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.getSavedTheme()) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    },

    getSavedTheme() {
        // Try storage first, fall back to in-memory
        return StorageUtil.get(this.STORAGE_KEY) || this._currentTheme;
    },

    saveTheme(theme) {
        // Save to storage if available, always keep in-memory copy
        this._currentTheme = theme;
        StorageUtil.set(this.STORAGE_KEY, theme);
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this._currentTheme = theme;
    },

    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        // Save user's preference when they manually toggle
        this.saveTheme(newTheme);
    },

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme');
    }
};

// ============================================
// Router (SPA Navigation)
// ============================================

const Router = {
    pages: ['home', 'about', 'certifications', 'projects', 'blog'],

    init() {
        // Handle initial load
        this.navigate(this.getHashPage());

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.navigate(this.getHashPage());
        });

        // Handle navigation link clicks
        document.querySelectorAll('[data-link]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                const page = href.replace('#', '') || 'home';
                window.location.hash = page;
            });
        });
    },

    getHashPage() {
        const hash = window.location.hash.replace('#', '');
        return this.pages.includes(hash) ? hash : 'home';
    },

    navigate(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active', 'fade-in');
        });

        // Show target page
        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.classList.add('active', 'fade-in');
        }

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${page}`) {
                link.classList.add('active');
            }
        });

        // Close mobile menu if open
        const navLinks = document.getElementById('navLinks');
        const hamburger = document.getElementById('hamburger');
        if (navLinks && hamburger) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }

        // Fetch blog posts when navigating to blog page
        if (page === 'blog') {
            BlogManager.fetchPosts();
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// ============================================
// Mobile Navigation
// ============================================

const MobileNav = {
    init() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                }
            });
        }
    }
};

// ============================================
// Avatar Image Fallback
// ============================================

const AvatarManager = {
    init() {
        const avatarImages = document.querySelectorAll('.avatar-image');

        avatarImages.forEach(img => {
            // Handle image load error
            img.addEventListener('error', () => {
                img.classList.add('hidden');
            });

            // Check if image exists
            if (!img.complete) {
                img.addEventListener('load', () => {
                    img.classList.remove('hidden');
                });
            } else if (img.naturalWidth === 0) {
                img.classList.add('hidden');
            }
        });

        // Update initials
        const initialsElements = document.querySelectorAll('.avatar-initials');
        initialsElements.forEach(el => {
            el.textContent = CONFIG.USER_INITIALS;
        });
    }
};

// ============================================
// Blog Manager (Medium RSS Feed)
// ============================================

const BlogManager = {
    postsLoaded: false,
    cachedPosts: null, // In-memory cache for current session

    async fetchPosts() {
        // Check if already fetched this session (use in-memory cache)
        if (this.cachedPosts) {
            this.renderPosts(this.cachedPosts);
            return;
        }

        const blogGrid = document.getElementById('blogGrid');
        const blogLoading = document.getElementById('blogLoading');
        const blogError = document.getElementById('blogError');
        const blogCta = document.getElementById('blogCta');

        if (!blogGrid || this.postsLoaded) return;

        // Show loading state
        if (blogLoading) blogLoading.style.display = 'flex';
        if (blogError) blogError.style.display = 'none';
        if (blogCta) blogCta.style.display = 'none';

        try {
            const feedUrl = `https://medium.com/feed/@${CONFIG.MEDIUM_USERNAME}`;
            const apiUrl = `${CONFIG.RSS2JSON_API}?rss_url=${encodeURIComponent(feedUrl)}`;

            const response = await fetchWithTimeout(apiUrl);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();

            if (data.status !== 'ok' || !data.items || data.items.length === 0) {
                throw new Error('No posts found');
            }

            // Cache posts in memory only (avoids localStorage issues in in-app browsers)
            this.cachedPosts = data.items;

            this.renderPosts(data.items);

        } catch (error) {
            console.error('Error fetching Medium posts:', error);
            this.showError();
        }
    },

    renderPosts(posts) {
        const blogGrid = document.getElementById('blogGrid');
        const blogLoading = document.getElementById('blogLoading');
        const blogError = document.getElementById('blogError');
        const blogCta = document.getElementById('blogCta');

        if (!blogGrid) return;

        // Hide loading, show CTA
        if (blogLoading) blogLoading.style.display = 'none';
        if (blogError) blogError.style.display = 'none';
        if (blogCta) blogCta.style.display = 'block';

        // Clear existing posts (except loading and error elements)
        const existingCards = blogGrid.querySelectorAll('.blog-card');
        existingCards.forEach(card => card.remove());

        // Render up to 4 posts
        const displayPosts = posts.slice(0, 4);

        displayPosts.forEach((post, index) => {
            const card = this.createPostCard(post, index);
            blogGrid.appendChild(card);
        });

        // Update Medium profile link
        const mediumProfileLink = document.getElementById('mediumProfileLink');
        if (mediumProfileLink) {
            mediumProfileLink.href = `https://medium.com/@${CONFIG.MEDIUM_USERNAME}`;
        }

        this.postsLoaded = true;
    },

    createPostCard(post, index) {
        const card = document.createElement('article');
        card.className = 'blog-card';
        card.style.animationDelay = `${0.1 + index * 0.1}s`;

        // Detect Lao language in title or content
        const isLao = this.containsLao(post.title) || this.containsLao(post.description);
        if (isLao) {
            card.classList.add('lang-lao');
        }

        // Extract thumbnail
        let thumbnail = post.thumbnail || '';
        if (!thumbnail) {
            // Try to extract from content
            const imgMatch = post.content?.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) {
                thumbnail = imgMatch[1];
            }
        }

        // Format date
        const pubDate = new Date(post.pubDate);
        const formattedDate = pubDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Estimate read time (average 200 words per minute)
        const wordCount = post.content ? post.content.replace(/<[^>]+>/g, '').split(/\s+/).length : 0;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));

        // Clean excerpt
        let excerpt = post.description || '';
        excerpt = excerpt.replace(/<[^>]+>/g, '').trim();
        if (excerpt.length > 150) {
            excerpt = excerpt.substring(0, 150) + '...';
        }

        card.innerHTML = `
            ${thumbnail ? `<img src="${thumbnail}" alt="${this.escapeHtml(post.title)}" class="blog-card-image" loading="lazy">` : ''}
            <div class="blog-card-content">
                <div class="blog-meta">
                    <span class="blog-date">${formattedDate}</span>
                    <span class="blog-read-time">${readTime} min read</span>
                </div>
                <h3 class="blog-title">${this.escapeHtml(post.title)}</h3>
                <p class="blog-excerpt">${this.escapeHtml(excerpt)}</p>
                <a href="${post.link}" class="blog-link" target="_blank" rel="noopener noreferrer">
                    Read on Medium
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </a>
            </div>
        `;

        return card;
    },

    showError() {
        const blogLoading = document.getElementById('blogLoading');
        const blogError = document.getElementById('blogError');
        const blogCta = document.getElementById('blogCta');

        if (blogLoading) blogLoading.style.display = 'none';
        if (blogError) blogError.style.display = 'flex';
        if (blogCta) blogCta.style.display = 'none';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Detect if text contains Lao characters (Unicode range U+0E80 to U+0EFF)
    containsLao(text) {
        if (!text) return false;
        const laoPattern = /[\u0E80-\u0EFF]/;
        return laoPattern.test(text);
    }
};

// ============================================
// Certifications Manager (YAML-based)
// ============================================

const CertificationsManager = {
    certsLoaded: false,

    async init() {
        await this.fetchCertifications();
    },

    async fetchCertifications() {
        const certGrid = document.getElementById('certGrid');
        const certLoading = document.getElementById('certLoading');
        const certError = document.getElementById('certError');

        if (!certGrid || this.certsLoaded) return;

        // Show loading state
        if (certLoading) certLoading.style.display = 'flex';
        if (certError) certError.style.display = 'none';

        try {
            // Fetch the YAML file with timeout
            const response = await fetchWithTimeout('data/certifications.yml');
            if (!response.ok) {
                throw new Error('Failed to load data/certifications.yml');
            }

            const yamlText = await response.text();

            // Parse YAML using js-yaml library
            const data = jsyaml.load(yamlText);

            if (!data || !data.certifications || data.certifications.length === 0) {
                throw new Error('No certifications found in YAML');
            }

            this.renderCertifications(data.certifications);

        } catch (error) {
            console.error('Error loading certifications:', error);
            this.showError();
        }
    },

    renderCertifications(certifications) {
        const certGrid = document.getElementById('certGrid');
        const certLoading = document.getElementById('certLoading');
        const certError = document.getElementById('certError');

        if (!certGrid) return;

        // Hide loading
        if (certLoading) certLoading.style.display = 'none';
        if (certError) certError.style.display = 'none';

        // Clear existing cards
        const existingCards = certGrid.querySelectorAll('.cert-card');
        existingCards.forEach(card => card.remove());

        // Render each certification
        certifications.forEach((cert, index) => {
            const card = this.createCertCard(cert, index);
            certGrid.appendChild(card);
        });

        // Update certification count on About page
        const statCertifications = document.getElementById('statCertifications');
        if (statCertifications) {
            statCertifications.textContent = certifications.length;
        }

        this.certsLoaded = true;
    },

    createCertCard(cert, index) {
        const card = document.createElement('article');
        card.className = 'cert-card';
        card.style.animationDelay = `${0.1 + index * 0.1}s`;

        // Determine status class
        const statusClass = cert.status?.toUpperCase() === 'ACTIVE' ? 'active' : 'expired';
        const statusText = cert.status?.toUpperCase() || 'ACTIVE';

        // Build verify button HTML
        let verifyHtml = '';
        if (cert.verify_url) {
            verifyHtml = `
                <a href="${this.escapeHtml(cert.verify_url)}" class="cert-verify-btn" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Verify
                </a>
            `;
        }

        card.innerHTML = `
            <div class="cert-card-header">
                <span class="cert-badge ${statusClass}">${statusText}</span>
                <span class="cert-year">${this.escapeHtml(cert.year?.toString() || '')}</span>
            </div>
            <div class="cert-badge-image">
                <img src="${this.escapeHtml(cert.badge || '')}" alt="${this.escapeHtml(cert.name)} Badge" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="cert-badge-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="8" r="6"></circle>
                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                    </svg>
                </div>
            </div>
            <h3 class="cert-name">${this.escapeHtml(cert.name)}</h3>
            <p class="cert-issuer">${this.escapeHtml(cert.issuer || '')}</p>
            ${verifyHtml}
        `;

        return card;
    },

    showError() {
        const certLoading = document.getElementById('certLoading');
        const certError = document.getElementById('certError');

        if (certLoading) certLoading.style.display = 'none';
        if (certError) certError.style.display = 'flex';
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================
// Projects Manager (YAML-based)
// ============================================

const ProjectsManager = {
    projectsLoaded: false,

    async init() {
        await this.fetchProjects();
    },

    async fetchProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        const projectsLoading = document.getElementById('projectsLoading');
        const projectsError = document.getElementById('projectsError');

        if (!projectsGrid || this.projectsLoaded) return;

        // Show loading state
        if (projectsLoading) projectsLoading.style.display = 'flex';
        if (projectsError) projectsError.style.display = 'none';

        try {
            // Fetch the YAML file with timeout
            const response = await fetchWithTimeout('data/projects.yml');
            if (!response.ok) {
                throw new Error('Failed to load data/projects.yml');
            }

            const yamlText = await response.text();

            // Parse YAML using js-yaml library
            const data = jsyaml.load(yamlText);

            if (!data || !data.projects || data.projects.length === 0) {
                throw new Error('No projects found in YAML');
            }

            this.renderProjects(data.projects);

        } catch (error) {
            console.error('Error loading projects:', error);
            this.showError();
        }
    },

    renderProjects(projects) {
        const projectsGrid = document.getElementById('projectsGrid');
        const projectsLoading = document.getElementById('projectsLoading');
        const projectsError = document.getElementById('projectsError');

        if (!projectsGrid) return;

        // Hide loading
        if (projectsLoading) projectsLoading.style.display = 'none';
        if (projectsError) projectsError.style.display = 'none';

        // Clear existing cards
        const existingCards = projectsGrid.querySelectorAll('.project-card');
        existingCards.forEach(card => card.remove());

        // Render each project
        projects.forEach((project, index) => {
            const card = this.createProjectCard(project, index);
            projectsGrid.appendChild(card);
        });

        // Update project count on About page
        const statProjects = document.getElementById('statProjects');
        if (statProjects) {
            statProjects.textContent = projects.length;
        }

        this.projectsLoaded = true;
    },

    createProjectCard(project, index) {
        const card = document.createElement('article');
        card.className = 'project-card';
        card.style.animationDelay = `${0.1 + index * 0.1}s`;

        // Build tags HTML
        const tagsHtml = project.tags
            ? project.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')
            : '';

        // Build links HTML
        let linksHtml = '';
        if (project.links) {
            if (project.links.github) {
                linksHtml += `
                    <a href="${this.escapeHtml(project.links.github)}" class="project-link" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                        GitHub
                    </a>
                `;
            }
            if (project.links.demo) {
                linksHtml += `
                    <a href="${this.escapeHtml(project.links.demo)}" class="project-link" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        Live Demo
                    </a>
                `;
            }
        }

        // Determine status class
        const statusClass = project.status?.toLowerCase() === 'completed' ? 'completed' : 'active';

        card.innerHTML = `
            <div class="project-card-header">
                <span class="project-category">${this.escapeHtml(project.category || 'Project')}</span>
                <span class="project-status ${statusClass}">${this.escapeHtml(project.status || 'Active')}</span>
            </div>
            <h3 class="project-name">${this.escapeHtml(project.name)}</h3>
            <p class="project-description">${this.escapeHtml(project.description || '')}</p>
            <div class="project-tags">${tagsHtml}</div>
            <div class="project-links">${linksHtml}</div>
        `;

        return card;
    },

    showError() {
        const projectsLoading = document.getElementById('projectsLoading');
        const projectsError = document.getElementById('projectsError');

        if (projectsLoading) projectsLoading.style.display = 'none';
        if (projectsError) projectsError.style.display = 'flex';
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================
// Footer Year
// ============================================

const FooterManager = {
    init() {
        const yearElement = document.getElementById('currentYear');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
};

// ============================================
// Event Listeners
// ============================================

function initEventListeners() {
    // Theme toggle (desktop)
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            ThemeManager.toggle();
        });
    }

    // Theme toggle (mobile) - unified touch/click handling for all browsers
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    if (mobileThemeToggle) {
        let touchHandled = false;
        let touchMoved = false;

        // Touch events for mobile devices
        mobileThemeToggle.addEventListener('touchstart', () => {
            touchMoved = false;
            touchHandled = false;
        }, { passive: true });

        mobileThemeToggle.addEventListener('touchmove', () => {
            touchMoved = true;
        }, { passive: true });

        mobileThemeToggle.addEventListener('touchend', (e) => {
            if (!touchMoved) {
                e.preventDefault();
                touchHandled = true;
                ThemeManager.toggle();
            }
        });

        // Click event as fallback (works for mouse and some in-app browsers)
        mobileThemeToggle.addEventListener('click', (e) => {
            // Only handle if touch didn't already handle it
            if (!touchHandled) {
                e.preventDefault();
                e.stopPropagation();
                ThemeManager.toggle();
            }
            // Reset flag for next interaction
            touchHandled = false;
        });
    }
}

// ============================================
// Initialize Application
// ============================================

function init() {
    // Initialize theme first (prevents flash)
    ThemeManager.init();

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMReady);
    } else {
        onDOMReady();
    }
}

function onDOMReady() {
    // Initialize all modules
    Router.init();
    MobileNav.init();
    AvatarManager.init();
    FooterManager.init();
    CertificationsManager.init();
    ProjectsManager.init();
    initEventListeners();

    // Add loaded class to body for any initial animations
    document.body.classList.add('loaded');
}

// Start the application
init();
