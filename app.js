// Awesome Selfhosted - Main Application

let currentCategory = 'all';
let searchQuery = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    renderContent();
    setupEventListeners();
    setupTheme();
    setupScrollTop();
});

// Render Sidebar Navigation
function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    const categories = Object.keys(softwareData);

    let html = '';

    // All Categories link
    const totalCount = Object.values(softwareData).reduce((a, b) => a + b.length, 0);
    html += `
        <div class="nav-section">
            <a href="#" class="nav-header active" data-category="all" onclick="filterCategory('all'); return false;">
                <span>All Categories</span>
                <span class="nav-count">${totalCount}</span>
            </a>
        </div>
    `;

    // Group categories
    const groups = {
        'Content & Media': ['Blogging Platforms', 'Media Streaming', 'Photo & Video Galleries', 'RSS & Feed Readers'],
        'Communication': ['Communication', 'Mail'],
        'Productivity': ['Note-taking & Editors', 'Office & Productivity', 'Project Management', 'Calendars & Contacts'],
        'Infrastructure': ['VPN & Networking', 'Cloud Storage', 'Monitoring', 'Security & Privacy', 'Download Managers'],
        'Development': ['IDE & Code Editors', 'Database Management', 'Search Engines', 'Pastebins', 'URL Shorteners'],
        'Business': ['Analytics', 'Finance', 'Content Management'],
        'Tools': ['File Sharing & Synchronization', 'Password Managers', 'Bookmarks & Link Sharing', 'Automation'],
        'Other': ['Games', 'Maps & GPS']
    };

    for (const [groupName, groupCats] of Object.entries(groups)) {
        const groupItems = groupCats.filter(cat => categories.includes(cat));
        if (groupItems.length === 0) continue;

        const groupCount = groupItems.reduce((sum, cat) => sum + softwareData[cat].length, 0);

        html += `<div class="nav-section">`;
        html += `<div class="nav-header" onclick="toggleSection(this)">`;
        html += `<span>${groupName}</span>`;
        html += `<i class="fas fa-chevron-down"></i>`;
        html += `</div>`;
        html += `<ul class="nav-items">`;

        for (const cat of groupItems) {
            const count = softwareData[cat].length;
            html += `
                <li>
                    <a href="#${slugify(cat)}" data-category="${cat}" onclick="filterCategory('${cat}'); return false;">
                        ${cat}
                        <span class="nav-count">${count}</span>
                    </a>
                </li>
            `;
        }

        html += `</ul></div>`;
    }

    nav.innerHTML = html;
}

// Render Main Content
function renderContent() {
    const container = document.getElementById('content-area');
    const categories = Object.keys(softwareData);

    let html = '';

    // Page header
    html += `
        <div class="page-header">
            <h1>🚀 Awesome Selfhosted</h1>
            <p>A curated list of awesome self-hosted software. Run your own services and take control of your data.</p>
            <div class="stats-bar">
                <div class="stat-item"><i class="fas fa-layer-group"></i> ${categories.length} Categories</div>
                <div class="stat-item"><i class="fas fa-box"></i> ${Object.values(softwareData).reduce((a,b) => a+b.length, 0)} Projects</div>
                <div class="stat-item"><i class="fas fa-code-branch"></i> Open Source</div>
                <div class="stat-item"><i class="fas fa-shield-alt"></i> Privacy Focused</div>
            </div>
        </div>
    `;

    // Filter and render categories
    const filteredCategories = getFilteredCategories();

    if (filteredCategories.length === 0) {
        html += `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try adjusting your search terms or category filter.</p>
            </div>
        `;
    } else {
        for (const category of filteredCategories) {
            const items = getFilteredItems(category);
            if (items.length === 0) continue;

            html += `
                <div class="section-header" id="${slugify(category)}">
                    <h2>${category}</h2>
                    <span class="count">${items.length}</span>
                </div>
                <div class="cards-grid">
                    ${items.map((item, idx) => renderCard(item, idx)).join('')}
                </div>
            `;
        }
    }

    // Footer
    html += `
        <footer class="site-footer">
            <p>Built with ❤️ | Data based on <a href="https://awesome-selfhosted.net" target="_blank">awesome-selfhosted.net</a></p>
            <p>This is a replica for educational purposes. All software belongs to their respective owners.</p>
        </footer>
    `;

    container.innerHTML = html;
    updateActiveNav();
}

// Render a single card
function renderCard(item, idx) {
    const delay = idx * 50;
    return `
        <div class="card" style="animation-delay: ${delay}ms">
            <div class="card-header">
                <div class="card-title">
                    <div class="card-icon">${item.icon}</div>
                    <a href="${item.url}" target="_blank" rel="noopener">${item.name}</a>
                </div>
                ${item.stars !== 'N/A' ? `
                    <div class="card-stars">
                        <i class="fas fa-star"></i>
                        ${item.stars}
                    </div>
                ` : ''}
            </div>
            <div class="card-description">${item.description}</div>
            <div class="card-footer">
                <div class="card-tags">
                    <span class="tag license">${item.license}</span>
                    <span class="tag language">${item.language}</span>
                    <span class="tag platform">${item.platform}</span>
                </div>
                <div class="card-links">
                    <a href="${item.url}" target="_blank" rel="noopener">
                        <i class="fas fa-external-link-alt"></i> Website
                    </a>
                    <a href="${item.source}" target="_blank" rel="noopener">
                        <i class="fab fa-github"></i> Source
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Get filtered categories based on search
function getFilteredCategories() {
    const categories = Object.keys(softwareData);
    if (!searchQuery) return categories;

    return categories.filter(cat => {
        const items = softwareData[cat];
        return items.some(item => matchesSearch(item, searchQuery));
    });
}

// Get filtered items for a category
function getFilteredItems(category) {
    const items = softwareData[category];
    if (!searchQuery) return items;
    return items.filter(item => matchesSearch(item, searchQuery));
}

// Check if item matches search
function matchesSearch(item, query) {
    const q = query.toLowerCase();
    return item.name.toLowerCase().includes(q) ||
           item.description.toLowerCase().includes(q) ||
           item.language.toLowerCase().includes(q) ||
           item.license.toLowerCase().includes(q) ||
           item.platform.toLowerCase().includes(q);
}

// Filter by category
function filterCategory(category) {
    currentCategory = category;

    if (category === 'all') {
        searchQuery = '';
        document.getElementById('search-input').value = '';
    }

    renderContent();
    updateActiveNav();

    // Close mobile menu
    document.querySelector('.sidebar').classList.remove('open');
    document.querySelector('.overlay').classList.remove('active');

    // Scroll to top
    document.querySelector('.content').scrollTop = 0;
}

// Update active nav item
function updateActiveNav() {
    document.querySelectorAll('.nav-items a, .nav-header').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.category === currentCategory) {
            link.classList.add('active');
        }
    });
}

// Toggle sidebar section
function toggleSection(header) {
    header.parentElement.classList.toggle('collapsed');
}

// Setup event listeners
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value.trim();
            currentCategory = 'all';
            renderContent();
            updateActiveNav();
        }, 300);
    });

    // Mobile menu
    document.querySelector('.menu-toggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('open');
        document.querySelector('.overlay').classList.toggle('active');
    });

    document.querySelector('.overlay').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.remove('open');
        document.querySelector('.overlay').classList.remove('active');
    });

    // Theme toggle
    document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
}

// Theme management
function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const btn = document.querySelector('.theme-toggle');
    btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Scroll to top
function setupScrollTop() {
    const btn = document.querySelector('.scroll-top');
    const content = document.querySelector('.content');

    content.addEventListener('scroll', () => {
        if (content.scrollTop > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        content.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Utility: slugify
function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
