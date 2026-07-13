export function injectFooter() {
    const CACHE_KEY = 'footer_settings_cache';

    // 1. STALE: Load immediately from cache if it exists
    const cached = localStorage.getItem(CACHE_KEY);
    renderFooter(cached ? JSON.parse(cached) : null);

    // 2. REVALIDATE: Fetch in background
    fetchLatestData().then(data => {
        if (data) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            renderFooter(data);
        }
    });
}

function renderFooter(settings) {
    const existing = document.querySelector('footer');
    if (existing) existing.remove();

    // Auto-detect active tab based on current URL
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    const tabs = [
        { name: 'Home', icon: '🏠', id: 'home', link: 'index.html' },
        { name: 'Menu', icon: '📋', id: 'dashboard', link: 'admin-menu.html' },
        { name: 'Product', icon: '🛍️', id: 'demo', link: 'admin-product-manager.html' },
        { name: 'Settings', icon: '⚙️', id: 'settings', link: 'admin-settings.html' }
    ];

    // Find which tab matches the current page
    const activeTabObj = tabs.find(t => t.link === currentPath) || tabs[0];

    const footer = document.createElement('footer');
    footer.setAttribute('oncontextmenu', 'return false;'); 
    footer.style.cssText = `
        position: fixed; bottom: 0; left: 0; width: 100%; height: 75px; 
        background: #ffffff; display: flex; justify-content: space-around; 
        align-items: center; z-index: 9999; border-top: 2px solid #eee;
        -webkit-touch-callout: none; -webkit-user-select: none;
    `;

    footer.innerHTML = tabs.map(tab => `
        <div id="tab-${tab.id}" class="footer-tab" style="
            display: flex; flex-direction: column; align-items: center; 
            font-size: 11px; font-weight: 900; 
            color: ${activeTabObj.id === tab.id ? '#0984e3' : '#636e72'};
            cursor: pointer; gap: 5px;
        ">
            <span style="font-size: 22px;">${tab.icon}</span>
            ${tab.name.toUpperCase()}
        </div>
    `).join('');

    document.body.append(footer);
    document.body.style.paddingBottom = "85px";

    tabs.forEach(tab => {
        document.getElementById(`tab-${tab.id}`).onclick = () => {
            if (activeTabObj.id !== tab.id) location.href = tab.link;
        };
    });
}

async function fetchLatestData() {
    return { lastUpdated: Date.now() }; 
}

